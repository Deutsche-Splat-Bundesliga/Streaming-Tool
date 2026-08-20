# Backend – Technical Documentation

## Stack

| Component         | Technology                    |
| ----------------- | ----------------------------- |
| Framework         | ASP.NET Core 9.0              |
| Real-Time         | SignalR                       |
| ORM               | Entity Framework Core 9       |
| Database          | SQLite (`dsb-stream-tool.db`) |
| API-Documentation | Swagger / Swashbuckle         |

---

## Project Structure

```
DSB.StreamBackend/
├── Controllers/                            # REST-Endpoints
│   ├── ApiKeysController.cs                # API key management (list/create/revoke)
│   ├── ApiLogController.cs                 # API session request log
│   ├── ApiSettingsController.cs            # API authentication settings
│   ├── BroadcastController.cs             # + Stream Deck convenience endpoints
│   ├── CommentatorBoxTimedataController.cs
│   └── SocialsController.cs
├── Middleware/
│   └── ApiAuthenticationMiddleware.cs      # Guards /api, records the session log
├── Hubs/
│   ├── EventHub.cs                         # SignalR-Hub for Events
│   ├── IEventClient.cs                     # SignalR-Interface for Events
│   ├── IOverlayClient.cs                   # SignalR-Interface for Overlays
│   └── OverlayHub.cs                       # SignalR-Hub for Overlays
├── Services/                               # Business Logic + DB Access
│   ├── ApiKeyService.cs                    # Key generation, hashing, validation
│   ├── ApiRequestLog.cs                    # In-memory session log (singleton)
│   ├── ApiSettingsService.cs
│   ├── BroadcastStateService.cs
│   ├── CommentatorBoxTimeDataService.cs
│   └── LogService.cs
├── Models/                                 # EF-Entities
│   ├── ApiKeyEntity.cs                     # Issued API keys (hash only)
│   ├── ApiSettingsEntity.cs               # API authentication settings
│   ├── BroadcastStateEntity.cs             # Main State
│   ├── CommentatorBoxTimeDataEntity.cs     # Commentator Box Timing Information
│   ├── MapStateEntity.cs                   # Maps (1:N)
│   └── SocialsEntity.cs                    # Socials Information
├── Dtos/
│   ├── ApiKeyDto.cs / ApiKeyCreatedDto.cs / CreateApiKeyRequestDto.cs
│   ├── ApiLogEntryDto.cs / ApiSettingsDto.cs
│   ├── BroadcastStateDto.cs
│   ├── CommentatorBoxTimeDataDto.cs
│   ├── MapStateDto.cs
│   └── SocialsDto.cs
├── Context/
│   └── StreamToolDbContext.cs              # EF DbContext
├── Logging/                                # Logging-Related Classes
│   ├── ConsoleLogSink.cs
│   ├── ILogService.cs
│   ├── ILogSink.cs
│   ├── LogEntry.cs
│   ├── LoggingScope.cs
│   └── LogLevel.cs
└── Migrations/                             # EF-Migrations (auto-apply on Start)
```

> The public REST API, authentication, API keys and the Stream Deck convenience endpoints are
> documented separately in [`api.md`](./api.md).

---

## Data Model

The entire Broadcast State is held in the database as **a single row** (`BroadcastStateEntity.Id = 1`). There is no multi-tenant support; the state is global.

### `BroadcastStates` (1 Column)

| Column               | Type       | Description                              |
| -------------------- | ---------- | ---------------------------------------- |
| `Id`                 | `int`      | Always `1` (Singleton)                   |
| `TeamAlphaName`      | `string`   | Name Team Alpha                          |
| `TeamBravoName`      | `string`   | Name Team Bravo                          |
| `AlphaIsLeft`        | `bool`     | Side Display Alpha                       |
| `ScoreAlpha`         | `int`      | Point Score Alpha                        |
| `ScoreBravo`         | `int`      | Point Score Bravo                        |
| `Streamer`           | `string`   | Streamer Name                            |
| `Commentator1/2`     | `string`   | Commentator Names                        |
| `ShowMapScreen`      | `bool`     | Overlay Visibility                       |
| `ShowScoreBox`       | `bool`     |                                          |
| `ShowCommentatorBox` | `bool`     |                                          |
| `ShowInfobox`        | `bool`     |                                          |
| `Season`             | `int`      | Current Season                           |
| `Division`           | `int`      | Current Division                         |
| `StartTime`          | `DateTime` | Start time of the next match             |
| `CurrentColorsId`    | `int`      | Current id of the displayed match colors |
| `ColorLockActive`    | `boolean`  |                                          |

### `MapStates` (0..N Columns)

Foreign Key `BroadcastStateEntityId → BroadcastStates.Id` with `ON DELETE CASCADE`.

| Column                | Type            | Description        |
| --------------------- | --------------- | ------------------ |
| `Id`                  | `string` (GUID) | Primary Key        |
| `Order`               | `int`           | Order              |
| `MapId` / `MapName`   | `string`        | Map Reference      |
| `ModeId` / `ModeName` | `string`        | Mode Reference     |
| `ImageUrl`            | `string`        | Preview Image      |
| `Winner`              | `string?`       | `null` = No Result |
| `IsVisible`           | `bool`          | Overlay Visibility |

### `Socials` (1 Column)

| Column          | Type     | Description               |
| --------------- | -------- | ------------------------- |
| `Id`            | `int`    | Always `1` (Singleton)    |
| `XHandle`       | `string` | DSB X/Twitter Handle      |
| `DiscordInvite` | `string` | DSB Discord Server Invite |

### `CommentatorBoxTimeData` (1 Column)

| Column                         | Type  | Description                                                                                       |
| ------------------------------ | ----- | ------------------------------------------------------------------------------------------------- |
| `Id`                           | `int` | Always `1` (Singleton)                                                                            |
| `ShowDisplayIntervalInSeconds` | `int` | How long the commentator box gets displayed on scorebox overlay (In seconds)                      |
| `HideDisplayIntervalInSeconds` | `int` | How long the commentator box is hidden on scorebox overlay (In seconds)                           |
| `DisplayMode`                  | `int` | Sets the blending mode in which the commentator box gets shown. `0` for manual, `1` for automatic |

### `ApiSettings` (1 Column)

| Column                         | Type   | Description                                                     |
| ------------------------------ | ------ | --------------------------------------------------------------- |
| `Id`                           | `int`  | Always `1` (Singleton)                                          |
| `AllowUnauthenticatedRequests` | `bool` | `true` (default) allows API access without a key. See `api.md`. |

### `ApiKeys` (0..N Rows)

Only a hash of each key is stored; the plaintext is shown once at creation. See [`api.md`](./api.md).

| Column        | Type                  | Description                                                    |
| ------------- | --------------------- | ---------------------------------------------------------------|
| `Id`          | `Guid`                | Primary Key                                                     |
| `Name`        | `string`               | Human-readable name (e.g. "Stream Deck")                       |
| `KeyPrefix`   | `string`               | First 12 chars of the key for display (`stt_…`)                |
| `KeyHash`     | `string`               | SHA-256 hash (hex) of the plaintext key                        |
| `AccessLevel` | `ApiKeyAccessLevel`    | `ReadOnly` (0) or `ReadWrite` (1), serialized as `int` over JSON |
| `CreatedAt`   | `DateTime`             | Creation time (UTC)                                             |
| `LastUsedAt`  | `DateTime?`            | Last time the key authenticated a request, or null              |

---

## REST API

> The public API surface, authentication, API keys and Stream Deck convenience endpoints are
> documented in detail in [`api.md`](./api.md). The sections below describe the core data endpoints.

Base URL: `/api/broadcast`

### `GET /api/broadcast/state`

Gets the current Broadcast State. Automatically adds the Singleton-Row, if it doesn't exist (Upsert).

**Response:** `BroadcastStateDto` (200)

---

### `POST /api/broadcast/state`

Overwrites the Broadcast State und broadcasts the Result to all connected Overlay Clients via SignalR.

**Body:** `BroadcastStateDto`  
**Response:** `BroadcastStateDto` (200)

Maps are handled via Upsert: Existing Maps are matched and updated based on their GUID, missing Maps get deleted, new Maps added.

### `GET /api/socials/socials`

Gets the current Socials. Automatically adds the Singleton-Row, if it doesn't exist (Upsert).

**Response:** `SocialsDto` (200)

---

### `POST /api/socials/socials`

Overwrites the Socials and broadcasts the result to all connected Overlay Clients via SignalR.

**Body:** `SocialsDto`  
**Response:** `SocialsDto` (200)

### `GET /api/commentator-box-time-data/commentator-box-time-data`

Gets the current Commentator Box Time Data. Automatically adds the Singleton-Row, if it doesn't exist (Upsert).

**Response:** `CommentatorBoxTimeDataDto` (200)

---

### `POST /api/commentator-box-time-data/commentator-box-time-data`

Overwrites the Commentator Box Time Data and broadcasts the result to all connected Overlay Clients via SignalR.

**Body:** `CommentatorBoxTimeDataDto`  
**Response:** `CommentatorBoxTimeDataDto` (200)

---

## SignalR

Hub Endpointt: `/overlayHub`

The Interface `IOverlayClient` types all Server→Client Calls:

```csharp
public interface IOverlayClient
{
    Task BroadcastStateUpdated(BroadcastStateDto state);
}
```

| Event                           | Triggered By                          | Payload                     |
| ------------------------------- | ------------------------------------- | --------------------------- |
| `BroadcastStateUpdated`         | `POST /api/broadcast/state`           | `BroadcastStateDto`         |
| `socialsUpdated`                | `POST /api/socials/socials`           | `SocialsDto`                |
| `commentatorBoxTimeDataUpdated` | `POST /api/broadcast/state`           | `CommentatorBoxTimeDataDto` |
| `apiSettingsUpdated`            | `POST /api/api-settings`              | `ApiSettingsDto`            |
| `apiKeysUpdated`                | `POST`/`DELETE /api/api-keys`         | `ApiKeyDto[]`               |
| `apiLogEntryAdded`              | Any handled `/api` request            | `ApiLogEntryDto`            |
| `apiLogCleared`                 | `DELETE /api/api-log`                 | *(none)*                    |

The `api*` events keep the Control Panel's **API-Einstellungen** dialog in sync live — settings,
issued keys and the request log update immediately regardless of which client triggered the change.
See [`api.md`](./api.md) for the full API documentation.

---

## Service Layer

`BroadcastStateService` is registered as **Scoped** (befitting of the `DbContext` lifetime).
`SocialsService` is registered as **Scoped** (befitting of the `DbContext` lifetime).
`CommentatorBoxTimeDataService` is registered as **Scoped** (befitting of the `DbContext` lifetime).
`LoggingService` is registered as **Singleton**.

Core Methods:

Service may be replaced with the desired service, excluding Logging.

- `GetOrCreate[Service]Async()` — private Upsert Helper, adds the Singleton Row, if it doesn't exist
- `Get[Service]Async()` — reads and returns the State as a DTO
- `Update[Service]Async(dto)` — writes State + Maps, returns updated State
- `UpdateMaps(entity, dtoMaps)` — Upset Logic for the Map List
- `ToDto(entity)` — static Mapping Method Entity → DTO

---

## CORS

Allows Origins (configured in `Program.cs`):

- `http://localhost:4200` (Angular Dev)
- `http://localhost:4201`

`AllowCredentials()` is set — required for SignalR with Cookies/Auth.

---

## Startup Behaviour

EF Migrations are automatically applied on start:

```csharp
using var scope = app.Services.CreateScope();
var db = scope.ServiceProvider.GetRequiredService<StreamToolDbContext>();
db.Database.Migrate();
```

The SQLite file (`dsb-stream-tool.db`) gets created in the working directory of the process.

---

## Add New Migration

```bash
dotnet ef migrations add <Name> --project Backend/DSB.StreamBackend
dotnet ef database update
```
