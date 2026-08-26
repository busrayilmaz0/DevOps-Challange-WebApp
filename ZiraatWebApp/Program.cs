var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Statik dosyaları (wwwroot içindeki HTML, CSS, resimler) aktif eder
app.UseDefaultFiles(); // index.html'i otomatik olarak ana sayfa yapar
app.UseStaticFiles();

app.Run();