# Contributing

Thank you for your interest in contributing to the DSB Streaming Tool. This guide
outlines the development workflow and explains how to report issues and submit
changes.

## 1. Getting Started

1. Fork the repository on GitHub.
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/Streaming-Tool.git
   ```
3. Add the main repository as the `upstream` remote:
   ```bash
   git remote add upstream https://github.com/Hazeolation/Streaming-Tool.git
   ```
4. Update your local `master` branch before starting work:
   ```bash
   git fetch upstream
   git switch master
   git merge upstream/master
   ```

## 2. Development Setup

### Backend

- Project: `Backend/DSB.StreamBackend/DSB.StreamBackend.csproj`
- Stack: ASP.NET Core 9, SignalR, and SQLite
- Run the backend in Visual Studio or run `dotnet run` from `Backend/DSB.StreamBackend`.
- Configuration files:
  - `appsettings.json`
  - `appsettings.Development.json`

### Frontend

- Project: `Frontend/control-panel`
- Stack: Angular
- Install dependencies:
  ```bash
  cd Frontend/control-panel
  npm install
  ```
- Start the frontend:
  ```bash
  npm start
  ```
- The control panel is usually available at `http://localhost:4200`.

> [!IMPORTANT]
> Run the backend and frontend together during local development to verify that
> overlays receive live updates through SignalR.

## 3. What You Can Contribute

- Bug reports with reproducible steps
- Bug fixes and improvements to existing features
- Overlay components and control panel improvements
- Documentation and screenshots
- Tests and build workflow improvements

## 4. Style and Quality

- Use clear, concise commit messages.
- Choose short, descriptive branch names, such as `fix/123-scorebox-update` or
  `feature/123-map-screen`.
- Follow the existing Angular and C# conventions.
- Keep changes focused; avoid unrelated formatting or refactoring.

## 5. Pull Request Process

1. Create a branch from the latest `master`.
2. In your pull request, explain:
   - What changed and why
   - How it was tested
3. Link any related issues.
4. Confirm your branch is up to date with `master` before submitting.

## 6. Bug Reports and Feature Requests

- Search existing issues before opening a new one.
- For bugs, include the observed and expected behavior, steps to reproduce, and
  relevant environment details. Add screenshots or logs when they help explain
  the issue.
- For feature requests, describe the use case and proposed improvement.

## 7. Testing and Verification

- Run relevant existing tests and verify your changes locally.
- For frontend changes, check the control panel and affected overlay pages in a
  browser.
- For changes affecting live updates, verify the relevant SignalR behavior.

## 8. License and Legal

Contributions are subject to the license and terms that apply to this repository.

## 9. Questions?

For questions, open an issue or contact the maintainers through GitHub
Discussions or Issues.
