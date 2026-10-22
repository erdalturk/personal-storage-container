-- ============================================================================
-- KİŞİSEL DİJİTAL DEPO — SUPABASE POSTGRESQL ŞEMASI & RLS POLİTİKALARI
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. PROFİLLER TABLOSU (auth.users ile senkron)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_initials TEXT DEFAULT 'KD',
  master_pin_hash TEXT,
  pin_failed_attempts INT DEFAULT 0,
  pin_locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DEPOLAR TABLOSU (Standart ve Akıllı Depolar)
CREATE TABLE IF NOT EXISTS public.containers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- 'text', 'movie', 'code', 'travel', 'study', 'audio', 'media', 'files'
  is_smart BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPO İÇERİKLERİ TABLOSU (8 depoya ait tüm öğeler - JSONB Metadata)
CREATE TABLE IF NOT EXISTS public.container_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  container_id TEXT REFERENCES public.containers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  item_type TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYLAŞILAN BAĞLANTILAR TABLOSU (Salt Okunur Vitrin & Token Yönetimi)
CREATE TABLE IF NOT EXISTS public.shared_links (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  item_title TEXT NOT NULL,
  container_name TEXT NOT NULL,
  type TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'item', -- 'item' veya 'container'
  views INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  snapshot_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ÇÖP KUTUSU TABLOSU (Geri Dönüşüm & 30 Günlük Otomatik Temizlik)
CREATE TABLE IF NOT EXISTS public.trash_items (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  origin_container TEXT NOT NULL,
  type TEXT NOT NULL,
  content_preview TEXT,
  payload JSONB DEFAULT '{}'::JSONB,
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.containers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.container_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trash_items ENABLE ROW LEVEL SECURITY;

-- Profiller: Kullanıcı sadece kendi profilini görür ve günceller
CREATE POLICY "Users can manage own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Depolar: Kullanıcı sadece kendi depolarını yönetebilir
CREATE POLICY "Users can manage own containers" ON public.containers
  FOR ALL USING (auth.uid() = user_id);

-- İçerikler: Kullanıcı sadece kendi depo içeriklerini yönetebilir
CREATE POLICY "Users can manage own items" ON public.container_items
  FOR ALL USING (auth.uid() = user_id);

-- Çöp Kutusu: Kullanıcı sadece kendi silinenlerini yönetebilir
CREATE POLICY "Users can manage own trash" ON public.trash_items
  FOR ALL USING (auth.uid() = user_id);

-- Paylaşılan Bağlantılar:
-- 1. Sahibi olan kullanıcı her şeyi yapabilir
CREATE POLICY "Users can manage own shared links" ON public.shared_links
  FOR ALL USING (auth.uid() = user_id);

-- 2. Dışarıdaki anonim ziyaretçiler yalnızca AKTİF (is_active = true) olanları okuyabilir
CREATE POLICY "Public can view active shared links" ON public.shared_links
  FOR SELECT USING (is_active = true);

-- ============================================================================
-- YENİ KULLANICI TETİKLEYİCİSİ (Otomatik Profil ve Başlangıç Akıllı Depoları)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Profil satırı oluştur
  INSERT INTO public.profiles (id, email, full_name, avatar_initials)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    UPPER(SUBSTRING(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), 1, 2))
  );

  -- Kullanıcıya varsayılan 4 temel akıllı depoyu oluştur
  INSERT INTO public.containers (user_id, title, description, type, is_smart, icon)
  VALUES
    (NEW.id, 'Sinema Kulübü & Başyapıtlar', 'Kişisel film ve dizi koleksiyonu', 'movie', true, 'Film'),
    (NEW.id, 'Yapay Zekâ & Algoritmalar Dersi', 'Ders notları, özetler ve sınav kartları', 'study', true, 'GraduationCap'),
    (NEW.id, 'Gezi & Seyahat Anıları', 'Ziyaret edilen şehirler ve rotalar', 'travel', true, 'Compass'),
    (NEW.id, 'Kod Parçacıkları & Snippet''lar', 'Tekrar kullanılabilir algoritmalar ve çözümler', 'code', true, 'Code2');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth tablosuna trigger bağla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test Kolaylığı İçin: İstenirse e-posta onayını otomatik geçmek için:
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;
