 Uçtan Uca DevOps ve CI/CD Mimari Demosu
⚠️ YASAL UYARI (DISCLAIMER): Bu proje; yazılım mimarisi, CI/CD süreçleri ve bulut dağıtım teknolojilerini (Docker, Concourse, Render) test etmek amacıyla geliştirilmiş bir Kavram Kanıtlama (Proof of Concept) çalışmasıdır. Gerçek Ziraat Bankası veya Ziraat Teknoloji sistemleri ile hiçbir resmi, ticari veya veri tabanlı bağlantısı yoktur. Yalnızca eğitim ve portfolyo gösterimi içindir; test aşamasında kesinlikle gerçek kişisel veriler kullanılmamalıdır.

📌 Proje Hakkında
Bu uygulama, modern web geliştirme ve DevOps kültürünün uçtan uca nasıl kurgulandığını göstermek amacıyla yaz döneminde tamamlanan bir altyapı/DevOps stajının teknik çıktısı olarak inşa edilmiştir. Sistem, ön yüz ve arka uç mimarilerinin bağımsız çalışıp HTTP üzerinden haberleştiği, bulut tabanlı bir veritabanı ile desteklenen ve kod değişikliklerinin insan eli değmeden canlıya alındığı tam otomatik bir üretim bandına sahiptir.

🚀 Kullanılan Teknolojiler
Arayüz (Frontend)

Çatı / Dil: React & TypeScript

Geliştirme Motoru: Vite

Görev: Kullanıcı etkileşimlerini sayfayı yenilemeden dinamik olarak yönetmek ve API ile JSON formatında asenkron iletişim kurmak.

Arka Uç (Backend)

Çerçeve / Dil: C# ASP.NET Core Web API

Görev: Gelen isteklerin (CORS yapılandırması ile) karşılanması ve iş mantığının yürütülmesi. Geliştirme aşamasında uç nokta testleri için Swagger entegrasyonu aktif edilmiştir.

Veritabanı & ORM

Hizmet Sağlayıcı: Neon DB (Bulut tabanlı PostgreSQL)

Bağlantı Aracı: Entity Framework Core (Npgsql.EntityFrameworkCore.PostgreSQL)

DevOps & Dağıtım (CI/CD)

Konteynerleştirme: Docker

Sürekli Entegrasyon (CI): Concourse

Barındırma (CD): Render

⚙️ CI/CD Boru Hattı (Pipeline) Akışı
Sistemin dağıtım süreci otomasyona bağlanmıştır:

Kod Entegrasyonu: Kod tabanında (Frontend veya API) yapılan değişiklikler GitHub deposuna itilir.

Concourse Tetiklenmesi: Concourse CI yeni sürümü algılar, kodları çeker ve izole bir ortamda gerekli derleme işlemlerini (dotnet build ve npm run build) başlatır.

Dockerizasyon: Hata vermeden derlenen kodlar, Dockerfile talimatlarına göre izole sistem imajlarına dönüştürülür.

Canlıya Alma: İmajlar Render sunucularına aktarılır. Uygulama ayağa kalkarken appsettings.json veya ortam değişkenlerinde gizlenmiş (Secret) bağlantı dizelerini kullanarak Neon DB bulut veritabanı ile güvenli bağlantısını kurar ve 7/24 uyanık hale gelir.

🧑‍💻 Geliştirici Notu
Bu altyapı çalışması, yazılım yaşam döngüsünün paketleme ve dağıtım süreçlerine hakim olmak adına kurgulanmıştır. Bir geliştirici olarak birincil uzmanlık alanım ve kariyer hedefim Derin Öğrenme (Deep Learning) ve Bilgisayarlı Görü (Computer Vision) teknolojileridir. Bu projede elde edilen DevOps deneyimi, gelecekteki yapay zeka modellerinin, tarım veya otonom drone tabanlı görüntü işleme sistemlerinin bulut mimarilerinde canlıya alınması (MLOps) süreçleri için sağlam bir mühendislik temeli oluşturmaktadır.
