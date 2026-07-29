# Frontend – Technical Documentation

## Stack

| Component | Technology                   |
| --------- | ---------------------------- |
| Framework | Angular 22.0.1               |
| Language  | TypeScript 6.0               |
| Runtime   | Node / Express (SSR)         |
| Real-Time | SignalR (@microsoft/signalr) |
| Testing   | Vitest                       |
| Linting   | ESLint                       |

---

## Project Structure

```
Frontend/control-panel/
├── src/
│   ├── app/
│   │   ├── dialogs/                # dialog components
│   │   ├── enums/                  # enums
│   │   ├── features/               # feature components
│   │   ├── layouts/                # layout components
│   │   ├── logging/                # logging components
│   │   ├── overlays/               # overlay preview components
│   │   ├── pages/                  # app pages
│   │   ├── services/               # frontend state, API, and SignalR services
│   │   ├── models/                 # shared frontend state models
│   │   ├── app.routes.ts           # client and overlay routes
│   │   ├── app.ts                  # app root component
│   │   ├── app.config.ts           # browser app providers
│   │   └── app.config.server.ts    # SSR bootstrap config
│   ├── main.ts
│   ├── main.server.ts
│   ├── server.ts                   # Express server for SSR
│   └── public/                     # static assets
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── eslint.config.mjs
```

---

## Frontend Architecture

The control panel is a standalone Angular application built with Angular's modern standalone component model.

- `bootstrapApplication(App, appConfig)` starts the browser app.
- `app.routes.ts` defines the main dashboard and overlay preview routes.
- `src/server.ts` serves SSR output and static assets from `dist/control-panel/browser`.
- `@angular/platform-browser` hydration is enabled via `provideClientHydration(withEventReplay())`.

### Routes

| Route                      | Component          |
| -------------------------- | ------------------ |
| `/`                        | `Dashboard`        |
| `/overlay/map-screen`      | `MapScreenDisplay` |
| `/overlay/score-box`       | `ScoreBox`         |
| `/overlay/commentator-box` | `CommentatorBox`   |
| `/overlay/info-box`        | `InfoboxDisplay`   |
| `/overlay/start-screen`    | `StartScreen`      |
| `/overlay/end-screen`      | `EndScreen`        |

---

## Shared Frontend Models

### `BroadcastState`

The frontend shares a broadcast state model used for the control panel and overlay previews.

Key properties:

- `teamAlphaName`, `teamBravoName`
- `alphaIsLeft`
- `startTime`
- `scoreAlpha`, `scoreBravo`
- `streamer`
- `commentator1`, `commentator2`
- `showMapScreen`, `showScoreBox`, `showCommentatorBox`, `showInfobox`
- `maps` (`MapState[]`)
- `season`, `division`, `week`
- `currentColorsId`, `colorLockActive`

### `CommentatorBoxTimeData`

- `hideDisplayIntervalInSeconds`
- `showDisplayIntervalInSeconds`
- `displayMode`

### `Division`

- `id`
- `name`

### LogEntry

- `timestamp`
- `level`
- `message`
- `data`
- `error`
- `scope`

### LogScope (interface)

- `dispose()`

### MapPoolEntry

- `id`
- `mapName`
- `imageUrl`

### MapState

- `id`
- `order`
- `mapId`
- `mapName`
- `modeId`
- `modeName`
- `imageUrl`
- `winner`
- `isVisible`

### Map

- `id`
- `mapName`
- `imageUrl`

### Mode

- `id`
- `name`

### `Socials`

- `xHandle`
- `discordInvite`

---

## Services

The app uses six primary frontend services.

### `Signalr`

- Connects to `http://localhost:7000/overlayHub`.
- Uses `HubConnectionBuilder` with automatic reconnect.
- Exposes reactive signals:
  - `liveState` for broadcast state updates.
  - `liveSocials` for socials updates.
  - `isConnected` for connection status.
- Listens for incoming events:
  - `broadcastStateUpdated`
  - `socialsUpdated`
  - `commentatorBoxTimeDataUpdated`

### `SignalrEvents`

- Connects to `http://localhost:7000/eventHub`.
- Uses `HubConnectionBuilder` with automatic reconnect.
- Dashboard can invoke and listen to certain events that need to be transmitted across all clients and overlays

### `BroadcastStateService`

- Injects `BroadcastApi` and `Signalr`.
- Starts SignalR and reacts to live state updates.
- Holds the current `state` signal with default fallback values.
- Provides frontend-specific data sets:
  - `availableMaps`
  - `availableModes`
  - `availableDivisions`
- Methods:
  - `loadInitialState()` fetches the state from the backend.
  - `update(partial)` merges changes and posts updates.
  - `addMap()` adds a new map entry to the state.

### `SocialsService`

- Injects `SocialsApi` and `Signalr`.
- Starts SignalR and reacts to live socials updates.
- Holds the current `socials` signal.
- Methods:
  - `loadInitialState()` fetches socials from the backend.
  - `update(partial)` merges changes and posts updates.

### `CommentatorBoxTimeDataService`

- Injects `CommentatorBoxTimeDataApi` and `Signalr`.
- Starts SignalR and reacts to live time data updates.
- Holds the current `commentatorBoxTimeData` signal.
- Methods:
  - `loadInitialState()` fetches time data from the backend.
  - `update(partial)` merges changes and posts updates.

### `TeamNameSwitchingService`

- Injects `BroadcastStateService`
- Computes team name and team score data correctly, depending on if `alphaIsLeft` is `true` or `false`
- Methods:
  - `get leftTeamName` gets the team name that should be displayed on the left or top side
  - `get leftScore` gets the team score that should be displayed on the left or top side
  - `get rightTeamName` gets the team name that should be displayed on the right or bottom side
  - `get rightScore` gets the team score that should be displayed on the right or bottom side

### `LogService`

- Adds logging capabilities with various levels.

---

## Backend Integration

The frontend depends on the backend running separately on `http://localhost:7000`.

### Broadcast API

- `GET http://localhost:7000/api/broadcast/state`
- `POST http://localhost:7000/api/broadcast/state`

The `BroadcastApi` service uses `HttpClient` to load and update the broadcast state.

### Socials API

- `GET http://localhost:7000/api/socials/socials`
- `POST http://localhost:7000/api/socials/socials`

The `SocialsApi` service uses `HttpClient` to load and update socials.

### Commentator Box Time Data API

- `GET http://localhost:7000/api/commentator-box-time-data/commentator-box-time-data`
- `POST http://localhost:7000/api/commentator-box-time-data/commentator-box-time-data`

The `CommentatorBoxTimeDataApi` service uses `HttpClient` to load and time data socials.

---

## Overlay Flow

Overlay preview components are rendered using dedicated routes and the same frontend state model.

- `MapScreenDisplay` renders the map screen overlay.
- `ScoreBox` renders the score overlay.
- `CommentatorBox` renders the commentator overlay.
- `InfoboxDisplay` renders the info overlay.
- `StartScreen` and `EndScreen` render the start/end screens.

Overlay components read state from `BroadcastStateService` and update reactively when `Signalr` receives live updates.

---

## Development

### Local development

```bash
cd Frontend/control-panel
npm install
npm start
```

The app runs on `http://localhost:4200` by default.

### Build

```bash
npm run build
```

### Watch

```bash
npm run watch
```

### Unit tests

```bash
npm test
```

### Linting

```bash
npm run code-quality
```

### SSR serve

After build, the SSR server can be started with:

```bash
npm run serve:ssr:control-panel
```

The Express SSR server listens on `PORT` or defaults to `4000`.

---

## Notes

- The frontend is a control panel and overlay preview app, not the backend API implementation.
- SignalR is used for live updates from the backend hub and for syncing both broadcast state and socials.
- The app uses Angular standalone components and the modern `bootstrapApplication` bootstrap flow.
