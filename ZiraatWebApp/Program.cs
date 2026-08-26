var builder = WebApplication.CreateBuilder(args);

//builder.WebHost.UseUrls("http://localhost:52369");

var app = builder.Build();

app.MapGet("/", () => "Hoş Geldiniz");

app.Run();