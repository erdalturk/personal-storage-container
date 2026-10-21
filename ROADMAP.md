# Kişisel Depo — 7 Günlük Hızlı MVP Teslimat Planı (21 – 27 Ekim 2026)

**Proje:** Kişisel Dijital Depo (Personal Storage Container)  
**Başlangıç Tarihi:** 21 Ekim 2026 (Bugün)  
**Hedef MVP Lansmanı (Deadline):** 27 Ekim 2026 (Salı)  
**Toplam Süre:** Tam 7 Gün  

---

## 📅 Gün Gün Yeniden Düzenlenmiş MVP Teslimat Takvimi

| Gün / Tarih | Durum | Odak / Sprint Hedefi | Teslim Edilecek Özellikler |
| :--- | :---: | :--- | :--- |
| **1. Gün (21 Ekim - Bugün)** | ✅ **Tamamlandı** | **PWA Mobil Kurulumu & Dinamik PIN Güvenliği** | • PWA doğrulaması (`manifest.json`, `sw.js` offline önbellek, "Uygulamayı Yükle" banner'ı)<br>• Dinamik Depo PIN (kullanıcının kendi PIN'ini belirlemesi & brute-force kilitlenme koruması) |
| **2. Gün (22 Ekim - Yarın)** | ⏳ **Aktif** | **Karanlık Mod & Zengin Dışa Aktarma** | • OLED uyumlu Dark Mode (Açık/Koyu tema geçişi)<br>• Şiir ve notları `.md` / `.pdf`, kodları `.py` / `.ts` olarak tekil veya ZIP indirme |
| **3. Gün (23 Ekim - Cuma)** | 📋 Planlandı | **Bulut Veritabanı & Güvenli Kimlik Doğrulama (Supabase)** | • PostgreSQL şeması ve RLS güvenlik politikaları<br>• Supabase Auth: Güvenli e-posta ile giriş & ücretsiz/yasal şifre sıfırlama (KVKK uyumlu)<br>• `localStorage` ile hibrit çalışan kesintisiz bulut senkronizasyonu |
| **4. Gün (24 Ekim - Cumartesi)** | 📋 Planlandı | **Canlı TMDB Film/Dizi API'si** | • Film ararken The Movie Database (TMDB) API'den anında gerçek afiş, özet, yönetmen ve puan çekme |
| **5. Gün (25 Ekim - Pazar)** | 📋 Planlandı | **Gerçek Medya Depolama (Storage)** | • Kullanıcının kendi cihazından gerçek ses dosyası (MP3/WAV), fotoğraf ve PDF dökümanı yükleyebilmesi |
| **6. Gün (26 Ekim - Pazartesi)** | 📋 Planlandı | **Sürükle-Bırak & E2E Testler** | • Klasörlere sürükle-bırak (Drag & Drop), toplu seçim/silme ve Playwright ile tam otomatik tarayıcı testleri |
| **7. Gün (27 Ekim - Salı)** | 🚀 **Hedef** | **MVP FINAL RELEASE (Lansman)** | • **Üretim ortamı (Vercel) canlı yayını, son güvenlik kontrolleri ve Müşteri Kabul Onayı** |

---

## 👥 Roller ve Sorumluluklar

| Rol | Sorumlu | Temel Odak |
| :--- | :--- | :--- |
| **Product Owner (Müşteri)** | **Siz (Kullanıcı)** | İş önceliklerini onaylama, kabul kriterlerini değerlendirme, özellik yönlendirmesi. |
| **Scrum Master** | **Antigravity** | Sprint planlama, görevleri parçalama, blokajları kaldırma, mimari standartları koruma. |
| **Development Team** | **Antigravity & Subagent Ekipleri** | Kod yazımı, UI/UX tasarımı, test otomasyonu, entegrasyonlar. |

---

## 🏃 1. Gün (21 Ekim - Bugün) Kapsamı: PWA ve Dinamik PIN Güvenliği

1. **PWA & Mobil Uyumluluk:**
   - [x] Web App Manifest (`public/manifest.json`)
   - [x] Offline Service Worker (`public/sw.js`)
   - [x] Branded App İkonları (`icon-192.svg`, `icon-512.svg`)
   - [x] "Kişisel Depo'yu Yükle" Banner'ı (`PwaRegister.tsx`)
2. **Dinamik Depo PIN Güvenliği:**
   - [x] Sabit 1234 yerine kullanıcının kendi Master PIN'ini belirleyebilmesi (`setMasterPin`, `verifyMasterPin`, `changeMasterPin`)
   - [x] Hatalı deneme kısıtlaması (5 deneme sonrası 30 sn brute-force kilitlenme koruması)
   - [x] Kilit açma modalından ilk kurulum & Profil sayfasından PIN yönetimi
   - [x] Otomatik birim testleri (`tests/appStore.test.mjs` - 7/7 başarılı)

---

## 💡 İleriye Dönük Geliştirme & Ölçeklenme Fikir Havuzu (Future Backlog)

MVP sonrasında veya ileride ölçeklenirken kullanılmak üzere ayrılan fikir havuzu:

1. **SMS Tabanlı 2FA & Şifre Sıfırlama:**
   - Twilio / Netgsm operatör entegrasyonu, profil telefon numarası bağlama ve İYS/KVKK açık rıza onay mekanizmaları.
2. **Süreli ve Parolalı Paylaşım Linkleri:**
   - Paylaşılan vitrin linklerine 24 saat / 3 gün / 7 gün otomatik süre kısıtı ve parola doğrulama ekranı ekleme.
3. **Yapay Zekâ Entegrasyonları:**
   - Ses kayıtları için Whisper API ile otomatik Türkçe transkript dökümü.
   - Ders notlarından tek tıkla otomatik soru-cevap ezber kartları (Flashcards) çıkarma.
4. **Uçtan Uca İstemci Şifreleme (E2EE):**
   - Web Crypto API ile hassas depoları (sözleşmeler, özel notlar) istemcide AES-GCM ile şifreleme.
5. **Kişisel Hafıza Analitiği (Wrapped Dashboard):**
   - Spotify Wrapped / Duolingo tarzı "Bu ay ne kadar arşivledin?" özet paneli.
