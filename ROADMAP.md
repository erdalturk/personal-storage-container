# Kişisel Depo — 7 Günlük Hızlı MVP Teslimat Planı (21 – 27 Ekim 2026)

**Proje:** Kişisel Dijital Depo (Personal Storage Container)  
**Başlangıç Tarihi:** 21 Ekim 2026 (Bugün)  
**Hedef MVP Lansmanı (Deadline):** 27 Ekim 2026 (Salı)  
**Toplam Süre:** Tam 7 Gün  

---

## 📅 Gün Gün Yeniden Düzenlenmiş MVP Teslimat Takvimi

| Gün / Tarih | Durum | Odak / Sprint Hedefi | Teslim Edilen & Edilecek Özellikler |
| :--- | :---: | :--- | :--- |
| **1. Gün (21 Ekim)** | ✅ **Tamamlandı** | **PWA Mobil Kurulumu & Dinamik PIN Güvenliği** | • PWA doğrulaması (`manifest.json`, `sw.js` offline önbellek, "Uygulamayı Yükle" banner'ı)<br>• Dinamik Master PIN (brute-force kilitlenme koruması, profil PIN yönetimi) |
| **2. Gün (22 Ekim)** | ✅ **Tamamlandı** | **Karanlık Mod & Zengin Dışa Aktarma & UX Suite** | • OLED uyumlu Dark Mode (Açık/Koyu tema geçişi)<br>• 8 depoda çalışan gerçek ikili (binary) fotoğraf/ses/PDF indirme ve dinamik paylaşım yönlendirmesi |
| **3. Gün (23 Ekim)** | ✅ **Tamamlandı (Erken)** | **Bulut Veritabanı & Güvenli Kimlik Doğrulama (Supabase)** | • PostgreSQL şeması ve RLS güvenlik politikaları (`supabase/schema.sql`)<br>• Hibrit çalışan kesintisiz bulut senkronizasyonu (`syncService.ts`) ve profil rozeti |
| **4. Gün (24 Ekim)** | ✅ **Tamamlandı (Erken)** | **Canlı TMDB Film/Dizi API'si** | • Canlı TMDB API entegrasyonu (`/api/movies/search`) ile tek tıkla Türkçe afiş, yönetmen, puan ve konu özeti çekme |
| **5. Gün (25 Ekim)** | ✅ **Tamamlandı (Erken)** | **Evrensel Dosya & Medya Yükleme (Universal Upload)** | • Tüm 8 depoda ve ana sayfa Dropzone'unda cihazdan gerçek dosya yükleme (`.py, .md, .txt, .mp3, .wav, .pdf, .docx, .pptx, .jpg, .png, .mp4`) |
| **6. Gün (26 Ekim)** | 🔄 **Sıradaki Sprint** | **4 Fonksiyonel Kapanış & Detaylı Fine-Tuning** | • **1. Klasör Yeniden Adlandırma:** Depo içi klasörlerin adını değiştirme (`Rename Folder`)<br>• **2. Depo Sıralama Motoru:** Ana sayfada Alfabetik (A-Z), Son Güncelleme ve Manuel sıralamayı bağlama<br>• **3. Çöp Kutusu Süre Ayarı:** 15, 30 veya 60 günlük otomatik saklama süresi tercihi<br>• **4. Toplu Seçim & Silme:** Listelerde çoklu seçim ile toplu silme<br>• **5. Kullanıcı İncelemesi & Rötuşlar:** UI/UX ince ayarları ve görsel düzeltmeler |
| **7. Gün (27 Ekim)** | 🚀 **HEDEF (DEADLINE)** | **MVP FINAL RELEASE (Lansman)** | • **Üretim ortamı (Vercel) canlı yayını, son güvenlik kontrolleri ve Müşteri Kabul Onayı** |

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
