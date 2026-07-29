# Unit Tests – Technical Documentation

## Stack

| Component         | Technology |
| ----------------- | ---------- |
| Framework         | Vitest     |
| Browser Emulation | Playwright |

---

## Project Structure

Every component and service comes with a matching `[name].spec.ts` file, which contains its unit tests.

---

## Prerequisites

No running backend or frontend is required. Unit tests are fully self-contained:

- **Service tests** Use a mocked call to the backend to send and receive data.
- **Component tests** Check whether the component functions as expected, using a mocked Service.

---

## Running the Tests

### Prerequisites

To be able to run the tests, you need to run the following command from within the Angular project:

```powershell
npx playwright install --with-deps
```

To run all tests:

```powershell
# From the repository root:
cd ./Frontend/control-panel
npm test
```

To run a specific test file:

```powershell
# From the repository root:
cd ./Frontend/control-panel
ng test path-to-test/[name].spec.ts
```

---

## Test Classes

<details>
  <summary>App</summary>
  <h3>src/app/app.spec.ts (3 tests)</h3>

| Test                                                          | What it verifies                                                                                                             |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `should create the app`                                       | Checks whether the `App` component is created successfully.                                                                  |
| `should have signal reachable`                                | Checks whether the component exposes the expected internal signal (title) and returns `"control-panel"`.                     |
| `should set current division color css variable after render` | Checks whether the component sets the `--current-division-color` CSS variable based on the current division after rendering. |

</details>

<details>
  <summary>Dialogs</summary>
  <h3>src/app/dialogs/change-colors-dialog.spec.ts</h3>

| Test                                                    | What it verifies                                                                                                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `should create the dialog`                              | Checks whether the `ChangeColorsDialog` component is created successfully.                                                     |
| `should inject BroadcastStateService`                   | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                               |
| `should expose state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the default broadcast state. |

---

<h3>src/app/dialogs/comm-box-settings-dialog.spec.ts</h3>
  
| Test                                                              | What it verifies                                                                                                                                                  |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `should create the dialog`                                        | Checks whether the `CommBoxSettingsDialog` component is created successfully.                                                                                     |
| `should inject BroadcastStateService`                   | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                               |
| `should reflect state changes from CommentatorBoxTimeDataService` | Checks whether the component exposes the `commentatorBoxTimeData` signal from `CommentatorBoxTimeDataService` and reflects the default commentator box time data. |
| `should reflect commBoxDisplayMode enum property`                 | Checks whether the component correctly exposes the `commBoxDisplayMode` getter with type `CommBoxDisplayMode`                                                     |

---

<h3>src/app/dialogs/socials-dialog.spec.ts</h3>

| Test                                               | What it verifies                                                                                                  |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `should create the dialog`                         | Checks whether the `SocialsDialog` component is created successfully.                                             |
| `should inject SocialsService`                     | Checks whether the component correctly injects and exposes the `SocialsService` instance.                         |
| `should expose socials signal from SocialsService` | Checks whether the component exposes the `socials` signal from `SocialsService` and reflects the default socials. |
| `should reflect state changes from SocialsService` | Checks whether the component correctly reacts to updates in the socials signal.                                   |

---

<h3>src/app/dialogs/streamer-comms-dialog.spec.ts</h3>

| Test                                                      | What it verifies                                                                                                               |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `should create the dialog`                                | Checks whether the `StreamerCommsDialog` component is created successfully.                                                    |
| `should inject BroadcastStateService`                     | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                               |
| `should expose socials signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the default broadcast state. |

---

<h3>src/app/dialogs/tourney-settings-dialog.spec.ts</h3>

| Test                                                           | What it verifies                                                                                                               |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `should create the dialog`                                     | Checks whether the `TourneySettingsDialog` component is created successfully.                                                  |
| `should inject BroadcastStateService`                          | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                               |
| `should expose socials signal from BroadcastStateService`      | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the default broadcast state. |
| `should expose available divisions from BroadcastStateService` | Checks whether the component exposes the list of available divisions from the service.                                         |

</details>

<details>
  <summary>Features</summary>
  <h3>src/app/features/edit-card/edit-card.spec.ts (4 tests)</h3>
  
  | Test | What it verifies |
  |---|---|
  | `should be created` | Checks whether the `EditCard` component is created successfully. |
  | `should emit onCloseClick when closeEditMenu is called` | Checks whether calling `closeEditMenu()` emits the `onCloseClick` event once. |
  | `should emit selected mode when changeMode is called` | Checks whether calling `changeMode()` emits the selected mode (`'tc'`) through `onModeChange`. |
  | `should emit onDeleteMap when deleteMap is called` | Checks whether calling `deleteMap()` emits the `onDeleteMap` event once. |

---

  <h3>src/app/features/map-card/map-card.spec.ts (17 tests)</h3>

| Test                                                       | What it verifies                                                                                                               |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `should be created`                                        | Checks whether the `MapCard` component is created successfully.                                                                |
| `should expose state from BroadcastStateService`           | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the default broadcast state. |
| `should expose available maps from BroadcastStateService`  | Checks whether the component correctly exposes the list of available maps from the service.                                    |
| `should expose available modes from BroadcastStateService` | Checks whether the component correctly exposes the list of available game modes from the service.                              |
| `should initialize edit menu as closed`                    | Checks whether the edit menu is initially closed (`showEditMenu` is `false`).                                                  |
| `should open edit menu`                                    | Checks whether calling `openEditMenu()` sets `showEditMenu` to `true`.                                                         |
| `should close edit menu`                                   | Checks whether calling `closeEditMenu()` sets `showEditMenu` to `false`.                                                       |
| `should remove current map`                                | Checks whether calling `removeMap()` triggers `removeMap()` on the `BroadcastStateService` with the correct map ID.            |
| `should set winner to alpha and recalculate scores`        | Checks whether selecting `alpha` as winner updates the map winner and recalculates both team scores correctly.                 |
| `should set winner to bravo and recalculate scores`        | Checks whether selecting `bravo` as winner updates the map winner and recalculates both team scores correctly.                 |
| `should clear winner when setting winner to null`          | Checks whether setting the winner to `null` removes the winner and recalculates scores accordingly.                            |
| `should select winner if winner is not already selected`   | Checks whether `handleWinnerSelection()` sets a winner when none is currently selected.                                        |
| `should clear winner if same winner is selected again`     | Checks whether selecting the same winner again toggles it off (clears the winner).                                             |
| `should update map information`                            | Checks whether updating a map ID correctly updates map metadata (name and image) in the state.                                 |
| `should not update map when selected map does not exist`   | Checks whether the component prevents updates and logs an error when an unknown map is selected.                               |
| `should update mode information`                           | Checks whether updating a mode ID correctly updates the mode metadata in the state.                                            |
| `should not update mode when selected mode does not exist` | Checks whether the component prevents updates and logs an error when an unknown mode is selected.                              |
| `should set isVisible property and update it`              | Checks whether the `isVisible` property of a map gets updated correctly                                                        |

---

  <h3>src/app/features/resizable-text/resizable-text.spec.ts (4 tests)</h3>

| Test                               | What it verifies                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `should be created`                | Checks whether the `ResizableText` component is created successfully.                                           |
| `should have default aspect ratio` | Checks whether the `aspectRatio` input signal gets initialized to it's default value                            |
| `should set aspect ratio`          | Checks whether the `aspectRatio` input signal gets updated correctly when setting the input externally          |
| `should set text content`          | Checks whether the `resizableTextContent` input signal gets updated correctly when setting the input externally |

</details>

<details>
  <summary>Layouts</summary>
  <h3>src/app/layouts/main-layout/main-layout.spec.ts (3 Tests)</h3>

| Test                                                      | What it verifies                                                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `should be created`                                       | Checks whether the `MainLayout` component is created successfully.                               |
| `should call loadInitialState for BroadcastState on init` | Checks whether `BroadcastStateService.loadInitialState()` is called when the layout initializes. |
| `should call loadInitialState for Socials on init`        | Checks whether `SocialsService.loadInitialState()` is called when the layout initializes.        |

---

  <h3>src/app/layouts/sidebar/sidebar.spec.ts (6 Tests)</h3>

| Test                                                      | What it verifies                                                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                       | Checks whether the `Sidebar` component is created successfully.                                                              |
| `should inject BroadcastStateService`                     | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                             |
| `should expose state signal from BroadcastStateService`   | Checks whether the component exposes the `state` signal from `BroadcastStateService` and returns the expected initial state. |
| `should reflect state changes from BroadcastStateService` | Checks whether the component correctly reacts to updates in the broadcast state signal.                                      |

---

  <h3>src/app/layouts/topbar/topbar.spec.ts (5 Tests)</h3>

| Test                                                      | What it verifies                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                       | Checks whether the `Topbar` component is created successfully.                                                                     |
| `should expose state signal from BroadcastStateService`   | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state.      |
| `should reflect state changes from BroadcastStateService` | Checks whether the component correctly reacts to updates in the broadcast state signal.                                            |
| `should expose isConnected signal from Signalr`           | Checks whether the component exposes the `isConnected` signal from the `Signalr` service and returns the initial connection state. |
| `should reflect SignalR connection changes`               | Checks whether the component correctly updates when the SignalR connection state changes.                                          |

</details>

<details>
  <summary>Overlays</summary>
  <h3>src/app/overlays/commentator-box/commentator-box.spec.ts (5 Tests)</h3>

| Test                                                            | What it verifies                                                                                                              |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                             | Checks whether the `CommentatorBox` component is created successfully.                                                        |
| `should inject BroadcastStateService`                           | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService`     | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should call loadInitialState on init`                          | Checks whether `loadInitialState()` is called during component initialization.                                                |
| `should reflect commentator changes from BroadcastStateService` | Checks whether the component accurately reflects updates to commentator-related fields from the broadcast state.              |

---

  <h3>src/app/overlays/end-screen/end-screen.spec.ts (7 Tests)</h3>

| Test                                                        | What it verifies                                                                                                                |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `EndScreen` component is created successfully.                                                               |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                                |
| `should inject SocialsService`                              | Checks whether the component correctly injects and exposes the `SocialsService` instance.                                       |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected broadcast state. |
| `should expose the socials signal from SocialsService`      | Checks whether the component exposes the `socials` signal from `SocialsService` and reflects the expected socials state.        |
| `should load initial state on init`                         | Checks whether `loadInitialState()` is called on `BroadcastStateService` during component initialization.                       |
| `should load initial socials on init`                       | Checks whether `loadInitialState()` is called on `SocialsService` during component initialization.                              |

---

  <h3>src/app/overlays/infobox-display/infobox-display.spec.ts (5 Tests)</h3>

| Test                                                        | What it verifies                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `InfoboxDisplay` component is created successfully.                                                        |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should call loadInitialState on init`                      | Checks whether `loadInitialState()` is called during `ngOnInit()` of the component.                                           |
| `should reflect state changes from BroadcastStateService`   | Checks whether the component correctly reacts to updates in the broadcast state signal.                                       |

---

  <h3>src/app/overlays/map-screen-display/map-screen-display.spec.ts (4 Tests)</h3>

| Test                                                        | What it verifies                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `MapScreenDisplay` component is created successfully.                                                      |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should load initial state on init`                         | Checks whether `loadInitialState()` is called during component initialization.                                                |

---

  <h3>src/app/overlays/score-box/score-box.spec.ts (4 Tests)</h3>

| Test                                                        | What it verifies                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `ScoreBox` component is created successfully.                                                              |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should load initial state on init`                         | Checks whether `loadInitialState()` is called during component initialization.                                                |

---

  <h3>src/app/overlays/start-screen/start-screen.spec.ts (5 Tests)</h3>

| Test                                                        | What it verifies                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `StartScreen` component is created successfully.                                                           |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should load initial state on init`                         | Checks whether `loadInitialState()` is called during component initialization.                                                |
| `should return match start time correctly`                  | Checks whether the component correctly reflects the match start time from the broadcast state.                                |

</details>

<details>
  <summary>Pages</summary>
  <h3>src/app/pages/dashboard/dashboard.spec.ts (5 Tests)</h3>

| Test                                                        | What it verifies                                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                         | Checks whether the `Dashboard` component is created successfully.                                                             |
| `should inject BroadcastStateService`                       | Checks whether the component correctly injects and exposes the `BroadcastStateService` instance.                              |
| `should expose the state signal from BroadcastStateService` | Checks whether the component exposes the `state` signal from `BroadcastStateService` and reflects the expected initial state. |
| `should reflect state changes from BroadcastStateService`   | Checks whether the component correctly reacts to updates in the broadcast state signal.                                       |
| `should call addMap on BroadcastStateService`               | Checks whether calling `addMap()` on the component correctly delegates to the service.                                        |

</details>

<details>
  <summary>Services</summary>
  <h3>src/app/services/broadcast-api.spec.ts (3 Tests)</h3>

| Test                                     | What it verifies                                                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                      | Checks whether the `BroadcastApi` service is instantiated successfully.                                                    |
| `should get the current broadcast state` | Checks whether `getState()` performs a `GET` request to `/api/broadcast/state` and returns the expected broadcast state.   |
| `should update the broadcast state`      | Checks whether `updateState()` performs a `POST` request with the correct payload and returns the updated broadcast state. |

---

  <h3>src/app/services/broadcast-state.spec.ts (12 Tests)</h3>

| Test                                                 | What it verifies                                                                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                  | Checks whether the `BroadcastStateService` service is instantiated successfully via Angular TestBed.                        |
| `should start SignalR in constructor`                | Checks whether the SignalR connection is started automatically when the service is constructed.                             |
| `should initialize state with default values`        | Checks whether the service initializes its reactive state signal with the expected default broadcast state.                 |
| `should update state when SignalR liveState changes` | Checks whether incoming SignalR live state updates are applied to the service state via reactive signals/effects.           |
| `should load initial state from api`                 | Checks whether `loadInitialState()` fetches the current broadcast state from the API and updates the internal state signal. |
| `should update state and persist it through api`     | Checks whether `update()` merges partial updates into state, updates the signal, and persists the full state via the API.   |
| `should add a map with default map and mode values`  | Checks whether `addMap()` creates a new map entry using default map/mode values and persists the updated state via API.     |
| `should add maps with increasing order numbers`      | Checks whether each new map added receives an incremented `order` value.                                                    |
| `should remove a map and reorder remaining maps`     | Checks whether `removeMap()` removes a map, reorders remaining maps, recalculates scores, and persists the updated state.   |
| `should expose available maps`                       | Checks whether the service exposes the predefined list of available maps.                                                   |
| `should expose match colors`                         | Checks whether the service exposes the predefined list of available match colors                                            |
| `should expose color lock colors`                    | Checks whether the service exposes the predefined list of available color lock colors                                       |
| `should expose available modes`                      | Checks whether the service exposes the predefined list of available game modes.                                             |
| `should expose available divisions`                  | Checks whether the service exposes the predefined list of available divisions.                                              |

---

  <h3>src/app/services/log.spec.ts (8 Tests)</h3>

| Test                                           | What it verifies                                                                   |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `should be created`                            | Checks whether the `Log` service is instantiated successfully via Angular TestBed. |
| `should create a log entry with Info level`    | Checks whether the service creates a simple log message of level `Info`            |
| `should route Warning logs to console.warn`    | Checks whether the service routes warning logs to the `console.warn` method        |
| `should route Error logs to console.error`     | Checks whether the service routes error logs to the `console.error` method         |
| `should attach scope from beginScope`          | Checks whether the service attaches its scope from `beginScope`                    |
| `should support nested scopes (LIFO behavior)` | Checks whether the service supportes nested scopes with Last-In-First-Out-behavior |
| `should include timestamp in ISO format`       | Checks whether the created logs have an ISO formatted timestamp in them            |
| `should pass error correctly in critical logs` | Checks whether thrown errors are correctly passed into critical logs               |

---

  <h3>src/app/services/signalr.spec.ts (7 Tests)</h3>

| Test                                                       | What it verifies                                                                                                                                                       |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                        | Checks whether the `Signalr` service is instantiated successfully via Angular TestBed.                                                                                 |
| `should expose a start method`                             | Checks whether the service exposes a `start()` method for initiating the SignalR connection.                                                                           |
| `should have live state signal initialized to null`        | Checks whether the `liveState` signal is defined and initialized with `null` before any connection is started.                                                         |
| `should have isConnected signal initialized to false`      | Checks whether the `isConnected` signal is defined and initially set to `false`.                                                                                       |
| `should have a tryConnect method`                          | Checks whether the internal `tryConnect()` method exists and is callable within the service.                                                                           |
| `should build a SignalR connection`                        | Checks whether `start()` correctly configures and builds a SignalR connection, registers handlers, starts the connection, and sets `isConnected` to `true` on success. |
| `should retry connection after 5 seconds when start fails` | Checks whether a failed connection attempt triggers a retry after 5 seconds and eventually sets `isConnected` to `true` once reconnection succeeds.                    |

---

  <h3>src/app/services/socials-api.spec.ts (3 Tests)</h3>
  
  | Test | What it verifies |
  |---|---|
  | `should be created` | Checks whether the `SocialsApi` service is instantiated successfully via Angular TestBed. |
  | `should get the current socials` | Checks whether `getSocials()` sends a GET request to the correct API endpoint and returns the expected socials data. |
  | `should update the socials` | Checks whether `updateSocials()` sends a POST request with the updated socials payload and returns the updated response from the API. |

---

  <h3>src/app/services/socials.spec.ts (4 Tests)</h3>

| Test                                               | What it verifies                                                                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `should be created`                                | Checks whether the `SocialsService` is instantiated successfully via Angular TestBed.                                                     |
| `should start signalr when created`                | Checks whether the SignalR connection is started automatically when the service is constructed.                                           |
| `should load initial socials from api`             | Checks whether `loadInitialState()` fetches socials from the API and updates the internal socials signal.                                 |
| `should update socials and persist it through api` | Checks whether `update()` merges partial updates into the current socials state, updates the signal, and persists the result via the API. |

---

  <h3>src/app/services/team-name-switching.spec.ts (9 Tests)</h3>
  
  | Test | What it verifies |
  | --- | --- |
  | `should be created` | Checks whether the `SocialsService` is instantiated successfully via Angular TestBed. |
  | `should return alpha team name as left team name when alpha is left`      | Checks whether the left team name is derived from Team Alpha when `alphaIsLeft` is `true`.                                    |
  | `should return bravo team name as right team name when alpha is left`     | Checks whether the right team name is derived from Team Bravo when `alphaIsLeft` is   `true`.                                   |
  | `should return alpha score as left score when alpha is left`              | Checks whether the left score is derived from Team Alpha when `alphaIsLeft` is  `true`.                                        |
  | `should return bravo score as right score when alpha is left`             | Checks whether the right score is derived from Team Bravo when `alphaIsLeft` is   `true`.                                       |
  | `should return bravo team name as left team name when alpha is not left`  | Checks whether the left team name is derived from Team Bravo when `alphaIsLeft` is  `false`.                                   |
  | `should return alpha team name as right team name when alpha is not left` | Checks whether the right team name is derived from Team Alpha when `alphaIsLeft` is   `false`.                                  |
  | `should return bravo score as left score when alpha is not left`          | Checks whether the left score is derived from Team Bravo when `alphaIsLeft` is  `false`.                                       |
  | `should return alpha score as right score when alpha is not left`         | Checks whether the right score is derived from Team Alpha when `alphaIsLeft` is   `false`.                                      |

</details>

---

## Design Decisions

### Using Vitest with Playwright

Due to Angular's native Vitest support and the known usage of Playwright for testing, Vitest with Playwright's browser emulation were chosen.

### Service Mocking

To avoid sending actual requests or running into connection errors, all services in these unit tests are mocked.

---

## CI / GitHub Actions

Unit tests run automatically on every pull request targeting `master` via the dedicated `.github/workflows/test-nodejs.yml` workflow. The workflow triggers after a successful Build Node.js CI run and executes:

```powershell
npm i @vitest/playwright-browser
npx install playwight --with-deps
npm test
```
