# Changelog

All notable changes to the DSB Streaming Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0](1.3.0)

### Changed

- Adjusted logging to be less cluttered and easier to read.

### Dependencies

- Updated the following npm packages:
  - `marked`: `18.1.1` --> `18.1.2`
  - `katex`: `0.19.0` --> `0.19.1`
  - `body-parser`: `2.3.0` --> `2.4.0`
  - `fast-uri`: `3.1.8` --> `3.1.9`
  - `qs`: `6.16.0` --> `6.17.1`
  - `vite`: `8.3.0` --> `8.3.5`

## [1.2.3](1.2.3)

### Dependencies

- Updated Angular packages:
  - `@angular/cdk`: `22.2.2` --> `22.2.4`
  - `@angular/common`: `22.2.2` --> `22.2.3`
  - `@angular/compiler`: `22.2.2` --> `22.2.3`
  - `@angular/core`: `22.2.2` --> `22.2.3`
  - `@angular/forms`: `22.2.2` --> `22.2.3`
  - `@angular/material`: `22.2.2` --> `22.2.4`
  - `@angular/platform-browser`: `22.2.2` --> `22.2.3`
  - `@angular/platform-server`: `22.2.2` --> `22.2.3`
  - `@angular/router`: `22.2.2` --> `22.2.3`
  - `@angular/ssr`: `22.2.2` --> `22.2.4`
  - `@angular/build`: `22.2.2` --> `22.2.4`
  - `@angular/cli`: `22.2.2` --> `22.2.4`
  - `@angular/compiler-cli`: `22.2.2` --> `22.2.3`
- Updated the following npm packages:
  - `@vitest/browser-playwright`: `5.0.3` --> `5.0.5`
  - `express`: `5.2.1` --> `5.3.0`
  - `marked`: `18.1.0` --> `18.1.1`
  - `ngx-markdown`: `22.1.0` --> `22.1.1`
  - `@types/node`: `26.6.4` --> `26.6.5`
  - `eslint`: `10.12.0` --> `10.13.0`
  - `jsdom`: `30.1.2` --> `30.1.3`
  - `playwright`: `1.64.0` --> `1.64.1`
  - `prettier`: `3.9.9` --> `3.9.10`
  - `typescript-eslint`: `8.71.1` --> `8.72.0`
  - `vitest`: `5.0.3` --> `5.0.5`
- Updated the following NuGet packages:
  - `Microsoft.AspNetCore.OpenApi`: `10.0.12` --> `10.0.14`
  - `Microsoft.EntityFrameworkCore.Design`: `10.0.12` --> `10.0.14`
  - `Microsoft.EntityFrameworkCore.Sqlite`: `10.0.12` --> `10.0.14`
  - `Swashbuckle.AspNetCore`: `10.3.0` --> `10.3.1`

## [1.2.2](1.2.2) - 2026-09-28

### Dependencies

- Updated Angular Packages to `22.2.0`:
  - `@angular/cdk`
  - `@angular/common`
  - `@angular/compiler`
  - `@angular/core`
  - `@angular/forms`
  - `@angular/material`
  - `@angular/platform-browser`
  - `@angular/platform-server`
  - `@angular/router`
  - `@angular/ssr`
  - `@angular/build`
  - `@angular/cli`
  - `@angular/compiler-cli`
- Updated the following packages:
  - `marked`: `18.0.13` --> `18.0.14`
  - `katex`: `0.16.47` --> `0.18.9`
  - `eslint`: `10.10.0` --> `10.11.0`
  - `jsdom`: `30.1.0` --> `30.1.1`
  - `prettier`: `3.9.8` --> `3.9.9`
  - `typescript-eslint`: `8.70.0` --> `8.70.1`

## [1.2.1](1.2.1) - 2026-09-26

### Fixed

- Fixed bug where a language stored in the `localStorage` that doesn't have a translation threw console errors and caused the overlay to not render

## [1.2.0](1.2.0) - 2026-09-23

### Added

- Added translation for map names, mode names, and other overlay and dashboard texts
- Added a feature to export set data into a json file, and import it from a json file
- Added REST API to allow interacting with the streaming tool via external programs and/or devices
- Added toast notifications to streaming tool dashboard

### Changed

- Updated Vitest and the Playwright browser adapter to version 5.0.1
- Declared Angular CDK and Playwright explicitly for reliable frontend test dependency resolution

### Fixed

- Fixed npm installation and Angular unit-test setup after the Vitest 5 upgrade

## [1.1.0](1.1.0) - 2026-08-15

### Added

- Added dialog for color settings, as well as the option to set the colors for each team globally from a list of colors
- Added FAQ.md for frequently asked questions
- Added Manual for assistance when getting started with the Streaming Tool

### Changed

- Changed the commentator box design

### Security

- Updated Angular to latest version
- Updated various dependencies to fixed version

## [1.1.0-Beta.1](1.1.0-Beta.1) - 2026-06-26

### Added

- Added CODE_OF_CONDUCT.md for community standards
- Added SECURITY.md for vulnerability reporting guidelines
- Added PR Template Base documentation
- Added CHANGELOG.md for version tracking
- Added dialogs for tournament settings, socials, commentator box time data and streamer and commentator settings to remove clutter from sidebar

## [1.0.0](1.0.0) - 2026-06-03

### Added

- Initial release of the DSB Streaming Tool
- Backend API (ASP.NET Core) with SignalR support
- Frontend Control Panel (Angular)
- Multiple overlay components (Score Box, Map Screen, Commentator Box, Info Box)
- GitHub Actions CI/CD workflows
- Comprehensive PR and issue templates
- Release note generator utility

### Known Issues

- None reported yet

---

## Guidelines for Updating This File

### When to Update

- **For Every Change** — Create a new semantic version section
- **Before Merging** — Ensure the change has an incremented version number

### Version Format

Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** — Breaking changes
- **MINOR** — New features (backward compatible)
- **PATCH** — Bug fixes (backward compatible)

### Categories

- **Added** — New features or functionality
- **Changed** — Changes to existing functionality
- **Deprecated** — Features marked for removal
- **Removed** — Removed features
- **Fixed** — Bug fixes
- **Security** — Security-related fixes or updates

### Example Entry

```markdown
## 2.0.0 - 2026-06-15

### Added

- New overlay component: Custom Timer
- WebSocket optimization for real-time updates

### Changed

- Refactored database schema for better performance
- Updated Angular to version X.X.X

### Fixed

- Fixed crash when handling large data sets
- Fixed SignalR connection drops

### Security

- Updated dependencies to patch security vulnerabilities
```

### Comparison Links

Add links at the bottom for easy version comparison:

```markdown
[1.3.0]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.3.0
[1.2.3]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.2.3
[1.2.2]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.2.2
[1.2.1]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.2.1
[1.2.0]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.2.0
[1.1.0]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.1.0
[1.1.0-beta.1]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases#release-v1.1.0-beta.1
[1.0.0]: https://github.com/Deutsche-Splat-Bundesliga/Streaming-Tool/releases/tag/v1.0.0
```
