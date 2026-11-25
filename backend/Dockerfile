# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:11.0 AS build
WORKDIR /src

COPY DevMeet.slnx ./
COPY src/Shared/DevMeet.Shared/DevMeet.Shared.csproj src/Shared/DevMeet.Shared/
COPY src/Host/DevMeet.API/DevMeet.API.csproj src/Host/DevMeet.API/
COPY src/Modules/Identity/Identity.Contracts/Identity.Contracts.csproj src/Modules/Identity/Identity.Contracts/
COPY src/Modules/Identity/Identity.Module/Identity.Module.csproj src/Modules/Identity/Identity.Module/
COPY src/Modules/Activities/Activities.Contracts/Activities.Contracts.csproj src/Modules/Activities/Activities.Contracts/
COPY src/Modules/Activities/Activities.Module/Activities.Module.csproj src/Modules/Activities/Activities.Module/
COPY src/Modules/Comments/Comments.Module/Comments.Module.csproj src/Modules/Comments/Comments.Module/
COPY src/Modules/Profiles/Profiles.Contracts/Profiles.Contracts.csproj src/Modules/Profiles/Profiles.Contracts/
COPY src/Modules/Profiles/Profiles.Module/Profiles.Module.csproj src/Modules/Profiles/Profiles.Module/
COPY src/Modules/Notifications/Notifications.Contracts/Notifications.Contracts.csproj src/Modules/Notifications/Notifications.Contracts/
COPY src/Modules/Notifications/Notifications.Module/Notifications.Module.csproj src/Modules/Notifications/Notifications.Module/
COPY src/Modules/Payments/Payments.Contracts/Payments.Contracts.csproj src/Modules/Payments/Payments.Contracts/
COPY src/Modules/Payments/Payments.Module/Payments.Module.csproj src/Modules/Payments/Payments.Module/
COPY src/Modules/Diagnostics/Diagnostics.Module/Diagnostics.Module.csproj src/Modules/Diagnostics/Diagnostics.Module/

RUN dotnet restore src/Host/DevMeet.API/DevMeet.API.csproj

COPY src/ src/
RUN dotnet publish src/Host/DevMeet.API/DevMeet.API.csproj -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ───────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:11.0 AS runtime
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends wget \
 && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
RUN chown -R $APP_UID:$APP_UID /app
USER $APP_UID

ENV ASPNETCORE_ENVIRONMENT=Docker
ENV ASPNETCORE_HTTP_PORTS=8080

EXPOSE 8080
ENTRYPOINT ["dotnet", "DevMeet.API.dll"]
