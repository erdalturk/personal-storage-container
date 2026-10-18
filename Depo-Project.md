# Proje 4 — Kişisel Dijital Depo

**Belge türü:** Proje gereksinimleri ve tasarım kararları  
**Durum:** Fikir geliştirme ve gereksinimleri belirleme aşaması  
**Öncelik:** Ürünün temel mantığını, kullanıcı deneyimini ve özelliklerini netleştirmek

---

## 1. Projenin Tanımı

Kişisel Dijital Depo, insanların aklına gelen, oluşturduğu, saklamak istediği veya ileride ihtiyaç duyabileceği her türlü içeriği tek bir platformda düzenli biçimde saklamasını sağlayan kişisel bir dijital arşiv sistemidir.

Fotoğraf, video, yazı, şiir, proje fikri, ses kaydı, dosya ve benzeri içeriklerin farklı uygulamalara ve depolama alanlarına dağılması yerine tek bir merkezde toplanması amaçlanır.

Platformun temel amacı, kullanıcının zihninde veya farklı arşivlerinde dağılmış olan içeriklerini kolayca bulmasını sağlamaktır.

### 1.1. Temel değer önerisi

- Her şeyi tek bir yerde saklayabilmek.
- İçerikleri düzenli ve anlaşılır bir yapıda tutmak.
- Kullanıcının aradığı içeriği kolayca bulmasını sağlamak.
- İçerik türüne uygun özellikler sunmak.
- Kullanıcının kendi arşiv düzenini oluşturabilmesine izin vermek.
- Kullanıcı deneyimini görsel, etkileşimli ve akıcı hale getirmek.
- İhtiyaç duyulduğunda içerikleri dışa aktarabilmek veya salt okunur bağlantılarla paylaşabilmek.

### 1.2. Hedef kitle

Hedef kitle herhangi bir özel kullanıcı grubuyla sınırlandırılmayacaktır.

**Hedef kullanıcı: Kişisel dijital arşiv oluşturmak isteyen herkes.**

### 1.3. Platformun kapsamı

Bu proje bir sosyal medya platformu değildir.

Takipçi, takip etme, beğeni akışı veya sosyal etkileşim odaklı özellikler temel kapsamda bulunmayacaktır.

Bununla birlikte kullanıcı, istediği içerikleri veya depoları salt okunur bağlantılarla başkalarına gösterebilecektir.

---

## 2. Temel Kavramlar

### 2.1. Depo

Depo, kullanıcının belirli bir amaca veya içerik türüne göre oluşturduğu bağımsız arşiv alanıdır.

Örneğin:

- Şiirlerim
- Proje Fikirlerim
- Film Arşivim
- Seyahat Anılarım
- Kodlarım

Her depo kendi tasarımına, veri yapısına ve ihtiyaçlarına uygun özelliklere sahip olabilir.

### 2.2. Depo formatı

Depo oluşturulurken seçilen temel içerik türüdür.

Dört temel format belirlenmiştir:

1. Metin
2. Ses
3. Görüntü
4. Dosya

Bunlar birbirinden bağımsız dört depo değildir. Kullanıcı bu formatlardan birini seçerek yeni bir depo oluşturur.

Örneğin, Metin formatında birbirinden bağımsız Şiirlerim, Günlük ve Proje Fikirlerim depoları oluşturulabilir.

### 2.3. Akıllı depo

Akıllı depolar, belirli bir kullanım senaryosuna özel tasarlanmış, standart depolardan farklı veri yapıları ve işlevler sunabilen hazır depo türleridir.

Örneğin Film Deposu, yalnızca film isimlerini saklamakla kalmayıp afiş, yönetmen, oyuncular, fragman ve izlenme durumu gibi bilgileri de yönetebilir.

Her akıllı depo kendine özgü oluşturma ekranına, tasarıma ve özelliklere sahip olacaktır.

### 2.4. Klasör

Klasörler, bağımsız bir deponun içindeki içerikleri düzenlemek için kullanılır.

Klasörler depo değildir ve kendi başlarına depo formatı taşımazlar.

Temel yapı:

`Depo → Klasör → İçerik`

Bir klasörün içinde başka klasör oluşturulamaz.

Dosya formatıyla yüklenen dosyaların kendi iç yapısı bu kuraldan bağımsızdır. Örneğin, iç içe klasörler barındıran bir arşiv dosyasının kendi yapısı değiştirilmez.

---

## 3. Platform Türü ve Teknoloji Yaklaşımı

### 3.1. İlk sürüm

İlk sürüm responsive bir **web uygulaması (web app)** olarak geliştirilecektir.

Uygulamanın bilgisayar, telefon ve tablet ekranlarına uyum sağlaması hedeflenmektedir.

### 3.2. İleride değerlendirilebilecek seçenekler

- PWA desteği
- Mobil uygulama
- Masaüstü uygulaması

Bunlar ilk sürüm için zorunlu değildir.

### 3.3. Teknoloji seçimi

Frontend, backend, veritabanı, dosya depolama ve kimlik doğrulama teknolojileri henüz kesinleştirilmemiştir.

İlk sürümde düşük maliyetli veya uygun ücretsiz katmanlardan yararlanılması değerlendirilecektir.

Fotoğraf, video, ses ve diğer dosyaların doğrudan veritabanında tutulması yerine uygun bir dosya depolama sistemi kullanılması düşünülmektedir. Veritabanında ise içeriklerin bilgileri, konumları ve diğer metadata tutulabilir.

Depolama sınırı, maliyetler ve gelecekteki ölçeklenme ayrıca değerlendirilecektir.

---

## 4. Ana Sayfa

Ana sayfa, projenin temel kullanım alanlarından biridir.

NotebookLM'in genel yerleşim yaklaşımı bir referans olarak kullanılmaktadır; ancak arayüzün birebir kopyalanması veya çok benzer olması amaçlanmamaktadır.

### 4.1. Genel yerleşim

Ana sayfa genel olarak şu bölümlerden oluşacaktır:

1. Üst kısımda arama alanı
2. Sayfanın üst yarısında akıllı depo kartları
3. Akıllı depo kartlarının yanında yeni standart depo oluşturma kartı
4. Daha aşağıda kullanıcının oluşturduğu depoların listesi

### 4.2. Akıllı depo kartları

Ana sayfanın üst bölümünde toplam beş kartlık bir alan bulunacaktır:

- Dört akıllı depo kartı
- Bir standart depo oluşturma kartı

İlk dört akıllı depo sistem tarafından sabit olarak belirlenecektir.

Kullanıcı başlangıçta bu dört depoyu kendisi seçmeyecektir.

Platformda daha fazla akıllı depo bulunursa ayrı bir buton üzerinden tüm akıllı depolar listelenebilecektir.

İlk dört akıllı deponun hangileri olacağı henüz belirlenmemiştir.

### 4.3. Akıllı depo kartlarının davranışı

Kullanıcı bir akıllı depo kartına tıkladığında ilgili deponun oluşturma süreci başlayacaktır.

Örneğin Film Deposu kartına tıklandığında Film Deposu'na özgü tasarım ekranı açılacaktır.

Bu süreç standart depo oluşturma ekranıyla aynı olmak zorunda değildir.

### 4.4. Standart depo oluşturma kartı

Beşinci kart, artı işareti veya kendine özgü bir tasarımla yeni standart depo oluşturmayı sağlayacaktır.

Kullanıcı bu karta tıkladığında hangi formatta depo oluşturacağını seçebilecektir:

- Metin
- Ses
- Görüntü
- Dosya

Ardından seçilen formata uygun özelleştirme ve oluşturma aşamalarına geçilecektir.

### 4.5. Kullanıcının depoları

Kullanıcının oluşturduğu depolar ana sayfanın alt bölümünde kartlar halinde listelenecektir.

Kartlarda genel olarak şunlar bulunacaktır:

- Kapak görseli
- Depo adı
- İçerik sayısı
- Son eklenen veya güncellenen içeriğe ilişkin tarih bilgisi
- Depo korumasını etkinleştiren bir on/off switch

Kartlarda genel istatistikler ve ilerleme çubukları gösterilmeyecektir.

### 4.6. Depo sıralama

Kullanıcı depolarını üç şekilde düzenleyebilir:

- Sürükle-bırak ile manuel sıralama
- Alfabetik sıralama
- Güncellenme tarihine göre sıralama

Kullanıcının son kullandığı sıralama tercihi korunacaktır.

Kullanıcı manuel sıralama yaptıysa sistem kendiliğinden bu sırayı değiştirmeyecektir.

### 4.7. Ana sayfa araması ve filtreleme

Ana sayfanın üst kısmındaki arama alanı, kullanıcının kendi depolarını kolayca bulmasını sağlayacaktır.

Depo sayısı arttığında arama ve filtreleme özellikleriyle istenen depo kolayca bulunabilmelidir.

---

## 5. Tasarım Dili ve Kullanıcı Deneyimi

### 5.1. Genel yaklaşım

Tasarımın Duolingo gibi uygulamaların ilgi çekici ve akıcı etkileşim yaklaşımından yararlanması istenmektedir.

Amaç bir oyuna benzeyen arşiv oluşturmak değil, arşiv oluşturma ve kullanma sürecini sıkıcı olmaktan çıkarmaktır.

### 5.2. Tasarım ilkeleri

- Görsel ağırlıklı seçim ekranları
- Büyük ve anlaşılır seçenek kartları
- Hover durumlarında önizleme
- Yumuşak geçişler
- Hafif kart animasyonları
- Tıklamalarda akıcı geri bildirim
- Mikro animasyonlar
- Canlı içerik önizlemeleri
- Kullanıcıyı gereksiz formlarla yormayan akışlar

Oyunlaştırma yaklaşımı, arayüzün etkileşimli ve ilgi çekici olmasını sağlayacaktır. Gereksiz puan, seviye veya rozet sistemleri zorunlu değildir.

### 5.3. Görsel seçim örneği

Metin formatı seçilirken klasik radyo butonları yerine büyük seçenek kartları kullanılabilir.

Örneğin:

**Düz Metin:** Sade metin editörü ve temel metin istatistikleri.

**Şiir:** Dize ve kıta düzenini gösteren bir önizleme.

**Kod:** Kod görünümünü gösteren önizleme.

Kullanıcı bir seçeneğin üzerine geldiğinde önizleme görebilir; tıkladığında seçim yumuşak bir geçişle gerçekleşebilir.

---

## 6. Standart Depolar

### 6.1. Oluşturma süreci

Kullanıcı standart depo oluşturma kartına tıkladığında önce depo formatını seçer.

Ardından ilgili formata uygun oluşturma ekranı açılır.

Genel özelleştirme seçenekleri şunları içerebilir:

- Depo adı
- Kapak görseli
- Formatın kendine özgü seçenekleri
- İsteğe bağlı ilk içeriklerin eklenmesi

Depo adının boş bırakılması durumunda uygun bir varsayılan isim verilmesi değerlendirilebilir.

Kullanıcı oluşturma ekranında ilk içeriklerini ekleyebilir; ancak bu zorunlu olmayacaktır.

Kullanıcı isterse yalnızca depoyu oluşturup içerikleri daha sonra ekleyebilir.

### 6.2. Sınırlı özelleştirme

Standart depoların kullanıcı tarafından belirli ölçüde özelleştirilmesi desteklenecektir.

Ancak kullanıcıya sınırsız bir tasarım aracı sunulması amaçlanmamaktadır.

Özelleştirme, depoyu kişiselleştirecek ve kullanımını kolaylaştıracak seçeneklerle sınırlı tutulacaktır.

### 6.3. Formata özgü özellikler

Seçilen format yalnızca görünümü değil, deponun bazı işlevlerini de belirleyecektir.

Örnekler:

**Düz Metin**
- Metin düzenleme
- Kelime sayısı
- Satır sayısı
- Diğer uygun metin istatistikleri

**Şiir**
- Dize ve kıta yapısı
- Satır ve kelime istatistikleri
- Şiir yapısına uygun düzenleme özellikleri

**Kod**
- Programlama dili seçimi gibi uygun alanlar
- Syntax highlighting
- Kod içeriğine özgü istatistikler

Bu örnekler kesin özellik listesi değildir. Her formatın ayrıntıları o format tasarlanırken belirlenecektir.

### 6.4. Depo istatistikleri

Her depo türüne uygun istatistikler tutulabilir.

Örnekler:

- Düz metin deposunda kelime ve satır sayısı
- Film deposunda toplam film sayısı

İstatistiklerin hangi ekranda ve nasıl gösterileceği her depo için ayrıca kararlaştırılacaktır.

### 6.5. Dinamik etiketler ve durumlar

İçerikler, deponun kullanım amacına göre durum veya etiket alanlarına sahip olabilir.

Örneğin Proje Deposu'nda:

- Fikir aşamasında
- Geliştiriliyor
- Tamamlandı
- Beklemede

gibi durumlar bulunabilir.

Bu bilgiler filtreleme için kullanılabilir.

Etiketler veya durumlar, kullanıcıya zorunlu olarak buton biçiminde sunulmayacaktır. Arayüz yöntemi ilgili depo tasarlanırken belirlenecektir.

---

## 7. Akıllı Depolar

### 7.1. Genel yaklaşım

Akıllı depolar, belirli bir kullanım senaryosuna göre tasarlanmış özel modüllerdir.

Her akıllı deponun:

- Kendine özgü oluşturma ekranı
- Kendine özgü veri yapısı
- Kendine özgü içerik kartları
- Kendine özgü işlevleri
- İhtiyaca uygun filtreleri
- Gerektiğinde kendine özgü istatistikleri

olabilir.

Her akıllı depo ayrı ayrı tasarlanacaktır. Bir depo için alınan kararlar diğer tüm depolara otomatik olarak uygulanmayacaktır.

### 7.2. Akıllı depo oluşturma yaklaşımı

Kullanıcı ana sayfadaki akıllı depo kartına tıkladığında ilgili deponun tasarım ekranına geçer.

Örneğin Film Deposu'nda kullanıcı önce depo görünümünü oluşturur ve ardından film ekler.

Diğer akıllı depoların oluşturma akışları kendi ihtiyaçlarına göre belirlenecektir.

### 7.3. Film Deposu — İlk oluşturma ekranı

Film Deposu için şimdiye kadar belirlenen akış:

1. Kullanıcı Film Deposu kartına tıklar.
2. Film Deposu'na özel tasarım ekranı açılır.
3. Kullanıcı kendi cihazından bir kapak görseli yükler.
4. Depo başlığını belirler.
5. Başlık boş bırakılırsa varsayılan bir isim kullanılır.
6. Ekrandaki arama çubuğuyla filmler aranır.
7. Kullanıcı istediği filmleri seçer.
8. Seçilen filmler afişleri ve temel bilgileri bulunan kartlar halinde görünür.
9. Yeni film eklendikçe kartlar yan yana ve devamında alt satırlara yerleşir.
10. Kullanıcı kaydettiğinde depo oluşturulur.

Depo oluşturulduktan sonra da yeni film ekleme işlemi yapılabilecektir.

Film sayısı için bir içerik sınırı olup olmayacağı henüz belirlenmemiştir.

### 7.4. Film kartları

Film kartları temel olarak film afişi ve film bilgilerini içerecektir.

Her film kartının altında üç küçük ikonlu kontrol bulunacaktır:

- İzlenecek
- İzlendi
- Favori

Bu kontroller açma/kapatma mantığıyla çalışacaktır. Örneğin favori ikonu etkinleştirildiğinde film favorilere eklenir; aynı ikona yeniden basıldığında favorilerden çıkarılır.

Aynı mantık diğer uygun durum kontrollerine de uygulanabilir.

### 7.5. Film bilgilerinin edinilmesi

Film Deposu için harici bir kaynaktan film bilgileri alınması düşünülmektedir.

Bu bilgiler şunları içerebilir:

- Film afişi
- Yönetmen
- Oyuncu listesi
- Fragman
- Temel film bilgileri

Kaynakta bulunmayan bir film için kullanıcının manuel kayıt oluşturabilmesi de desteklenmelidir.

Kullanılacak veri kaynağı ve entegrasyon yöntemi henüz belirlenmemiştir.

---

## 8. İçerik Arama ve Filtreleme

### 8.1. Genel arama yaklaşımı

Ana sayfada ve ilgili depo ekranlarında arama alanları bulunacaktır.

Kullanıcıların depoları ve içerikleri kolayca bulması amaçlanmaktadır.

### 8.2. Arama kapsamı

Genel aramada başlıklar ve anahtar kelimeler aranabilir olmalıdır.

İçeriklerin tüm metnini tarayan sınırsız bir arama yaklaşımı başlangıçta tercih edilmemektedir. Bunun nedeni, bir başkasının kullanıcının hesabına erişmesi durumunda içeriklerden bilgi sızmasını önleme isteğidir.

Arama sonuçları her durumda kullanıcının erişim yetkilerine ve depo koruma kurallarına uymalıdır.

### 8.3. Kademeli daraltma

Arama yalnızca tek yöntem olmayacaktır.

Kullanıcı önce ilgili depo türünü seçerek arama alanını daraltabilir. Örneğin selfie ararken Ses formatlı depolara yönelmek yerine Görüntü formatlı depolardan başlayabilir.

Sonrasında fotoğraf/video gibi alt türleri ve diğer uygun filtreleri kullanabilir.

Bu yaklaşım, kullanıcının içeriğin nerede olduğunu hatırlamasını kolaylaştıracaktır.

### 8.4. Akıllı arama

Kullanıcının doğal ifadelerle arama yapabilmesi düşünülmektedir.

Örneğin:

"Geçen yıl"

ifadesi, bir önceki yılın içeriklerini filtreleyebilir.

Akıllı arama, kullanıcının içeriklerini bulmasına yardımcı olacaktır. Ancak kullanıcının yetkili olmadığı içerikleri ortaya çıkarmamalıdır.

Akıllı aramanın teknik yöntemi ve kapsamı henüz belirlenmemiştir.

---

## 9. Yapay Zekâ Destekli Öneriler

### 9.1. Temel ilke

Yapay zekâ, kullanıcı adına kesin kararlar veren bir sistem olmayacaktır.

**AI öneri sunar; son karar kullanıcıya aittir.**

### 9.2. Öneri akışı

Örneğin kullanıcı şu metni kaydeder:

"İnsanların spor yapmasını takip eden bir uygulama fikrim var."

Sistem içeriği analiz ederek uygun gördüğü metadata alanlarını önerebilir.

Örnek öneriler:

- Tür: Proje fikri
- Konu: Spor / Yazılım
- Durum: Fikir aşaması

Sistem, içerikte bulunmayan teknik bilgileri zorla atamamalıdır.

Kullanıcı teknik konularda bilgisiz olabilir. Bu nedenle sistem, yalnızca güvenilir biçimde çıkarabildiği bilgileri önermeli ve emin olmadığı alanlarda kesinlik izlenimi yaratmamalıdır.

### 9.3. Kullanıcı kontrolü

Kullanıcı:

- Önerileri düzenleyebilir.
- Önerileri kabul edebilir.
- Önerileri kaldırabilir.
- İçeriği öneriler olmadan olduğu gibi kaydedebilir.

AI özellikleri, temel arşivleme işlevinin zorunlu bir parçası olmayacaktır.

---

## 10. Depo İçindeki Klasör Yapısı

### 10.1. Temel yapı

Her bağımsız depo içinde isteğe bağlı klasörler oluşturulabilir.

Yapı:

`Depo → Klasör → İçerik`

Bir klasörün içinde yeni klasör oluşturulamaz.

### 10.2. Klasör oluşturma

Klasör oluşturmak için kullanıcıya ayrıca bir soru sorulmayacaktır.

Depo ekranında bir klasör oluşturma simgesi bulunacaktır. Kullanıcı bu simge aracılığıyla klasör oluşturabilir.

Klasör oluşturmak isteğe bağlıdır.

### 10.3. Klasör özellikleri

Klasörler yalnızca isimden oluşacaktır.

Klasörler için:

- Kapak görseli
- Renk seçimi
- Özel simge seçimi

gibi kişiselleştirme özellikleri düşünülmemektedir.

### 10.4. Klasör işlemleri

Klasörlerde yalnızca şu iki işlem bulunacaktır:

- Yeniden adlandır
- Sil

Klasörler için taşıma veya kopyalama gibi ek işlemler öngörülmemektedir.

### 10.5. Depo ekranında klasörlerin yerleşimi

Depoya girildiğinde:

1. Üst bölümde klasörler gösterilir.
2. Alt bölümde klasörsüz içerikler gösterilir.

Bir klasöre tıklandığında o klasörün içerikleri açılır.

### 10.6. İçeriklerin klasörlerle ilişkisi

Bir içerik aynı anda birden fazla klasöre bağlı olamaz.

Ancak kullanıcı aynı içeriği ayrı ayrı yüklerse farklı klasörlerde aynı içeriğin kopyaları bulunabilir.

Taşıma işlemi, içeriği bir konumdan diğerine aktarır; kopya oluşturmaz.

Dosya formatında yüklenen dosyaların kendi içindeki klasör yapısı bu sistemin klasör sınırından bağımsızdır.

### 10.7. Henüz kararlaştırılmamış konu

Bir klasör silinirken kullanıcıya içindeki içeriklerin nasıl işleneceği sorulacaktır.

Kullanıcıya iki seçenek sunulur:

    İçerikleri koru: Klasör silinir, içindeki içerikler korunarak Klasörsüz İçerikler bölümüne taşınır.

    Klasör ve içeriklerini sil: Klasör ve içindeki içerikler Çöp Kutusu'na taşınır.

İkinci seçenekteki içerikler, genel Çöp Kutusu kurallarına tabidir. Varsayılan olarak 30 gün tutulur ve kullanıcı tarafından belirlenen süre sonunda otomatik olarak kalıcı silinir.

Bu seçim, klasörün silinmesi sırasında yapılır. Kullanıcıya içeriklerini koruma veya birlikte silme kontrolü verilir.

---

## 11. İçerik İşlemleri

Her uygun içerikte aşağıdaki temel işlemler bulunacaktır:

- Düzenle
- Sil
- Taşı
- Dışa aktar

### 11.1. Düzenle

Kullanıcı kaydettiği içeriği sonradan değiştirebilir.

Düzenleme arayüzü ilgili depo formatına veya akıllı depo türüne uygun olacaktır.

### 11.2. Sil

Silme işlemi, içeriği normal görünümden kaldırıp Çöp Kutusu'na taşır.

### 11.3. Taşı

Kullanıcı içeriği uygun başka bir depoya veya klasöre taşıyabilir.

Ancak her içeriğin her depo türüne taşınması uygun olmayabilir. Örneğin film verisinin düz metin deposuna taşınması veri yapısını bozabilir.

Bu nedenle taşıma işleminin uygunluk kuralları ilgili depo türleri tasarlanırken belirlenecektir.

### 11.4. Dışa aktar

Kullanıcı içeriğini desteklenen formatlarda cihazına indirebilir.

Örnek formatlar:

- TXT
- PDF
- PNG
- JPG

Bunlar genel örneklerdir. Her depo ve içerik türü için uygun dışa aktarma biçimleri ayrıca belirlenecektir.

---

## 12. Çöp Kutusu ve Silme Davranışı

### 12.1. Hızlı geri alma

Kullanıcı bir içeriği sildiğinde içerik normal görünümden kaldırılır ve Çöp Kutusu'na taşınır.

İlk anda ekranda kısa süreli bir "Geri Al" seçeneği belirir.

Kullanıcı bu süre içinde geri alırsa içerik eski konumuna döner.

Bu sayede her silme işleminde ayrıca bir onay penceresi açılması gerekmez.

### 12.2. Çöp Kutusu işlemleri

Çöp Kutusu içinde:

- İçeriği geri yükleme
- Kalıcı olarak silme

işlemleri bulunacaktır.

Kalıcı silme işlemi için ayrıca onay istenecektir.

### 12.3. Otomatik silme süresi

Varsayılan süre 30 gündür.

Kullanıcı bu süreyi ayarlardan değiştirebilmelidir.

Süre dolduğunda içerik otomatik olarak kalıcı silinebilir. Kullanıcı isterse süre dolmadan manuel olarak da kalıcı silebilir.

Bu özellik fotoğraf, video ve dosyalar gibi depolama maliyetini etkileyebilecek içerikler için de geçerlidir.

---

## 13. Hesap ve Kimlik Doğrulama

### 13.1. Giriş seçenekleri

Önerilen giriş sistemi:

- Google ile giriş
- Apple ile giriş
- E-posta ve şifre ile kayıt/giriş
- E-posta doğrulama
- Şifre sıfırlama

Bu yapı henüz teknik olarak uygulanmamıştır; kimlik doğrulama sağlayıcısı ayrıca seçilecektir.

### 13.2. Kullanıcı adı

Sosyal medya olmadığı için kullanıcı adı, takipçi veya benzeri sosyal profil kavramlarına ihtiyaç yoktur.

Ancak salt okunur paylaşım özelliği nedeniyle kullanıcının bir takma adı/görünen adı bulunması uygun görülmüştür.

### 13.3. Profil

Profilde şu bilgiler bulunabilir:

- Profil fotoğrafı
- Takma ad / görünen ad
- Paylaşılan İçerikler bölümü

**Bio alanı olmayacaktır.**

Profilin amacı sosyal etkileşim sağlamak değil, kullanıcının kimliğini ve paylaşımlarını yönetmesine yardımcı olmaktır.

---

## 14. Depo Güvenliği ve Gizlilik

### 14.1. Temel gizlilik ilkesi

Depolar ve içerikler kişisel olacaktır.

Platformun temel kullanımında başka kullanıcıların kişisel arşivleri görüntülenemez.

### 14.2. Depo kilidi

Her depo kartında kilit simgesi yerine bir on/off switch bulunacaktır.

- OFF: Depo normal şekilde açılır.
- ON: Depo ek şifre korumasıyla açılır.

İlk kez koruma etkinleştirildiğinde kullanıcıdan depo şifresi belirlemesi istenir.

Kullanıcı daha önce ayarlardan depo kilidi belirlemişse switch'i etkinleştirmek mevcut korumayı kullanabilir.

Depo şifresi, hesap şifresinden ayrı bir güvenlik katmanı olacaktır.

### 14.3. Güvenlik ayrıntıları

Aşağıdaki konular henüz ayrıntılı olarak tasarlanmamıştır:

- Depo şifresinin unutulması durumunda kurtarma yöntemi
- Depo korumasının teknik uygulaması
- Paylaşım bağlantılarının güvenlik mekanizması
- Hassas metadata bilgilerinin erişim kontrolleri

Bu konular teknik mimari belirlenirken ele alınmalıdır.

---

## 15. Salt Okunur Paylaşım

### 15.1. Paylaşım yaklaşımı

Platform sosyal medya olmayacaktır. Ancak kullanıcı isterse depolarını veya belirli içeriklerini bir bağlantı aracılığıyla başkalarına gösterebilecektir.

Paylaşım bağlantısını açan kişi, ilgili içeriği salt okunur olarak görüntüler.

Bağlantıya erişen kişi içeriği platform üzerinden değiştiremez veya silemez.

### 15.2. Paylaşımın kullanıcı tarafından kontrol edilmesi

Kullanıcı paylaşım bağlantılarını daha sonra yönetebilmelidir.

Profildeki **Paylaşılan İçerikler** bölümü üzerinden:

- Aktif paylaşım bağlantılarını görebilir.
- Bağlantının hangi depo veya içerikle ilişkili olduğunu anlayabilir.
- İstediği bağlantının erişimini kaldırabilir.

Böylece kullanıcı aylar önce nerede paylaştığını hatırlamadığı bir bağlantıyı da yönetebilir.

Paylaşımı iptal etmek, ilgili bağlantının platform üzerinden erişimini kapatmalıdır.

### 15.3. Dışa aktarma ve paylaşım arasındaki fark

Kullanıcı isterse içeriği TXT, PDF, PNG, JPG gibi desteklenen formatlarda cihazına indirebilir.

Ancak her paylaşımın dosya indirme biçiminde olması zorunlu değildir. Salt okunur web bağlantısı da sunulacaktır.

### 15.4. Henüz kesinleştirilmemiş paylaşım ayrıntıları

- Kullanıcının deponun tamamını mı yoksa seçtiği içerikleri mi paylaşabileceği
- Paylaşım bağlantısına şifre koyma
- Bağlantıya son kullanma tarihi belirleme
- Paylaşım görünümünde hangi metadata alanlarının gösterileceğini özelleştirme

Bu konularda henüz nihai uygulama kararı alınmamıştır.

Deponun tamamını ve seçili içerikleri paylaşabilme seçeneği önerilmiştir; ancak kullanıcı tarafından henüz kesin olarak onaylanmamıştır.

---

## 16. Kullanıcı Deneyimi İçin Temel İlkeler

Projenin geliştirilmesi boyunca aşağıdaki ilkeler korunmalıdır:

1. Kullanıcı gereksiz adımlarla yorulmamalıdır.
2. Depo oluşturmak, içerik eklemeyi zorunlu kılmamalıdır.
3. Klasör oluşturmak için ayrıca soru sorulmamalıdır.
4. İçerik türüne göre uygun arayüz kullanılmalıdır.
5. Arşiv düzeni kullanıcıyı sınırsız ve karmaşık bir klasör ağacına zorlamamalıdır.
6. Görsel seçimler ve önizlemeler mümkün olduğunca kullanılmalıdır.
7. Tıklamalar ve ekran geçişleri yumuşak olmalıdır.
8. AI önerileri kullanıcı tarafından değiştirilebilir olmalıdır.
9. Kullanıcı içeriklerini ararken birden fazla daraltma ve filtreleme yolundan yararlanabilmelidir.
10. Güvenlik ve gizlilik, sonradan eklenecek özellikler olarak değil, tasarımın temel koşulları olarak ele alınmalıdır.

---








## 17. Şimdilik Kararlaştırılmayan Konular

Aşağıdaki konular bilerek açık bırakılmıştır:

- İlk dört akıllı deponun hangileri olacağı
- Diğer akıllı depoların listesi
- Her akıllı deponun ayrıntılı tasarımı
- Her standart formatın tüm özellikleri
- Depo içerik sınırları
- Veritabanı ve dosya depolama teknolojileri
- Ücretsiz depolama katmanlarının sınırları
- AI entegrasyonunun teknik yöntemi
- Akıllı aramanın teknik kapsamı
- Paylaşım bağlantılarının ayrıntılı yetkilendirme seçenekleri
- Paylaşım bağlantılarının şifre ve süre seçenekleri
- Bir klasör silindiğinde içindeki içeriklerin davranışı
- Depo şifresi kurtarma yöntemi
- Her içerik türünün dışa aktarma seçenekleri
- Her deponun içerik görünümü ve varsa kullanıcıya sunacağı görünüm tercihleri

Bu kararlar ilgili özellik tasarlanırken ayrıca ele alınacaktır.

Not: Bu listedeki maddelerin hepsinin geliştirmeye başlamadan önce kesinleştirilmesi zorunlu değildir. İlk sürüm için gerekli kararlar önceliklendirilecek, sonraya bırakılabilecek konular ayrı tutulacaktır.

---
