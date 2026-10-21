# Kişisel Depo — 7 Günlük Hızlı MVP Teslimat Planı (Fast-Track Roadmap)

**Proje:** Kişisel Dijital Depo (Personal Storage Container)  
**Metodoloji:** Agile / Scrum (Günlük Hızlı Teslimat Döngüleri)  
**Hedef MVP Lansmanı (Deadline):** 27 Ekim 2026  
**Durum:** 21 Ekim Görevi Devam Ediyor (Sprint Day 2)

---

## 📅 Gün Gün Teslimat Planı (20 – 27 Ekim 2026)

| Tarih | Durum | Odak / Sprint Hedefi | Çıktı / Teslim Edilecek Özellik |
| :--- | :---: | :--- | :--- |
| **20 Ekim (Dün)** | ✅ **Tamamlandı** | **Mobil & PWA Deneyimi** | Telefona yerel uygulama gibi kurulabilme (`manifest.json`, Service Worker `sw.js`), çevrimdışı önbellek desteği, PWA yükleme banner'ı. |
| **21 Ekim (Bugün)** | ⏳ **Şu Anki Görev** | **Kişisel Güvenlik & Süreli Paylaşım** | Kullanıcının kendi 4-6 haneli PIN'ini belirlemesi, paylaşılan vitrin linklerine parola ve süre sınırı (örn: 24 saat, 3 gün, 7 gün) koyabilme. |
| **22 Ekim (Yarın)** | 📋 Sırada | **Karanlık Mod & İndirme Seçenekleri** | OLED uyumlu Dark Mode, notları `.md`/`.pdf` ve kodları `.py`/`.ts` olarak tekil veya ZIP indirme. |
| **23 Ekim (Cuma)** | 📋 Planlandı | **Bulut Veritabanı (Supabase)** | PostgreSQL + RLS entegrasyonu (mevcut `localStorage` ile hibrit çalışarak kesintisiz veri kalıcılığı). |
| **24 Ekim (Cumartesi)** | 📋 Planlandı | **Canlı API (TMDB Film/Dizi)** | Film deposunda film ararken The Movie Database (TMDB) API'den anında gerçek afiş, özet ve puan çekme. |
| **25 Ekim (Pazar)** | 📋 Planlandı | **Gerçek Medya Yükleme (Storage)** | Kullanıcının kendi cihazından gerçek ses dosyası (MP3/WAV), fotoğraf ve PDF dökümanı yükleyebilmesi. |
| **26 Ekim (Pazartesi)** | 📋 Planlandı | **Kullanıcı Jestleri & E2E Testler** | Klasörlere sürükle-bırak (Drag & Drop), toplu seçim/silme ve Playwright ile tam otomatik tarayıcı testleri. |
| **🎯 27 Ekim (Salı)** | 🚀 **Hedef** | **MVP FINAL RELEASE (Lansman)** | **Üretim ortamı (Vercel) canlı yayını, son güvenlik kontrolleri ve Müşteri Kabul Onayı.** |

---

## 👥 Roller ve Sorumluluklar

| Rol | Sorumlu | Temel Odak |
| :--- | :--- | :--- |
| **Product Owner (Müşteri)** | **Siz (Kullanıcı)** | İş önceliklerini onaylama, kabul kriterlerini değerlendirme, özellik yönlendirmesi. |
| **Scrum Master** | **Antigravity** | Sprint planlama, görevleri parçalama, blokajları kaldırma, mimari standartları koruma. |
| **Development Team** | **Antigravity & Subagent Ekipleri** | Kod yazımı, UI/UX tasarımı, test otomasyonu, entegrasyonlar. |

---

## 📊 MoSCoW Önceliklendirme Matrisi

- 🔴 **Must Have (Mutlaka Olmalı):** Dinamik PIN/Şifreleme, PWA Mobil Kurulumu, Bulut Veritabanı (Supabase) ve Gerçek Medya Yükleme.
- 🟡 **Should Have (Olsa Çok İyi Olur):** Canlı TMDB API, Süreli/Şifreli Paylaşım Linkleri, Karanlık Mod, Sürükle & Bırak.
- 🟢 **Could Have (Zaman Kalırsa):** AI Transkript (Whisper), AI Flashcard Üretici, Spotify Wrapped tarzı Kişisel Hafıza İstatistikleri.
- ⚪ **Won't Have (Bu Sürümde Yok):** Sosyal medya akışları, takipçi/beğeni mekanizmaları (Kişisel depo felsefesi gereği kapsam dışı).

---

## 🏃 21 Ekim (Bugünkü Görev) Detayları: Kişisel Güvenlik & Süreli Paylaşım

**Tarih:** 21 Ekim 2026  
**Hedef:** Sabit PIN yerine dinamik kullanıcı PIN'i ve paylaşılan linklere isteğe bağlı süre/parola koruması eklemek.

| ID | Görev / User Story | Öncelik | Kabul Kriteri (DoD) |
| :--- | :--- | :---: | :--- |
| **SP-2.1** | **Dinamik Depo PIN Belirleme & Kriptolama** | 🔴 Must | Kullanıcı 1234 yerine kendi 4-6 haneli PIN'ini belirleyebilmeli, yanlış denemede kilitlenmeli. |
| **SP-2.2** | **Süreli Paylaşım Linkleri (24s / 3g / 7g)** | 🟡 Should | Paylaşırken "24 saat sonra kapansın" seçilebilmeli; süresi dolunca "Süre Doldu" ekranı çıkmalı. |
| **SP-2.3** | **Parolalı Paylaşım Vitrini** | 🟡 Should | İsteğe bağlı şifre koyulabilmeli, `/share/[token]` açıldığında doğru parola girilmeden içerik görünmemeli. |
| **SP-2.4** | **Profil Güvenlik Paneli & Paylaşım Rozetleri** | 🟡 Should | `/profile` sayfasında "PIN Değiştir" alanı ve paylaşılan linklerde `⏳ Süreli` / `🔒 Parolalı` rozetleri olmalı. |
| **SP-2.5** | **Otomatik Birim Testleri** | 🔴 Must | `tests/appStore.test.mjs` içinde PIN doğrulama, süre aşımı ve parola kontrol testlerinin yeşil geçmesi. |

---

## 📌 Bitti Tanımı (Definition of Done - DoD)
Bir görevin tamamlanmış ("Done") kabul edilmesi için aşağıdaki kriterleri sağlaması zorunludur:
1. İlgili TypeScript kodlarının `npm run build` ile sıfır hatayla derlenmesi.
2. Otomatik birim testlerinin (`npm test`) başarıyla geçmesi.
3. Mobil ve masaüstü tarayıcılarda görsel responsive testinin yapılmış olması.
4. Kodların GitHub ana dalına (`origin/main`) temiz commit mesajıyla gönderilmesi.
5. Müşteriye (Product Owner) canlı çalışır örneğin sunulması ve onay alınması.
