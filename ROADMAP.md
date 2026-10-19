# Kişisel Depo (Personal Storage Container) — Yol Haritası ve Görevler (Roadmap & Tasks)

Bu belge, **Kişisel Depo** projesinin şu ana kadar tamamlanan aşamalarını ve projenin bir sonraki seviyeye (üretim/production, bulut entegrasyonu, yapay zekâ ve mobil deneyim) taşınması için ihtiyaç duyulabilecek tüm görevleri kapsamlı biçimde listeler.

---

## 📌 Durum Özeti (Mevcut Durum)

- [x] **8 Deponun Tamamı Hazır (4 Standart + 4 Akıllı Özel):**
  - [x] Film & Dizi Deposu (`/containers/movie`)
  - [x] Gece Düşünceleri & Şiirlerim (`/containers/text`)
  - [x] Frontend & Fullstack Snippet'lar (`/containers/code`)
  - [x] Gezi & Seyahat Anıları (`/containers/travel`)
  - [x] Yapay Zekâ & Algoritmalar Dersi (`/containers/study`)
  - [x] Sesli Notlar & Podcast Fikirleri (`/containers/audio`)
  - [x] Tasarım İlhamları & Fotoğraf Arşivi (`/containers/media`)
  - [x] Sözleşmeler, Faturalar & Belgelerim (`/containers/files`)
- [x] **30 Günlük Çöp Kutusu & Geri Yükleme (`/trash`)**
- [x] **Salt Okunur Paylaşım Vitrini (`/share/[token]`) & Dinamik İptal / Güvenlik Kontrolleri**
- [x] **Profil, Dış Bağlantı Yönetimi & Oturumu Kapat (`/profile`)**
- [x] **Giriş & Kayıt Ekranı (`/login`)**
- [x] **Global Arama & Hızlı Komut Paleti (`Ctrl + K`)**
- [x] **Tam Arşiv JSON Dışa / İçe Aktarma (`.json` Yedekleme)**
- [x] **Otomatik Test Paketi (`tests/appStore.test.mjs` - 5/5 Başarılı)**

---

## 🚀 Faz 1: Gerçek Backend & Bulut Veritabanı Entegrasyonu (Persistence)

Şu anda tüm veriler tarayıcı hafızasında (`localStorage`) reaktif store üzerinden çalışmaktadır. Çoklu cihaz senkronizasyonu ve gerçek kalıcılık için planlanan görevler:

- [ ] **1.1. Supabase / PostgreSQL Entegrasyonu**
  - [ ] Veritabanı şeması oluşturma (`users`, `containers`, `items`, `folders`, `trash`, `shared_links`).
  - [ ] Row Level Security (RLS) politikaları ile her kullanıcının yalnızca kendi verilerini okuyup yazmasını sağlama.
  - [ ] İstemci tarafındaki `appStore.ts` fonksiyonlarını Supabase Client ile senkronize hale getirme (çevrimdışı desteğiyle hibrit yapı).
- [ ] **1.2. Gerçek Kimlik Doğrulama (Auth Provider)**
  - [ ] Supabase Auth veya NextAuth (Auth.js) entegrasyonu.
  - [ ] Gerçek Google OAuth ve GitHub OAuth sağlayıcılarının bağlanması.
  - [ ] E-posta doğrulama ve şifre sıfırlama e-postaları (Magic Link veya OTP).
- [ ] **1.3. Bulut Dosya & Medya Depolama (S3 / Supabase Storage)**
  - [ ] Kullanıcıların kendi cihazlarından gerçek MP3/WAV ses dosyalarını yükleyebilmesi.
  - [ ] Gerçek RAW/JPG/PNG fotoğrafların yüklenmesi ve otomatik küçük resim (thumbnail) oluşturulması.
  - [ ] Gerçek PDF belgelerinin yüklenmesi ve tarayıcıda dahili PDF görüntüleyici ile açılması.

---

## 🔐 Faz 2: İleri Düzey Güvenlik ve Gizlilik (Security & Privacy)

- [ ] **2.1. Dinamik Depo PIN / Parola Yönetimi**
  - [ ] Kullanıcının kilitli depolar için kendi özel PIN veya şifresini belirleyebilmesi.
  - [ ] PIN'lerin bcrypt / argon2 ile hash'lenerek saklanması.
  - [ ] Hatalı deneme sınırlaması (Rate limiting / Brute-force koruması).
- [ ] **2.2. Uçtan Uca Şifreleme (E2EE — Client-Side Encryption)**
  - [ ] Web Crypto API kullanılarak hassas depoların (örn. Sözleşmeler veya Kişisel Notlar) anahtarının yalnızca kullanıcının şifresinden türetilmesi.
  - [ ] Sunucunun bile içeriği okuyamayacağı sıfır bilgi (Zero-Knowledge) mimarisi.
- [ ] **2.3. Paylaşım Bağlantılarına Gelişmiş Güvenlik Kriterleri**
  - [ ] Paylaşılan linke isteğe bağlı parola koyabilme ("Bu link şifrelidir").
  - [ ] Süre sınırı koyabilme ("24 saat sonra", "7 gün sonra" otomatik geçerliliğini yitirme).
  - [ ] Maksimum görüntülenme sayısı limiti ("10 kişi görüntüledikten sonra kapat").

---

## 🧠 Faz 3: Yapay Zekâ (AI) ve Akıllı Entegrasyonlar

- [ ] **3.1. Film Deposu için Canlı TMDB Entegrasyonu**
  - [ ] Film adı yazıldığında The Movie Database (TMDB) API'den afiş, yönetmen, oyuncular, tür ve puanın otomatik çekilmesi.
- [ ] **3.2. Ses Deposu için Yapay Zekâ Transkripti (Speech-to-Text)**
  - [ ] Yüklenen veya kaydedilen ses dosyalarının OpenAI Whisper / Gemini Audio API ile otomatik olarak Türkçe metne dönüştürülmesi.
- [ ] **3.3. Ders Notları Deposu için AI Çalışma Kartı Üretici**
  - [ ] Eklenen uzun ders özeti veya PDF metninden tek tıkla otomatik soru-cevap Flashcard'ları çıkarma.
- [ ] **3.4. Kod Deposu için Kod İnceleme & Açıklama**
  - [ ] Kod parçacığının karmaşıklığını hesaplama, optimize etme veya çalışma mantığını özetleme.

---

## 🎨 Faz 4: Kullanıcı Deneyimi, Mobil & PWA (UX & Mobile)

- [ ] **4.1. Progressive Web App (PWA) Desteği**
  - [ ] `manifest.json` ve Service Worker ekleyerek uygulamanın telefon ve masaüstüne yerel uygulama gibi kurulabilmesi.
  - [ ] İnternet bağlantısı koptuğunda çevrimdışı (offline) okuma ve sonrasında senkronize olma.
- [ ] **4.2. Karanlık Mod (Dark Mode)**
  - [ ] Sistem tercihine uyumlu veya kullanıcı tarafından seçilebilen açık/koyu tema desteği.
- [ ] **4.3. Sürükle & Bırak (Drag & Drop)**
  - [ ] İçerikleri sürükleyerek klasörler arasında taşıma.
  - [ ] Ana sayfada depo kartlarının sırasını manuel olarak yeniden düzenleyebilme.
- [ ] **4.4. Toplu İşlemler (Batch Operations)**
  - [ ] Çoklu seçim modu (aynı anda 10 fotoğrafı silme veya 5 belgeyi farklı bir klasöre aktarma).

---

## 📊 Faz 5: Analitik, SEO ve Dışa Aktarma Çeşitliliği

- [ ] **5.1. Zengin Dışa Aktarma Seçenekleri**
  - [ ] Notları ve şiirleri `.md` (Markdown) veya `.pdf` olarak tekil indirme.
  - [ ] Kod parçacıklarını kendi uzantısında (`.py`, `.sql`, `.ts`) indirme.
  - [ ] Tüm arşivi ZIP paketi olarak klasör hiyerarşisiyle indirme.
- [ ] **5.2. Paylaşım Sayfaları için Dinamik OpenGraph (OG Meta Tags)**
  - [ ] `/share/[token]` bağlantısı WhatsApp, Twitter veya LinkedIn'de paylaşıldığında içerik afişini ve açıklamasını gösteren zengin önizleme kartları.
- [ ] **5.3. Kişisel Hafıza İstatistikleri (Dashboard & Insights)**
  - [ ] "Bu ay 14 yeni içerik kaydettin", "En çok film biriktirdin", "Toplam 48 saatlik ses arşivi" gibi Duolingo/Spotify Wrapped tarzı mikro istatistikler.

---

## 🧪 Faz 6: Test Kapsamını Genişletme (Testing & QA)

- [ ] **6.1. E2E (End-to-End) Testleri (Playwright / Cypress)**
  - [ ] Kullanıcının `/login` sayfasından giriş yapıp, yeni bir depo açması ve içerik eklemesini baştan sona test etme.
  - [ ] `Ctrl + K` komut paletinin klavye etkileşimlerini otomatik simüle etme.
- [ ] **6.2. Mobil Tarayıcı Testleri**
  - [ ] iOS Safari ve Android Chrome dokunmatik jestleri, alt gezinme çubuğu uyumluluğu.
