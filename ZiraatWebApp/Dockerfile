FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["ZiraatWebApp.csproj", "./"]
RUN dotnet restore "ZiraatWebApp.csproj"
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 52369
ENV ASPNETCORE_URLS=http://+:52369
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ZiraatWebApp.dll"]
