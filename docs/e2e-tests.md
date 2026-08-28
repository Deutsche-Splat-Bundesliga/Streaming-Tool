# E2E Tests – Technical Documentation

## Stack

| Component          | Technology                            |
| ------------------ | ------------------------------------- |
| Framework          | .NET 9.0 / NUnit                      |
| Browser Automation | Microsoft.Playwright 1.60             |
| Browsers           | Chromium, Firefox, WebKit (Safari)    |
| Test Base Class    | `Microsoft.Playwright.NUnit.PageTest` |

---

## Project Structure

```
tests/
└── DSB.StreamTool.E2E/
    ├── DSB.StreamTool.E2E.csproj
    └── Tests/
        ├── DashboardTests.cs    # Control panel page tests
        ├── DialogTests.cs       # Control panel dialog popup tests
        ├── SidebarTests.cs      # Sidebar input and toggle tests
        └── OverlayTests.cs      # All four overlay route tests
```

The test project is part of the solution file at the repository root (`DSB.StreamTool.sln`), which also includes the backend project.

---

## Prerequisites

Both the frontend and the backend must be running before executing the tests.

| Service  | Start Command                                | Default URL             |
| -------- | -------------------------------------------- | ----------------------- |
| Backend  | `dotnet run` in `Backend/DSB.StreamBackend/` | `http://localhost:7000` |
| Frontend | `npm start` in `Frontend/control-panel/`     | `http://localhost:4200` |

The tests hard-code `http://localhost:4200` as the base URL. The backend is accessed indirectly via the frontend's API calls.

---

## One-Time Setup: Install Playwright Browsers

After the first build, the Chromium browser binaries must be downloaded once:

```powershell
dotnet build tests/DSB.StreamTool.E2E
powershell.exe -File tests/DSB.StreamTool.E2E/bin/Debug/net9.0/playwright.ps1 install chromium
```

> [!NOTE]
> This machine does not have PowerShell 7 (`pwsh`) installed. Use `powershell.exe -File` instead of `pwsh` for all Playwright CLI operations.

The binaries are stored in `%LOCALAPPDATA%\ms-playwright\` and are reused across runs.

---

## Running the Tests

```powershell
# From the repository root — runs all 46 E2E tests
dotnet test tests/DSB.StreamTool.E2E/DSB.StreamTool.E2E.csproj

# Or via the solution (runs E2E tests only, since the backend has no test project)
dotnet test DSB.StreamTool.sln
```

---

## Test Classes

### `DashboardTests` (10 tests)

Covers the main control panel page at `/`.

| Test                                         | What it verifies                                                      |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `Dashboard_Loads_ShowsTopbar`                | Topbar is visible and contains "Deutsche Splatoon Bundesliga"         |
| `Dashboard_Loads_TopbarLeagueFormat`         | Click league format button and verify if correct inputs are visible   |
| `Dashboard_Loads_TopbarStandardFormat`       | Click standard format button and verify if correct inputs are visible |
| `Dashboard_Loads_ShowsSidebar`               | Sidebar is visible                                                    |
| `Dashboard_Loads_ShowsDashboardContainer`    | Dashboard container is rendered                                       |
| `Dashboard_Loads_ShowsAddMapButton`          | "Add Map" button is present and labelled correctly                    |
| `Dashboard_AddMap_IncreasesMapCardCount`     | Clicking "Add Map" adds exactly one new map card                      |
| `Dashboard_MapCard_ShowsTeamButtons`         | Each map card shows the alpha/bravo team buttons                      |
| `Dashboard_MapCard_ShowsEditButton`          | Each map card shows the "Bearbeiten" button                           |
| `Dashboard_MapCard_EditButton_OpensEditMenu` | Clicking "Bearbeiten" renders the edit menu                           |
| `Dashboard_MapCard_EditMenu_CanBeClosed`     | Clicking ✖ removes the edit menu from the DOM                         |
| `Dashboard_MapCard_MapSelect_IsVisible`      | The map dropdown inside each card is visible                          |
| `Dashboard_Topbar_ShowsScoreDisplay`         | Score display area in the topbar is rendered                          |
| `Dashboard_MapCard_ShowsCounterpickButton`   | Counterpick button in map card is rendered                            |

> [!NOTE]
> **Edit menu selector:** The `app-edit-card` Angular host element uses `display: inline` with no layout size. The inner `<div class="edit-menu">` (which has `position: absolute; width: 350px; height: 190px`) is used for the visibility assertion instead. For the "closed" assertion, `app-edit-card` itself is checked since Angular's `@if` removes the host element from the DOM entirely when the menu is closed.

---

### `DialogTests` (12 tests)

| Test                                                               | What it verifies                                                                |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `Dialog_OpenButtons_IsVisible`                                     | Verifies that all buttons to open dialogs are visible                           |
| `Dialog_TourneySettings_TourneyFormatButtons_Visible`              | Verifies that buttons to switch between league and standard format are visible  |
| `Dialog_TourneySettings_StartTime_IsVisible`                       | Match start time input is visible                                               |
| `Dialog_StreamerCommsSettings_Streamer_InputAcceptsText`           | Streamer input accepts and retains text                                         |
| `Dialog_StreamerCommsSettings_Commentator1_InputAcceptsText`       | First commentator input accepts and retains text                                |
| `Dialog_StreamerCommsSettings_Commentator2_InputAcceptsText`       | Second commentator input accepts and retains text                               |
| `Dialog_CommBoxDisplaySettings_ModeButtons_AreVisible`             | Manual and automatic mode buttons for commentator box display modes are visible |
| `Dialog_CommBoxDisplaySettings_ShowCommBoxIntervalInput_IsVisible` | Input to set interval for showing comm box is visible                           |
| `Dialog_ColorSettings_ColorLockToggleSlider_IsVisible`             | Slider to toggle color lock is visible                                          |
| `Dialog_ColorSettings_Colors_HasOptions`                           | At least 2 options to select colors are visible                                 |

---

### `SidebarTests` (9 tests)

Covers all sidebar controls. Each test navigates to the dashboard in `[SetUp]`.

| Test                                                      | What it verifies                                             |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `Sidebar_Teams_BothInputsAreVisible`                      | Both team name inputs are rendered                           |
| `Sidebar_TeamAlphaName_UpdatesTopbar`                     | Filling the alpha input reflects in the topbar score display |
| `Sidebar_TeamBravoName_UpdatesTopbar`                     | Filling the bravo input reflects in the topbar score display |
| `Sidebar_TeamAlphaName_RespectsMaxLength`                 | Team name is capped at 13 characters (HTML `maxlength`)      |
| `Sidebar_AlphaIsLeft_ToggleSliderIsVisible`               | "Alpha links" toggle slider is rendered                      |
| `Sidebar_Visibility_AllThreeButtonsPresent`               | All three visibility toggle buttons are shown                |
| `Sidebar_Visibility_MapScreenButton_TogglesActiveClass`   | Clicking "Kartenanzeige" toggles the `active` CSS class      |
| `Sidebar_Visibility_ScoreBoxButton_TogglesActiveClass`    | Clicking "Spielstand" toggles the `active` CSS class         |
| `Sidebar_Visibility_CommentatorButton_TogglesActiveClass` | Clicking "Kommentatoren" toggles the `active` CSS class      |

> [!NOTE]
> **Visibility toggle assertions:** The state update calls the backend API asynchronously before Angular updates the DOM. Playwright's `Expect(...).ToHaveClassAsync(new Regex(@"\bactive\b"))` is used (not `EvaluateAsync`) so the assertion auto-retries until the DOM reflects the change.

---

### `OverlayTests` (23 tests)

Covers all four overlay routes used as OBS Browser Sources.

| Route                      | Tests                                                                                        |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `/overlay/score-box`       | Page loads; `.team.left`, `.team.right`, `.score`, separator are attached                    |
| `/overlay/commentator-box` | Page loads; `.streamer-text` contains "Streamer:", `.casters-text` contains "Kommentatoren:" |
| `/overlay/info-box`        | Page loads; `.league` contains "Deutsche Splatoon Bundesliga"; `.versus` contains "VS"       |
| `/overlay/map-screen`      | Page loads; header, team names, match score, season/division text, and map grid are attached |

Additionally:

| Test                                       | What it verifies                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `ScoreBox_VisibilityToggle_TogglesOpacity` | Clicking "Spielstand" on the dashboard toggles the `active` class; state is restored after the test |

> [!NOTE]
> **Overlay visibility:** Overlays use `opacity: 0` (not `display: none`) for the hidden state via the `.overlay-hidden` class. Playwright's `ToBeVisibleAsync` considers `opacity: 0` elements visible (they have a non-zero bounding box), so all overlay element assertions use `ToBeAttachedAsync` to check DOM presence regardless of visibility state.

---

## Shared State Consideration

All tests run against the same backend database. Tests that mutate state (adding maps, changing team names, toggling overlays) do not restore the original values, with the exception of `ScoreBox_VisibilityToggle_TogglesOpacity`.

This means:

- The map count in the database grows each time `Dashboard_AddMap_IncreasesMapCardCount` runs.
- Team name inputs may contain values left by `Sidebar_TeamAlphaName_UpdatesTopbar` / `Sidebar_TeamBravoName_UpdatesTopbar`.

For a fully clean test run, reset the database by deleting `dsb-stream-tool.db` and restarting the backend (EF migrations re-create it automatically).

---

## CI / GitHub Actions

The workflow at `.github/workflows/e2e.yml` runs automatically on every pull request targeting `master`.

### Browser Matrix

Tests run in parallel across three browsers:

| Browser    | Engine                     |
| ---------- | -------------------------- |
| `chromium` | Blink                      |
| `firefox`  | Gecko                      |
| `webkit`   | WebKit (Safari equivalent) |

Each browser runs as a separate CI job (`E2E – chromium`, `E2E – firefox`, `E2E – webkit`). `fail-fast: false` ensures all three jobs always complete even if one fails, providing a full picture of cross-browser compatibility.

### How the Workflow Operates

1. Installs .NET 9 and Node 20
2. Installs frontend npm dependencies
3. Builds backend and E2E test project
4. Installs the Playwright browser binary for that matrix entry (`pwsh playwright.ps1 install --with-deps <browser>`)
5. Starts the backend in the background using the `http` launch profile (`http://localhost:7000`)
6. Starts the Angular dev server in the background (`http://localhost:4200`)
7. Polls both endpoints with `curl` until they respond (timeout: 60s backend, 120s frontend)
8. Runs `dotnet test` with `BROWSER=<browser>` set — `PageTest` picks this up automatically
9. On failure: uploads `backend.log` and `frontend.log` as artifacts (retained 7 days) for debugging

### Selecting the Browser in Tests

No code changes are needed to support multiple browsers. `Microsoft.Playwright.NUnit.PageTest` reads the `BROWSER` environment variable at runtime. The workflow sets this via:

```yaml
env:
  BROWSER: ${{ matrix.browser }}
```

### Local Multi-Browser Run

To reproduce the CI matrix locally, run `dotnet test` once per browser:

```powershell
$env:BROWSER = "firefox";  dotnet test tests/DSB.StreamTool.E2E/DSB.StreamTool.E2E.csproj
$env:BROWSER = "webkit";   dotnet test tests/DSB.StreamTool.E2E/DSB.StreamTool.E2E.csproj
$env:BROWSER = "chromium"; dotnet test tests/DSB.StreamTool.E2E/DSB.StreamTool.E2E.csproj
```

Browsers must be installed first:

```powershell
powershell.exe -File tests/DSB.StreamTool.E2E/bin/Debug/net9.0/playwright.ps1 install firefox
powershell.exe -File tests/DSB.StreamTool.E2E/bin/Debug/net9.0/playwright.ps1 install webkit
```
