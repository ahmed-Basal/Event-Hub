# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /src

COPY API/API.csproj             API/
COPY Application/Application.csproj Application/
COPY Persistence/Persistence.csproj  Persistence/
COPY Domain/Domain.csproj           Domain/

RUN dotnet restore API/API.csproj

COPY . .
WORKDIR /src/API
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Docker
ENV ASPNETCORE_HTTP_PORTS=8080

EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]
