# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /app

COPY src/API/API.csproj                     src/API/
COPY src/Application/Application.csproj     src/Application/
COPY src/Persistence/Persistence.csproj     src/Persistence/
COPY src/Domain/Domain.csproj               src/Domain/
COPY src/Infrastructure/Infrastructure.csproj src/Infrastructure/

RUN dotnet restore src/API/API.csproj

COPY . .
WORKDIR /app/src/API
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Docker
ENV ASPNETCORE_HTTP_PORTS=8080

EXPOSE 8080
ENTRYPOINT ["dotnet", "API.dll"]
