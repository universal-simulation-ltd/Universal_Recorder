import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Dijital ses nasıl çalışır',
    summary: 'Örnekleme hızı, bit derinliği ve kanallar, sade bir dille.',
    group: 'Temel bilgiler',
    body: `Ses, değişen hava basıncından oluşan bir dalgadır. Mikrofon bu dalgayı değişen bir elektrik sinyaline dönüştürür, cihazınız da sinyali saklayabilmek için sayılara çevirir.

## Örnekleme hızı

Bunun için cihaz sinyali saniyede binlerce kez ölçer. Her ölçüme örnek denir; saniyede alınan örnek sayısı ise örnekleme hızıdır ve hertz (Hz) ya da kilohertz (kHz) ile ölçülür.

- 44,1 kHz, yani saniyede 44.100 örnek, ses CD’lerinde kullanılan hızdır.
- 48 kHz, video için ve bilgisayarlardaki ses donanımlarının çoğu için olağan hızdır.

Bir örnekleme hızı, kendi değerinin yaklaşık yarısına kadar olan sesleri yakalayabilir. İnsan kulağı en fazla 20 kHz civarına kadar duyar; bu yüzden 40 kHz’in biraz üzerindeki hızlar dinlemek için yeterlidir.

## Bit derinliği

Her örnek bir sayı olarak saklanır ve bit derinliği bu sayının ne kadar hassas olabileceğini belirler. CD’lerde kullanılan 16 bit ses, her örnek için 65.536 farklı düzeye izin verir. Daha fazla bit, daha az arka plan cızırtısı ve en sessiz ile en yüksek sesler arasında daha fazla pay demektir; bu da bir sesli nottan çok stüdyoda önem taşır.

## Kanallar

Mono tek kanallıdır, stereo iki kanallıdır. Stereo bir kayıt, aynı uzunluktaki mono bir kaydın iki katı veri içerir.

## Bunun dosya boyutu için önemi

Sıkıştırılmamış ses hızla büyür. 48 kHz ve 16 bit stereo bir dakika yaklaşık 11,5 MB eder. Bu yüzden çoğu biçim sesi sıkıştırır; bir sonraki makale bunu açıklar.

Universal Recorder’da WAV olarak indirme, kaydınızın çözüldüğü örnekleme hızını korur; bu hız cihazınızın ses donanımına bağlıdır ve genellikle 48 kHz’tir. Kayıt 16 bit olarak saklanır.`,
  },
  {
    id: 'audio-formats',
    title: 'Ses ve video biçimleri',
    summary: 'WebM, MP3, WAV ve MP4 ile hangisini seçmeniz gerektiği.',
    group: 'Temel bilgiler',
    body: `Universal Recorder bir kaydı size birkaç farklı biçimde verebilir. Bu biçimler boyut, kalite ve nerelerde oynatılabildikleri açısından farklılık gösterir.

## Sıkıştırılmış ve sıkıştırılmamış

Sıkıştırılmamış ses her örneği olduğu gibi saklar; bu yüzden büyüktür. Sıkıştırılmış biçimler, duyulması zor ayrıntıları dışarıda bırakmak için bir codec kullanır ve dosyaları kat kat küçültür. Buna kayıplı sıkıştırma denir: dışarıda bırakılan ayrıntı geri getirilemez.

## Biçimler

- **WebM**, çoğu tarayıcının sesi doğrudan kaydettiği biçimdir ve Opus adlı bir codec kullanır. Üçü arasında en küçüğüdür. Opus, özellikle konuşmada, düşük bit hızlarında bile çok iyi duyulur. Modern tarayıcılar ve pek çok medya oynatıcı bunu oynatır, ancak bazı eski yazılımlar oynatmaz.
- **MP3**, var olan en yaygın desteklenen ses biçimidir. Neredeyse her cihaz, araç teybi ve düzenleme programı onu oynatır. Uygulama bunu 128 kbps ile üretir; bu, günlük kullanım için iyi bir kalitedir, ancak aynı ses için WebM’den daha büyüktür.
- **WAV**, sıkıştırılmamış 16 bit sestir. Açık ara en büyüğüdür, ama neredeyse her ses düzenleyicide açılır; bu yüzden kaydı düzenlemeyi düşünüyorsanız seçmeniz gereken biçimdir.

## MP3 ve WAV nereden gelir

Tarayıcınız doğrudan yalnızca tek bir biçimde kayıt yapar. MP3 ya da WAV olarak indirdiğinizde uygulama, özgün kaydı çözer ve indirdiğiniz anda, kendi cihazınızda yeniden kodlar.

Bundan iki sonuç çıkar:
- WAV’a dönüştürmek, özgün kayıtta olmayan bir kaliteyi eklemez. Kaydı daha iyi değil, düzenlemesi daha kolay hâle getirir.
- MP3, ilk sıkıştırmanın üzerine ikinci bir kayıplı sıkıştırmadır. Çoğu konuşma kaydında bunu duymazsınız, ama en sadık kopya her zaman özgün kayıttır.

## Ekran ve web kamerası kayıtları

Video içeren kayıtlar video dosyası olarak kaydedilir. Tarayıcı destekliyorsa bu, çoğu video oynatıcıda ve sunum yazılımında oynatılabilen H.264 video ve AAC sesli bir MP4’tür. Desteklemiyorsa kayıt WebM olur. MP3 ve WAV yalnızca video içermeyen kayıtlar için sunulur.`,
  },
  {
    id: 'permissions',
    title: 'Mikrofon, kamera ve ekran izinleri',
    summary: 'Tarayıcınızın neden sorduğu ve reddettiyseniz ne yapmanız gerektiği.',
    group: 'Nasıl çalışır',
    body: `Bir web sitesi siz izin vermeden mikrofonunuzu, kameranızı ya da ekranınızı kullanamaz. Universal Recorder bunlardan birine ilk kez ihtiyaç duyduğunda tarayıcınız size sorar ve kullanımda oldukları sürece bir gösterge görüntüler.

## Ne zaman ne istenir

- **Mikrofon**: mikrofonu içeren bir kaydı başlattığınızda.
- **Kamera**: web kamerasını içeren bir kaydın önizlemesini açtığınızda ya da kaydı başlattığınızda.
- **Ekran**: ekranınızın ya da sistem sesinin önizlemesini her açtığınızda veya kaydını her başlattığınızda, tarayıcı kendi seçicisini gösterir; böylece tüm ekranı, bir pencereyi ya da tek bir sekmeyi seçebilirsiniz. Uygulama bu seçimi sizin yerinize yapamaz.

Mikrofona ya da kameraya izin verene kadar cihaz listeleri genel adlar gösterebilir. Tarayıcılar cihazlarınızın gerçek adlarını yalnızca izin verdiğiniz sitelere gösterir.

## Sistem sesini kaydetmek

Sistem sesi, bilgisayarınızın çaldığı sestir; örneğin bir görüşme ya da bir video. Chrome ve Edge’de bu ses, ekran paylaşım seçicisi üzerinden gelir: onaylamadan önce sesi paylaşma seçeneğini işaretleyin. Firefox ve Safari ekran seçicilerinde ses sunmaz; bu yüzden mikrofonunuzu kaydedebilirler ama sistem sesini kaydedemezler. Yalnızca sistem sesini isterseniz, tarayıcı sesi yalnızca bu yolla sunduğu için yine de ekran seçicisini gösterir, ancak uygulama görüntüyü saklamaz.

Telefonlarda ve tabletlerde tarayıcılar ekran ya da sistem sesi yakalamayı sunmaz; bu yüzden orada kaydedilebilen şey mikrofondur.

## Reddettiyseniz

Bir izni engellediyseniz tarayıcı bu seçimi hatırlar ve uygulama yeniden soramaz. Bunu değiştirmek için tarayıcınızda site ayarlarını açın (genellikle web adresinin solundaki simgeden), bu site için mikrofona ya da kameraya izin verin ve sayfayı yeniden yükleyin.

Bilgisayarda, işletim sisteminin de tarayıcınızın bunları kullanmasına izin vermesi gerekebilir:
- **macOS**: Sistem Ayarları’nı, ardından Gizlilik ve Güvenlik’i, ardından Mikrofon, Kamera ya da Ekran Kaydı’nı açın ve tarayıcınızı etkinleştirin.
- **Windows**: Ayarlar’ı, ardından Gizlilik ve güvenlik’i, ardından Mikrofon ya da Kamera’yı açın ve masaüstü uygulamalarının erişimi olduğundan emin olun.`,
  },
  {
    id: 'how-recording-works',
    title: 'Kayıt nasıl işler',
    summary: 'Kayda basmanızla bir dosyanızın olması arasında neler olur.',
    group: 'Nasıl çalışır',
    body: `Universal Recorder’daki her şey tarayıcınızın içinde, kendi cihazınızda gerçekleşir.

## Neyin kaydedileceğini seçmek

Dört kaynağı dilediğiniz gibi birleştirerek kaydedebilirsiniz: mikrofonunuz, sistem sesi, ekranınız ve web kameranız. Birden fazla ses kaynağı kaydettiğinizde bunlar tek bir ses kanalında karıştırılır.

Ekranı ve web kamerasını birlikte kaydettiğinizde kamera görüntüsü ekranın üzerine küçük bir pencere içinde yerleştirilir. Köşesini, boyutunu ve şeklini seçebilir ya da onu istediğiniz yere sürükleyebilirsiniz. Yalnızca web kamerasıyla, kamera görüntüsü tüm kareyi kaplar.

## Kayıt sırasında

Tarayıcınızın yerleşik kaydedicisi kaynakları yakalar ve kayıt ilerledikçe kodlar. Duraklatıp devam edebilir, mikrofonun sizi duyup duymadığını görmek için canlı bir seviye göstergesini izleyebilir ve her videonun önizlemesini görebilirsiniz.

Durdur’a basana kadar sekmeyi açık tutun. Kayıt, sürdüğü boyunca sekmenin içinde oluşturulur; bu yüzden durdurmadan önce sayfayı kapatmak ya da yenilemek kaydın kaybolmasına yol açar.

## Durdurduğunuzda

Bitmiş kayıt, bu cihazdaki tarayıcınızın depolama alanına kaydedilir. Oradan dinleyebilir, yeniden adlandırabilir, indirebilir ya da silebilirsiniz. Siz indirene kadar indirilenler klasörünüzde bulunmaz.

WebM olarak, ya da video kaydı için MP4 olarak indirmek, dosyayı tam olarak kaydedildiği hâliyle verir. MP3 ya da WAV seçmek, dosyayı o anda cihazınızda dönüştürür.

## Daha iyi bir kayıt için ipuçları

- Başlamadan önce listeden doğru mikrofonu seçin. Mikrofonlu bir kulaklık ya da ağzınıza yakın bir mikrofon, genellikle bir dizüstü bilgisayarın yerleşik mikrofonundan daha net duyulur.
- Önemli bir şeyden önce birkaç saniye kaydedip dinleyin.
- Mikrofonunuzu ve sistem sesini birlikte kaydediyorsanız, mikrofonun hoparlörlerinizden gelen sesi de almaması için kulaklık takın.
- Ekran kayıtları hızla büyür. Yalnızca ses içeren kayıtlar küçük kalır.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Kayıtlarınız nerede saklanır',
    summary: 'Siz silene kadar, bu cihazda, tarayıcınızın içinde.',
    group: 'Gizlilik ve güvenlik',
    body: `Kaydı durdurduğunuzda kayıt, IndexedDB adlı bir özellik kullanılarak bu cihazdaki tarayıcınızın kendi depolama alanına kaydedilir. Hiçbir yere yüklenmez.

## Bunun anlamı

- **Bu cihazdaki bu tarayıcıya aittir.** Dizüstü bilgisayarınızda Chrome’da yaptığınız bir kayıt başka bir tarayıcıda, telefonunuzda ya da başka bir bilgisayarda görünmez.
- **Henüz klasörlerinizde bir dosya değildir.** Gönderebileceğiniz, düzenleyebileceğiniz ya da yedekleyebileceğiniz bir kopya için indirme düğmesini kullanın ve bir biçim seçin.
- **Tarayıcı verilerini temizlemek kaydı siler.** Bu site için saklanan verileri temizlerseniz ya da bir temizlik aracı bunu yaparsa, kayıtlarınız da onlarla birlikte gider. Gizli (özel) tarama pencereleri genellikle kapatıldıklarında depolama alanlarını siler.
- **Tarayıcılar depolamayı sınırlar.** Her siteye boş disk alanınızın bir bölümü ayrılır ve uzun ekran kayıtları bunun büyük kısmını kullanabilir.

## Silme

Listeden istediğiniz kaydı silebilir ya da önce onay isteyen **Delete all** (tümünü sil) seçeneğini kullanabilirsiniz. Bu kayıtlar yalnızca cihazınızda bulunduğundan, silinen bir kayıt geri getirilemez.

## Bir kopyayı güvende tutmak

Tarayıcı depolaması kullanışlıdır ama bir yedek değildir. Önemli olan her şeyi indirin ve dosyayı güvenli bir yerde saklayın. Universal ID ile oturum açtıysanız, buluta kaydetme makalesinde açıklandığı gibi bir kaydı çevrimiçi de tutabilirsiniz.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Bir kaydı buluta kaydetmek',
    summary: 'Bir kaydın cihazınızdan çıkabilmesinin isteğe bağlı tek yolu.',
    group: 'Gizlilik ve güvenlik',
    body: `Kaydetme, dönüştürme ve saklama işlemlerinin tümü cihazınızda gerçekleşir. Bir kaydın cihazınızdan çıkmasının tek bir yolu vardır: o kayıtta **Save to cloud** (buluta kaydet) düğmesine basmak. Siz basmadıkça hiçbir şey yüklenmez.

## Nasıl çalışır

- Universal ID ile oturum açmış olmanız gerekir. Oluşturmak ücretsizdir.
- Kayıtları buluta kaydetmek Universal ID ile ücretsizdir. Ücretsiz hesapların cömert bir sınırı vardır; bir gün bu sınıra ulaşırsanız artık ihtiyacınız olmayan bir bulut kaydını silin ya da daha fazlasını edinin.
- Her bulut kaydı 50 MB ile sınırlıdır. Bu, saatlerce ses ama yalnızca birkaç dakikalık ekran videosu demektir; bu yüzden uzun video kayıtları yalnızca indirilebilir. Boyut, yükleme başlamadan önce kontrol edilir.
- Bir yükleme başarısız olursa sınırınızdan sayılmaz.

## Kimler erişebilir

Buluttaki kopya özel bir depolama alanında tutulur ve herkese açık bir bağlantısı yoktur. Ona yalnızca siz, kaydettiğiniz Universal ID ile oturum açarak erişebilirsiniz. Universal ID'niz başka kişilerin de bulunduğu bir şirkete aitse, **In the cloud** panelindeki her bulut kaydında bir **Share with** kutusu bulunur. Kutu başta işaretsizdir. İşaretlerseniz şirketinizdeki herkes o kaydı oynatıp indirebilir, ancak yalnızca siz silebilirsiniz. Kaydı yeniden özel yapmak için işareti kaldırın. Depolama alanına gidip gelirken şifreli bir bağlantı kullanılır.

## Başka bir cihazdan kullanmak

Bir kayıt buluta alındıktan sonra, başka bir cihazda oturum açıp **In the cloud** (bulutta) panelinden onu dinleyebilir ya da indirebilirsiniz. Siz silene kadar orada kalır.

## Ne olmadığı

Buluta kaydetmek, tüm kitaplığınızın eşitlenmesi değil, tek bir kaydın kopyasıdır. Diğer kayıtlarınız, onları yaptığınız cihazda kalır. Bu cihazdan bir kaydı silmek buluttaki kopyasını silmez; buluttaki kopyayı silmek de bu cihazdakini silmez.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'Cihazınızdan neler çıkar',
    summary: 'Buluta kaydetmeyi seçmediğiniz sürece kaydettiğiniz hiçbir şey.',
    group: 'Gizlilik ve güvenlik',
    body: `Mikrofonunuz, kameranız ve ekranınız kendi tarayıcınız tarafından yakalanır, kaydedilir ve saklanır. Bir kayıtta **Save to cloud** düğmesine basmadığınız sürece hiçbiri hiçbir yere gönderilmez: ne ses, ne video, ne önizleme ne de ekran görüntüsü.

Uygulama kayıtlarınızı yazıya dökmez ya da analiz etmez ve konuşma tanıma özelliği yoktur.

## Uygulama interneti ne için kullanır

- **Uygulamanın yüklenmesi** ve her güncellemede nelerin değiştiğine dair notlar.
- **Universal ID ile oturum açma**, yalnızca siz isterseniz. Hesap olmadan kaydedebilir, dönüştürebilir ve indirebilirsiniz.
- **Uygulamanın açıldığına dair bir not**, oturum açtıysanız ziyaret başına bir kez gönderilir. Kayıtlarınızla ilgili hiçbir şey içermez.
- **Bir “kullanımda” sinyali**, uygulama açık ve ekranda olduğu sürece her 45 saniyede bir gönderilir; böylece uygulama kaç kişinin kullandığını gösterebilir. Uygulamanın adını, bu cihazda oluşturulan rastgele bir kimliği ve oturum açtıysanız hesabınızı içerir.
- **Bulut kayıtları**, yalnızca siz istediğinizde; buluta kaydetme makalesinde açıklandığı gibi.

## Biçim dönüştürme

Bir kaydı MP3’e ya da WAV’a dönüştürmek de cihazınızda gerçekleşir. Dönüştürme sayfanın içinde çalışır ve bunun için hiçbir şey yüklenmez.

## Kendiniz doğrulayın

Tarayıcınız, bir site mikrofonunuzu, kameranızı ya da ekranınızı kullandığında bir gösterge görüntüler ve oradan paylaşımı istediğiniz an durdurabilirsiniz. Hiçbir şeyin gönderilmediğinden emin olmak istiyorsanız tarayıcınızın geliştirici araçlarını açın, Ağ sekmesine geçin ve bir kayıt yapın: kayıt orada hiçbir zaman görünmez.`,
  },
]

export default articles
