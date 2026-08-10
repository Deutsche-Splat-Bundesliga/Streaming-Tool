# Changelog

All notable changes to the DSB Streaming Tool will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](Unreleased)

### Added

- Added dialog for color settings, as well as the option to set the colors for each team globally from a list of colors
- Added FAQ.md for frequently asked questions
- Added Manual for assistance when getting started with the Streaming Tool

### Changed

### Deprecated

### Removed

### Fixed

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

- **For Every Release** — Create a new version section
- **During Development** — Add entries to `[Unreleased]` section
- **Before Merging** — Move unreleased changes to appropriate version

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
[Unreleased]: https://github.com/Hazeolation/Streaming-Tool/compare/v1.0.0...master
[1.1.0-beta.1]: https://github.com/Hazeolation-Productions/Streaming-Tool/releases#release-v1.1.0-beta.1
[1.0.0]: https://github.com/Hazeolation/Streaming-Tool/releases/tag/v1.0.0
```
