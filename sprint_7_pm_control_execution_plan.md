# Sprint 7: PM-CONTROL %100 Kapsamlı Uygulama ve İnce Ayar Planı (Maksimum 2 Gün)

## 🎯 1. Hedef ve Kapsam
Bu plan, kullanıcının [PM-CONTROL.md](file:///C:/Users/hp/Desktop/personal%20storage%20container/PM-CONTROL.md) dosyasında bizzat test ederek listelediği **78 maddenin tamamını** eksiksiz ve birebir karşılayan 2 günlük uygulama planıdır.

Kullanıcının kesin talimatları:
1. **İş Akışı Prensibi:** Hiçbir adım bir sonrakini çöpe atmayacak. Bu sebeple **Kimlik, Kullanıcı Veri İzolasyonu (`user_id_*`), Evrensel Modal / ESC ve Gerçek Dosya Blob Altyapısı 1. Günde tamamlanacak**; tüm depolar bu sağlam temel üzerine 2. Günde inşa edilecektir.
2. **Film 3'lü Değerlendirme:** Kullanıcının onayladığı döngü uygulanacaktır:
   `○ Değerlendirilmedi` ➔ `🏆 Başyapıt` ➔ `🍿 Mid` ➔ `🥱 Zaman Kaybı` ➔ `○ Sıfırla`.
3. **Süre Sınırı:** Maksimum **2 günlük sprint**.

---

## 🔍 2. PM-CONTROL.md Birebir Madde Takip Matrisi (%100 Kapsam)

Aşağıdaki tablo, `PM-CONTROL.md` dosyasındaki tüm maddelerin hangi gün ve modülde çözüme kavuşturulacağını gösterir:

| PM-CONTROL Satır No & Konu | İstenen Eylem / Problem | Çözüm & Karşılık Gelen Sprint Adımı |
| :--- | :--- | :--- |
| **Satır 3 — Logo Etiketi** | Logonun kenarındaki "container" etiketi kaldırılmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — `Header.tsx` ve `page.tsx`'ten etiket kaldırılacak. |
| **Satır 4 — Çöp Kutusu İkonu** | Çöp kutusu ikonu üzerindeki kırmızı nokta uyarı bildirimi gibi gözüküyor, kaldırılmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — Header'daki kırmızı rozet (`bg-rose-500 dot`) kaldırılacak. |
| **Satır 5 — Evrensel Yükleyici Etiketleri** | Desteklenen dosya türleri etiketleri çok kalabalık ve oto yönlendirme etiketi kaldırılmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — Dropzone altındaki kalabalık etiketler temizlenecek. |
| **Satır 6 — Evrensel Yükleyici Akışı** | Oto yönlendirmeden ziyade tavsiye gibi olmalı, kullanıcı vazgeçebilmeli veya başka depo seçebilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — Dosya bırakıldığında "Tavsiye Edilen Depo: [X] — Yükle / Başka Depo Seç / İptal" modalı açılacak. |
| **Satır 7 — "Hemen Oluştur" Butonu** | Zaten kurulu depoların altında yer alan "Hemen Oluştur" yanıltıcı, kaldırılmalı veya sadece ilk kez kuruluyorsa gösterilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — Kurulu depoların altında bu buton gizlenecek. |
| **Satır 8 — Manuel Sıralama** | Manuel sıralama diğer sıralamalarla aynı listede olmamalı; ekrandaki tuşlarla bağımsız yönetilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — "Manuel" açılır listeden çıkarılacak; kartlar üzerindeki kaydırma butonlarıyla ayrılacak. |
| **Satır 9 — Depo Banner & Yeniden Adlandırma** | Depoların banner/kapak resimleri ve isimleri kurulumda ve sonrasında düzenlenebilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — Depo Düzenleme Modalı (Başlık, Açıklama, Gradyan/Kapak Görseli yükleme). |
| **Satır 10 — Depo Kurulum Aşaması** | Hem standart hem akıllı depolarda ilk kullanımda kurulum ekranı olmalı, sonradan değiştirilebilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — Yeni depo başlatıldığında Ad, Açıklama ve Kapak belirleme sihirbazı. |
| **Satır 11 — Sıralama Filtreleri & Yön Butonu** | Son güncelleme, Alfabetik, İçerik sayısı seçenekleri + Yandaki simge aktif Artan/Azalan yön butonuna dönüştürülmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — `containerSortUtils.ts` ve sıralama yönü toggle butonu. |
| **Satır 12-15 — resim1/2/3 & Profil Popover** | Kırmızı buton developer ortamı mı? Profil mantığı bu butondaki gibi popover açılır menü olmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — Next Dev rozeti canlıda kalkar. Profil butonu popover menüye dönüştürülür. |
| **Satır 16-17 — Global Arama Tıklama Yönlendirmesi** | Depoya tıklandığında depo, içeriğe tıklandığında içerik açılmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — Komut paletinde tipe göre ayrık yönlendirme. |
| **Satır 18 — Arama Filtre Etiket Hatası** | Film etiketine tıklandığında Görsel deposundaki içerik gelmesi hatası giderilmeli. | **GÜN 2 / Modül 3 (Adım 2.1)** — `searchAllItems` filtreleme eşleşmesi düzeltilecek. |
| **Satır 19 — 8 Kesin Depo Türü Filtresi** | Filtreler düzensiz; sadece 8 depo türünün etiketi olsun: Film, Kod, Gezi, Ders, Metin, Ses, Görsel, Belge. | **GÜN 2 / Modül 3 (Adım 2.1)** — Arama çubuğunda 8 kesin depo tipi çipi. |
| **Satır 20 — Standart Depo Tab/Yön Tuşları** | Standart depo oluşturda Tab ve yön tuşlarıyla 4 depo arasında gezinilebilmeli; mevcut depoyla devam et seçeneği olmalı. | **GÜN 2 / Modül 3 (Adım 2.1)** — Klavye odak desteği ve "Mevcut Depoyla Devam Et" aksiyonu. |
| **Satır 21 — Akıllı Depo Tekrar Kurulum Uyarısı** | Zaten kurulmuş bir akıllı depoyu tekrar kurmak isterse uyarı verilmeli (mevcutla devam et / sıfırla). | **GÜN 2 / Modül 3 (Adım 2.1)** — Akıllı depo çakışma uyarı modalı. |
| **Satır 22 — Kilitli Depo PIN Modalı ESC** | Kilitli depoya tıklandığında açılan PIN modalı ESC tuşuyla kapatılabilmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — `useEscKey` hook'u ile PIN modalı ESC ile kapanır. |
| **Satır 27 — Film Deposu Sıralama** | Anasayfa için belirtilen sıralama ve aktif yön butonu film deposuna da uygulanmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — İsim, Puan, Yıl sıralaması ve Artan/Azalan yön butonu. |
| **Satır 28-33 — Film 3'lü Değerlendirme** | İyi, Kötü, Çirkin alternatifi: 1. Başyapıt, 2. Mid, 3. Zaman Kaybı + 4. tık sıfırlama. | **GÜN 2 / Modül 4 (Adım 2.2)** — Film kartlarında 4 tıklamalı döngüsel değerlendirme butonu. |
| **Satır 34 — Film Arama Yanı Filtre Butonu** | Arama yanına filtreleme butonu (Tür, İzlenme, Değerlendirme, Yıl). | **GÜN 2 / Modül 4 (Adım 2.2)** — Film filtre çekmecesi / modalı. |
| **Satır 35 — Fragmanı İzle Butonu** | Poster üzerinde pasif "Fragmanı İzle" butonu + "Bu özellik yakında eklenecektir" tooltip'i. | **GÜN 2 / Modül 4 (Adım 2.2)** — Film detay modalına şık pasif fragman butonu. |
| **Satır 36 — Film İzlenme Kuralı** | İzlenmeden favorilere eklenemez; aynı anda hem izlendi hem izleme listesinde olamaz. | **GÜN 2 / Modül 4 (Adım 2.2)** — `handleToggleFavorite` ve durum kontrollerine kural kilidi. |
| **Satır 37, 41, 43 — Film İndirme Pasife Alma** | Arşiv indir ve kaydı indir pasife alınmalı; indirmedeki sahte geri alma toast'ı kaldırılmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — `featureFlags.ts` ile pasife park edilir; toast temizlenir. |
| **Satır 38 — Manuel Film "Yerel Kayıt" Etiketi** | Yerel eklenen filmlerin kartında "Yerel Kayıt" rozeti gösterilmeli. | **GÜN 2 / Modül 4 (Adım 2.2)** — `isLocal: true` filmlerde kart üzerinde yeşil rozet. |
| **Satır 39 — Yerel Film Düzenleme** | Yerel kayıt ile eklenen filmlerin bilgileri kayıt ekranındaki gibi güncellenebilmeli. | **GÜN 2 / Modül 4 (Adım 2.2)** — Yerel film düzenleme modalı (`handleEditLocalMovie`). |
| **Satır 40 — Virgül / Nokta Rating Düzeltmesi** | Film eklerken 3,2 gibi virgüllü puan girildiğinde noktaya çevrilmeli, tam sayıya yuvarlanmamalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — `val.replace(",", ".")` parse kuralı. |
| **Satır 42 — "Dizi" İfadesinin Kaldırılması** | Film ve Dizi deposundan "Dizi" çıkarılmalı; anasayfaya planlanan yol haritası kartı konulmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — "Film Deposu"na dönüştürme ve "Yakında: Dizi Deposu" yol haritası kartı. |
| **Satır 44 — Film Deposu "Depoyu Paylaş"** | Film deposu içine "Depoyu Paylaş" butonu eklenmeli. | **GÜN 2 / Modül 4 (Adım 2.2)** — Üst başlığa "Depoyu Paylaş" aksiyonu. |
| **Satır 50 — Kod Deposu Aydınlık Mod Kontrastı** | Koyu başlık/filtre şeridi aydınlık modda okunabilirlik sorunu yaratıyor (`image-3.png`). | **GÜN 1 / Modül 2 (Adım 1.2)** — Başlık şeridi ve etiket contrast CSS/Tailwind sınıfları düzeltilecek. |
| **Satır 51 — Kod Deposu Etiket Filtrelerini Kaldırma** | Etiketlerin filtre gibi kullanılmasına gerek yok, filtre şeridi ve kaydırma çubuğu kaldırılmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — Snippet dil filtreleri korunur, gereksiz alt etiket çubuğu kaldırılır. |
| **Satır 52 — Kod Deposu "Anahtar Kelimeler"** | Yeni kod eklerken "Etiketler" yerine "Anahtar Kelimeler" kullanılmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — Modal formundaki etiket input'u "Anahtar Kelimeler"e çevrilir. |
| **Satır 53 — Kod Deposu GitHub Butonu** | Kod eklerken isteğe bağlı GitHub bağlantısı alanı + kart üzerinde yeni sekmede açan GitHub simgesi. | **GÜN 2 / Modül 4 (Adım 2.2)** — `githubUrl` alanı ve kart üzerinde GitHub butonu. |
| **Satır 54 — Kod Deposu ESC & Değişiklik Teyidi** | Yeni kod ve düzenle pencereleri ESC ile kapatılabilmeli; değişiklik varsa onay sorulmalı. | **GÜN 1 / Modül 2 (Adım 1.2)** — `useEscKey(isOpen, onClose, isDirty)` entegrasyonu. |
| **Satır 55 — Kod Deposu Paylaşım & Flaş Hatası** | Depoyu paylaşa tıklayınca içerik silinmiş uyarısı ve anlık flaş onarılmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — Senkron token çözümleme ve kesin ID eşleme. |
| **Satır 56 — Kod Deposu Sahte İndirme Bildirimi** | Gerçekten indirilmediğinde veya iptal edildiğinde sağ altta "İndirildi" bildirimi gelmemeli. | **GÜN 2 / Modül 4 (Adım 2.2)** — Erken toast tetikleyicisi kaldırılacak. |
| **Satır 61 — Gezi Deposu ESC ile Kapatma** | İçerik detay penceresi ESC tuşuyla kapatılabilmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — `useEscKey` entegrasyonu. |
| **Satır 62 — Gezi Deposu 4 KPI Kartı** | 4 KPI kartı neye göre ölçülüyor açıklaması plana dahil edilmeli. | **Açıklandı:** Keşfedilen Ülke, Kayıtlı Rota, Gezilen Duraklar, Favoriler. |
| **Satır 63 — Gezi Deposu Sıralama** | Anasayfadaki sıralama ve yön butonu mantığı gezi deposuna da uygulanmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — Tarih, Puan, İsim sıralaması ve yön toggle butonu. |
| **Satır 64 — Gezi Deposu Favoriler Sekmesi** | Favori işaretlenen gezileri bir arada görebileceğimiz özel Favoriler sekmesi/filtresi. | **GÜN 2 / Modül 4 (Adım 2.2)** — "Favoriler ⭐" sekmesi görünür ve işlevsel hale getirilecek. |
| **Satır 65 — Gezi Deposu Paylaşım Hatası** | Depo paylaşımındaki "içerik silinmiş" hatası ve anlık flaş giderilmeli. | **GÜN 1 / Modül 2 (Adım 1.4)** — Merkezi paylaşım token onarımı. |
| **Satır 66-70 — Gezi Deposu Okunabilirlik/Dark Mode** | Rota kayıt modalı ve arama çubuğundaki beyaz üstüne beyaz yazı kontrastı düzeltilmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — Modal formuna `bg-white dark:bg-slate-900` ve `text-slate-900 dark:text-slate-100` sınıfları. |
| **Satır 68 — Güvenilir Şehir ve Ülke Ototamamlayıcı** | Rota kayıt ekranında şehir ve ülke için güvenilir veri tabanından arama/seçim desteği (81 il + ülkeler). | **GÜN 2 / Modül 4 (Adım 2.2)** — `src/lib/geoData.ts` veri seti ve autocomplete input. |
| **Satır 71 — Gezi MD İndirme Pasife Alma** | Gezi rehberini .md olarak indirme özelliği pasife alınmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — `featureFlags.ts` ile pasife alınır. |
| **Satır 75 — Ders Deposu Okunabilirlik** | Gezi deposundaki dark mode kontrast sorunları burada da çözülmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — Ders modalı ve form sınıfları standartlaştırılır. |
| **Satır 76 — Ders Deposu Flashcard** | Otomatik üretilen çalışma kartları (övgü) korunmalı. | **Korundu.** |
| **Satır 77 — Ders Deposu Paylaşım Hatası** | Depo paylaşımındaki içerik silinmiş sorunu düzeltilmeli. | **GÜN 1 / Modül 2 (Adım 1.4)** — Paylaşım motoru onarımı. |
| **Satır 78-79 — Doküman İndirme (1 Sayfa Boş PDF Hatası)** | MD indirme kaldırılmalı; dosya türü ne ise o inmeli; doküman indirilince 1 sayfalık boş başlık PDF hatası düzeltilmeli. | **GÜN 1 / Modül 3 (Adım 1.3)** — Gerçek binary Blob indirme mekanizması. |
| **Satır 80 — "Dokümanı Aç" Gerçek Önizleme** | Default görsel yerine ilgili dokümana ait gerçek önizleme çıkmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — PDF embed / metin önizleyici bileşeni. |
| **Satır 81 — "Kartları İndir" Pasife Alma** | Kartları indir seçeneği anlamsız text bastığı için pasife alınmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — `featureFlags.ts` ile pasife alınır. |
| **Satır 82 — Ders Deposu Sıralama** | Sıralama mantığı ve yön butonu buraya da uygulanmalı. | **GÜN 2 / Modül 4 (Adım 2.2)** — Sınav Tarihi, Öncelik, Başlık sıralaması + yön butonu. |
| **Satır 83 — PDF/DOCX/PPTX Dosya Türleri** | PDF dışında docx, pptx vb. dosya türleri de desteklenmeli. | **GÜN 1 / Modül 3 (Adım 1.3)** — `uploadUtils.ts` genişletilmiş format desteği. |
| **Satır 84 — PPTX İnteraktif Oynatım Özelliği** | PPTX için özel bir oynatım özelliği eklenmeli. | **GÜN 2 / Modül 4 (Adım 2.2)** — İnteraktif Sunum & Slayt Modalı (Slide Deck Player). |
| **Satır 88 — Metin Deposu Dark Mode** | Dark mode okunabilirlik sorunları düzeltilmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — Editor ve not kartları renk sınıfları onarılır. |
| **Satır 89 — VS Code Klasör Ağacı & Sürükle-Bırak** | Klasöre tıklanınca altındakilerin açıldığı ağaç yapısı + sürükle-bırak ile klasörler arası taşıma. | **GÜN 2 / Modül 5 (Adım 2.3)** — Hiyerarşik Tree View ve Drag & Drop taşıma desteği. |
| **Satır 90 — Metin Deposu ESC Desteği** | Modallar ESC tuşu ile kapatılabilmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — `useEscKey` entegrasyonu. |
| **Satır 91 — Metin Deposu "Depoyu Paylaş" & "Klasörü Paylaş"** | Depoyu paylaş ve klasörlere özel paylaşım seçeneği getirilmeli. | **GÜN 2 / Modül 5 (Adım 2.3)** — Depo ve klasör paylaşım token butonları. |
| **Satır 96 — Ses Deposu Paylaşım Hatası** | Depo paylaşımındaki silinmiş uyarısı düzeltilmeli. | **GÜN 1 / Modül 2 (Adım 1.4)** — Paylaşım motoru onarımı. |
| **Satır 97 — Ses Deposu Hashtag'leri Kaldırma** | Hashtag'ler tamamen kaldırılmalı. | **GÜN 2 / Modül 5 (Adım 2.3)** — Ses kartları ve modalından hashtag'ler temizlenir. |
| **Satır 98 — Paylaşılan Ses Bağlantısında Ses Gelmeme** | Paylaşılan ses kartında oynat butonuna basınca ses gelmeme sorunu çözülmeli. | **GÜN 2 / Modül 5 (Adım 2.3)** — `/share/[token]` Web Audio sentezleyici / dataUrl oynatımı bağlanır. |
| **Satır 100 — Ses Yükleme Kutusu Temizliği (`image-4.png`)** | Dosya seçilmeden "Ses dosyası seçildi" uyarısı olmasın; seçilince seçilen dosyanın adı şık rozet olsun. | **GÜN 2 / Modül 5 (Adım 2.3)** — Dosya seçilmediğinde nötr durum, seçilince dosya adı ve boyutu rozeti. |
| **Satır 101 — Ses Deposu ESC Desteği** | ESC ile kapatma desteği eklenmeli. | **GÜN 1 / Modül 2 (Adım 1.2)** — `useEscKey` entegrasyonu. |
| **Satır 105 — Görsel Çözünürlük ve Format Algılama** | Çözünürlük kullanıcıdan istenmesin, otomatik algılansın; desteklenmeyen formatta uyarı verilsin. | **GÜN 2 / Modül 5 (Adım 2.3)** — `Image()` nesnesiyle doğal genişlik/yükseklik ve format kontrolü. |
| **Satır 108 — Belge Deposu Sahte İndirme Bildirimi** | Gerçekten indirmeden sağ altta çıkan sahte indirme bildirimi kaldırılmalı. | **GÜN 2 / Modül 5 (Adım 2.3)** — Sahte toast iptali. |
| **Satır 109, 112 — Belge Önizlemesi** | Düz metin yerine belgenin orijinal önizlemesi (PDF ilk sayfa / belge önizleyici) gösterilmeli. | **GÜN 2 / Modül 5 (Adım 2.3)** — Format bazlı önizleme çerçevesi. |
| **Satır 110 — Bozuk PPTX/Word İndirme Hatası** | PPTX ve diğer Office dosyaları indirilip PowerPoint ile açılınca "çalıştıramaz" uyarısı çözülmeli. | **GÜN 1 / Modül 3 (Adım 1.3)** — Gerçek ikili binary Blob depolama ve indirme. |
| **Satır 111 — Belge Format ve Boyut Algılama** | Format ve boyut dosyaya göre otomatik algılanmalı. | **GÜN 2 / Modül 5 (Adım 2.3)** — `uploadUtils.ts` otomatik dosya meta çıkarma. |
| **Satır 116 — Çöp Kutusu Kalıcı Silme Kontrolü** | Süresi dolduğunda gerçekten kalıcı silindiğinin teyidi ve app boot'a bağlanması. | **GÜN 2 / Modül 6 (Adım 2.4)** — Global Layout mount tetikleyicisi ve birim test doğrulaması. |
| **Satır 122 — Özel Profil Fotoğrafı Yükleme/Kaldırma** | Kullanıcı kendi profil resmini yükleyebilmeli ve dilediğinde kaldırıp varsayılan baş harfe dönebilmeli. | **GÜN 2 / Modül 6 (Adım 2.4)** — Profil fotoğrafı upload, crop/preview ve "Fotoğrafı Kaldır" butonu. |
| **Satır 123 — E-posta Değiştirme Doğrulama Kodu** | E-postanın değiştirilebilmesi ve doğrulama kodu modalı ile onaylanması. | **GÜN 2 / Modül 6 (Adım 2.4)** — 6 haneli güvenlik kodu onay modalı. |
| **Satır 124 — "Sosyal Medya Olmadığı İçin..." Notu** | Profildeki bu gereksiz bilgilendirme notu tamamen kaldırılmalı. | **GÜN 2 / Modül 6 (Adım 2.4)** — Profil sayfasından not kaldırılacak. |
| **Satır 125, 136-137 — JSON Tam Arşiv Pasife Alma** | Arşivi json olarak indirme ve geri yükleme özellikleri pasife alınmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — `featureFlags.ts` ile arayüzden pasife park edilir. |
| **Satır 131 — Master PIN Akıllı Depo Tam Kilidi** | Akıllı depolar da PIN ile kilitlenebilmeli; içeri doğrudan URL veya kartla girilmemeli; gerçek koruma olmalı. | **GÜN 2 / Modül 6 (Adım 2.4)** — Akıllı depoların iç sayfalarında PIN koruma bariyeri. |
| **Satır 134 — Supabase "Yerel Mod" Bildirimi** | Yerel mod neden yazıyor açıklaması plana dahil edilmeli. | **Açıklandı:** `.env.local`'de Supabase anahtarları henüz tanımlanmadığı için güvenli yerel tarayıcı modu aktif. |
| **Satır 145, 148 — Bireysel Hesap Mantığı & Veri İzolasyonu** | Yeni açılan hesapta admin (Erdal Türk) verileri gelmemeli; her kullanıcı yalnızca kendi depolarına erişebilmeli. | **GÜN 1 / Modül 1 (Adım 1.1)** — `psc_${userId}_*` anahtarlı kullanıcı bazlı veri izolasyonu. |
| **Satır 146 — Google Giriş Simülasyonu** | Google ile giriş yap dediğinde direkt Erdal Türk hesabı açılmamalı; Google hesap seçim modalı gelmeli. | **GÜN 1 / Modül 1 (Adım 1.1)** — Google hesap seçici simülasyonu. |
| **Satır 147 — Autofill Buton Kilidi Hatası** | Şifre yöneticisiyle girince oturum aç butonunun kilitli kalması hatası çözülmeli. | **GÜN 1 / Modül 1 (Adım 1.1)** — Form submit ve input state senkronizasyonu onarılacak. |
| **Satır 149 — URL Elle Değiştirilerek Oturumsuz Giriş Engeli** | Giriş yapılmasa bile URL değiştirilerek sayfalara girilebiliyor, düzeltilmeli. | **GÜN 1 / Modül 1 (Adım 1.1)** — `AuthGuard` ile `/`, `/containers/*`, `/trash`, `/profile` rotalarına oturum bariyeri. |
| **Satır 152-154 — Pasife Alınan Özellikler Kütüğü** | Pasife alınan tüm özellikler ileride lazım olabileceği için bir yerde tutulmalı. | **GÜN 1 / Modül 2 (Adım 1.4)** — `src/lib/featureFlags.ts` merkezi kütüğü. |

---

## 📅 3. Gün Gün Detaylı Uygulama Adımları

```mermaid
flowchart TD
    subgraph GÜN 1: Temel Mimari, Güvenlik İzolasyonu & Çekirdek Servisler
        G1_1[Adım 1.1: Kimlik, Bireysel Hesap İzolasyonu psc_u_id_* & AuthGuard]
        G1_2[Adım 1.2: useEscKey Hook & Tüm Depolarda Tema/Kontrast Onarımı]
        G1_3[Adım 1.3: Gerçek İkili Binary Blob Depolama & Hatasız Dosya İndirme]
        G1_4[Adım 1.4: Paylaşım Motoru Senkron Token & featureFlags.ts Pasif Kütüğü]
        G1_1 --> G1_2 --> G1_3 --> G1_4
    end

    subgraph GÜN 2: Anasayfa, 8 Depo İnce Ayarı & Lansman Doğrulaması
        G2_1[Adım 2.1: Anasayfa Logo, Çöp Kutusu, Öneri Yükleyici, Sıralama Yönü & Popover]
        G2_2[Adım 2.2: Akıllı Depolar - Film Mid 3lüsü, Kod GitHub, Gezi 81 İl, Ders Slayt]
        G2_3[Adım 2.3: Standart Depolar - Metin VS Code Ağacı, Ses Dropzone image-4, Görsel/Belge Meta]
        G2_4[Adım 2.4: Profil Özel Foto/Email Kodu, Çöp Kutusu Boot Purge & 40+ Test Derlemesi]
        G2_1 --> G2_2 --> G2_3 --> G2_4
    end

    G1_4 --> G2_1
```

### GÜN 1 — Temel Mimari, Güvenlik İzolasyonu & Çekirdek Servisler

#### Adım 1.1: Kimlik, Çoklu Kullanıcı İzolasyonu & Rota Koruması (Sign In/Up)
- **Problem (Satır 145-149):** Yeni hesap açılsa bile Erdal Türk'ün tüm verileri geliyor. Google login direkt Erdal Türk'e bağlanıyor. Autofill yapıldığında buton kilitleniyor. URL elle yazılarak oturumsuz tüm sayfalara erişilebiliyor.
- **Teknik Çözüm:**
  1. `src/lib/appStore.ts` içinde `registered_users` veritabanı kurgulanacak.
  2. `getUserStorageKey(baseKey)` mekanizmasıyla her kullanıcının `containers`, `movies`, `texts`, `snippets`, `travels`, `study`, `audios`, `media`, `files`, `trash` anahtarları `psc_${userId}_${baseKey}` olarak tamamen izole edilecek.
  3. "Erdal Türk" zengin demo içeriğiyle kalacak; yeni kayıt olan kullanıcılar kendi boş ve bağımsız alanlarına sahip olacak.
  4. `src/components/AuthGuard.tsx` bileşeni eklenecek. Oturum açmamış istekler otomatik `/login`'e yönlendirilecek.
  5. `src/app/login/page.tsx` içindeki autofill state senkronizasyonu ve interaktif Google hesap seçici simülasyonu eklenecek.

#### Adım 1.2: Evrensel Modal, ESC Kapatma & Tema/Kontrast Standardizasyonu
- **Problem (Satır 22, 50, 54, 61, 66, 67, 69, 70, 75, 88, 90, 101):** Modallar ESC ile kapanmıyor. Formlarda değişiklik yapıldığında kazara çıkma koruması yok. Aydınlık modda Kod deposu başlığı koyu şerit yüzünden kötü görünüyor (`image-3.png`). Koyu modda Gezi, Ders ve Metin modallarında beyaz arka plana beyaz yazı okunmuyor.
- **Teknik Çözüm:**
  1. `src/hooks/useEscKey.ts` oluşturulacak: `useEscKey(isOpen, onClose, isDirty)` modal açıkken ESC basıldığında çalışacak; form kirliyse onay penceresi çıkartacak.
  2. PIN kilidi, Kod modalı, Gezi modalı, Ders modalı, Metin modalı ve Ses modalına bağlanacak.
  3. Kod deposu aydınlık mod başlık çubuğu `bg-slate-100 dark:bg-slate-900` ve etiket renkleri ile `image-3.png` kontrastı düzeltilecek.
  4. Tüm modallara `bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100` sınıfları giydirilecek.

#### Adım 1.3: Gerçek İkili Dosya (Blob) Depolama & İndirme Bütünlüğü
- **Problem (Satır 78, 79, 83, 110):** Belge ve Ders deposundan indirilen PPTX dosyaları PowerPoint tarafından "bozuk", Word dosyaları "geçersiz", PDF dosyaları ise "1 sayfa boş başlık" olarak iniyor.
- **Teknik Çözüm:**
  1. `src/lib/uploadUtils.ts` içine kullanıcı yüklediği dosyayı Base64 `dataUrl` / ikili Blob olarak saklayan kalıcı mimari kurulacak.
  2. `src/lib/exportUtils.ts` içindeki `exportDocumentFile` fonksiyonu güncellenecek; eğer öğenin orijinal `dataUrl` veya `blob` verisi varsa doğrudan o gerçek ikili dosya indirtilecek.
  3. Böylece gerçek kullanıcı PPTX, DOCX, XLSX veya PDF yüklediğinde orijinal ikili baytları birebir indirilecek; Office ve Acrobat dosyaları sıfır bozulmayla doğrudan açacak.

#### Adım 1.4: Paylaşım Motoru Flaş Onarımı & Pasif Özellikler Kütüğü
- **Problem (Satır 37, 41, 43, 55, 65, 71, 77, 81, 96, 125, 137, 152-154):** Paylaşım linkine basıldığında milisaniyelik "İçerik Silinmiş" flaşı çıkıyor; depo paylaşımları yanlışlıkla silinmiş algılanıyor. Pasife alınması istenen özelliklerin ilerisi için güvenle saklanması gerekiyor.
- **Teknik Çözüm:**
  1. `src/app/share/[token]/page.tsx` içinde `getCustomSharedRecord` senkron state başlatıcıda (`useState(() => ...)`) okunacak; ilk render'da null kalma flaşı ortadan kalkacak.
  2. `revokeSharesForDeletedItem` fonksiyonundaki gevşek dize eşleşmesi kaldırılacak, kesin ID ve token bazlı çalıştırılacak.
  3. `src/lib/featureFlags.ts` oluşturulacak: JSON tam arşiv dışa aktar/içe aktar, Ders kartları indirme, Gezi/Ders markdown dışa aktarma, film arşivi indirme bayrakları `false` olarak güvenle park edilecek.

---

### GÜN 2 — Anasayfa, 8 Depo İnce Ayarı & Lansman Doğrulaması

#### Adım 2.1: Anasayfa & Navigasyon Yenilenmesi
- **Problem (Satır 3-21):** Logo "container" etiketi, çöp kutusu kırmızı noktası, kalabalık yükleyici etiketleri, yanıltıcı "Hemen Oluştur" butonu, manuel sıralamanın listede olması, kapak/isim düzenleme eksikliği, arama filtreleri düzensizliği, profil popover ihtiyacı.
- **Teknik Çözüm:**
  1. Header temizliği: "Container" etiketi ve çöp kutusu kırmızı noktası kaldırılacak.
  2. Evrensel Yükleyici: Kalabalık etiketler kaldırılacak. Dosya sürüklendiğinde zorla yönlendirmek yerine "Tavsiye Edilen Depo: [X] — Yükle / Başka Depo Seç / İptal" öneri akışı çalışacak.
  3. Sıralama Motoru: "Manuel" açılır listeden çıkarılacak; filtreler: **Son Güncelleme**, **Alfabetik**, **İçerik Sayısı** olarak listelenecek. Yanındaki yukarı/aşağı simgesi aktif Artan/Azalan yön değiştirme butonuna dönüştürülecek. Manuel sıralama butonları kartlar üzerinde ayrık kalacak.
  4. Depo Kurulum & Düzenleme Modalı: Deponun adı, açıklaması ve kapak görseli/gradyanı kurulumda ve sonrasında düzenlenebilecek. Kurulu depoların altındaki "Hemen Oluştur" gizlenecek. Standart depoda Tab/Yön tuşları ve "Mevcut Depoyla Devam Et", akıllı depolarda çakışma uyarı modalı çalışacak.
  5. 8 Kesin Depo Türü Komut Paleti: Filtre çipleri `Film`, `Kod`, `Gezi`, `Ders`, `Metin`, `Ses`, `Görsel`, `Belge` olacak. Film etiketinde görsel çıkma bug'ı çözülecek. Depoya tıklayınca depo, içeriğe tıklayınca içerik modalı açılacak.
  6. Profil Popover Menüsü: Next.js dev butonundan esinlenilerek Profil, Tema, PIN Güvenliği, Supabase Senkronizasyon, Paylaşımlar ve Çıkış sekmelerini içeren şık açılır menü oluşturulacak.

#### Adım 2.2: Akıllı Depolar (Film, Kod, Gezi, Ders)
- **Film Deposu (Satır 27-44):**
  - "Dizi" ifadesi kaldırılacak; anasayfada devam eden/planlanan çalışmalarda Dizi Deposu yol haritası kartı yer alacak.
  - 3'lü Değerlendirme Sistemi: `○ Değerlendirilmedi` ➔ `🏆 Başyapıt` ➔ `🍿 Mid` ➔ `🥱 Zaman Kaybı` ➔ `○ Sıfırla`.
  - Arama yanına filtreleme butonu (Tür, İzlenme, Değerlendirme, Yıl).
  - Pasif "Fragmanı İzle" butonu + tooltip.
  - İzlenmeden favorilenememe ve aynı anda hem izlendi hem izleme listesinde olamama kuralı.
  - Manuel eklenen filmlere "Yerel Kayıt" etiketi ve düzenleme modalı.
  - Virgül girilse bile noktaya çevrilerek küsuratlı rating desteği (`3,2` ➔ `3.2`).
  - "Depoyu Paylaş" butonu eklenmesi.
- **Kod Deposu (Satır 50-56):**
  - Aydınlık mod kontrastı (`image-3.png`) onarılacak.
  - Etiket filtre şeridi ve altındaki yatay scrollbar tamamen kaldırılacak.
  - Kod ekleme formunda "Anahtar Kelimeler" kullanılacak.
  - İsteğe bağlı GitHub linki input'u ve kart üzerinde yeni sekmede açan GitHub butonu.
  - Sahte indirme bildirimi iptal edilecek.
- **Gezi Deposu (Satır 62-68):**
  - Sıralama ve yön değiştirme butonu.
  - "Favoriler ⭐" sekmesi.
  - `src/lib/geoData.ts` ile Türkiye'nin 81 ili ve dünya ülkelerini içeren güvenilir arama/ototamamlayıcı.
- **Ders Deposu (Satır 80-84):**
  - "Dokümanı Aç" için gerçek doküman önizlemesi (PDF embed/viewer).
  - İnteraktif Sunum & Slayt Modalı (Slide Deck Player) ile slaytları sonraki/önceki butonları ve klavye yön tuşlarıyla sunum modunda oynatma.
  - Sıralama ve yön butonu.

#### Adım 2.3: Standart Depolar (Metin, Ses, Görsel, Belge)
- **Metin Deposu (Satır 89-91):**
  - Sol tarafta VS Code benzeri hiyerarşik klasör ağacı (klasöre tıklayınca açılır/kapanır).
  - Notların sürükle-bırak (drag & drop) ile farklı klasörlere taşınabilmesi.
  - "Depoyu Paylaş" ve klasör seviyesinde "Klasörü Paylaş" seçenekleri.
- **Ses Deposu (Satır 97-100):**
  - Hashtag'ler kaldırılacak.
  - Paylaşılan ses bağlantısında ses çalma Web Audio sentezleyici veya `dataUrl` ile ses çıkışı bağlanacak.
  - Dropzone alanındaki statik "Ses dosyası seçildi" uyarısı kaldırılacak (`image-4.png`); dosya seçildiğinde dosya adı ve süresi şık bir rozet olarak gösterilecek.
- **Görsel Deposu (Satır 105):**
  - Çözünürlük ve format yüklenen görselden otomatik algılanacak; geçersiz formatta anında uyarı verilecek.
- **Belge Deposu (Satır 108-112):**
  - Sahte indirme toast'ı iptal edilecek.
  - Belge içi önizlemede format bazlı gerçek önizleme çerçevesi sunulacak.
  - Boyut ve format otomatik algılanacak.

#### Adım 2.4: Profil, Çöp Kutusu & Lansman Öncesi Doğrulama
- **Profil (Satır 122-134):**
  - Özel profil fotoğrafı yükleme ve istendiğinde tek tıkla kaldırıp varsayılan baş harfe dönebilme.
  - E-posta değiştirme için 6 haneli güvenlik kodu onay modalı.
  - "Platform sosyal medya olmadığı için..." notu kaldırılacak.
  - Akıllı depoların Master PIN kilidiyle tam entegrasyonu (içeride de şifresiz gezinilemez).
- **Çöp Kutusu (Satır 116):**
  - Global `layout.tsx` veya app boot esnasında `purgeExpiredTrashItems()` otomatik çalıştırılarak süresi dolan her şeyin arka planda kalıcı silinmesi garanti edilecek.
- **Doğrulama & Testler:**
  - Mevcut 40 testin tamamının yeşil kalması sağlanacak.
  - Çoklu kullanıcı veri ayrımı, sıralama yönü toggle, film 3'lü `Mid` değerlendirmesi ve dosya blob bütünlüğü için yeni testler eklenecek.
  - `npm run build` ile 0 hata ile derlenecek.

---

## ⏱️ 4. Doğrulama Planı

### Otomatik Testler
```powershell
npm test
npm run build
```

### Kullanıcı Kabul Test Senaryoları
1. **Çoklu Hesap:** `ahmet@test.com` ile yeni hesap açıldığında Erdal Türk'ün filmleri/notları görünmeyecek; çıkış yapıldığında URL yazılsa bile `/login`'e atacak.
2. **Film 3'lü Değerlendirme:** Tıklama döngüsü: `Başyapıt` ➔ `Mid` ➔ `Zaman Kaybı` ➔ `Sıfırla` çalışacak.
3. **Anasayfa Sıralama:** Alfabetik seçilip yön butonuna basıldığında A-Z ve Z-A anında yer değiştirecek.
4. **Gerçek Dosya İndirme:** Yüklenen bir PPTX veya DOCX indirilip PowerPoint/Word ile hatasız açılacak.
5. **ESC Tuşu & Tema:** Modallar ESC ile kapanacak, kirli formda onay soracak; Kod deposu açık modda pürüzsüz görünecek.
