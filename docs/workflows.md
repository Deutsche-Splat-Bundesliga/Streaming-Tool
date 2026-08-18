# GitHub Actions - Workflows – Technical Documentation

## Workflows

The workflows defined in `.github/workflows/` automate build, test, quality checks, and release note generation for the Streaming Tool repository.

| Workflow                                  | File                                       | Description                                                                                                             |
| ----------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Build .NET CI                             | `.github/workflows/build-dotnet.yml`       | Checks whether the Backend .NET code can be built using `dotnet build`. Also checks the .NET code quality during build. |
| Run .NET Tests CI                         | `.github/workflows/test-dotnet.yml`        | Runs the Backend unit tests after a successful Build .NET CI run.                                                       |
| Build Node.js CI                          | `.github/workflows/build-nodejs.yml`       | Checks whether the Frontend code can be built using `ng s`.                                                             |
| TypeScript Code Quality CI                | `.github/workflows/typescript-quality.yml` | Checks the code quality of the Frontend TypeScript code using ESLint.                                                   |
| E2E Tests                                 | `.github/workflows/e2e.yml`                | Builds and runs all End-to-End Tests.                                                                                   |
| Run Node.js Tests CI                      | `.github/workflows/test-nodejs.yml`        | Builds and runs all Frontend unit tests.                                                                                |
| Generate Release Notes                    | `.github/workflows/release-notes.yml`      | Generates release notes when a new release with a milestone is created.                                                 |
| Check Pull Request labels for merge block | `.github/workflows/fail-by-label.yml`       | Let workflows fail whenever a pull request has the label `NoMerge`                                                      |
| Dependabot Issues | `.github/workflows/dependabot-issues.yml` | Periodically manages Dependabot Alert issues |

## Workflow details

### Build .NET CI

File: `.github/workflows/build-dotnet.yml`
Description: Builds the Backend .NET project and validates code quality during the build stage.

### Run .NET Tests CI

File: `.github/workflows/test-dotnet.yml`
Description: Runs the Backend unit tests (`DSB.StreamBackend.Tests`) after a successful Build .NET CI run. Triggers automatically on every pull request targeting `master` and on every push to `master`.

### Build Node.js CI

File: `.github/workflows/build-nodejs.yml`
Description: Builds the Frontend project and verifies it can start successfully.

### TypeScript Code Quality CI

File: `.github/workflows/typescript-quality.yml`
Description: Runs ESLint rules on Frontend TypeScript sources to ensure consistent code quality.

### E2E Tests

File: `.github/workflows/e2e.yml`
Description: Executes the end-to-end test suite against the application.

### Run Node.js Tests CI

File: `.github/workflows/test-nodejs.yml`
Description: Runs the Frontend unit tests and reports results in CI.

### Generate Release Notes

File: `.github/workflows/release-notes.yml`
Description: Generates release notes automatically for tagged release events with milestone information.

### Check Pull Request labels for merge block

File: `.github/workflows/fail-by-label.yml`
Description: Let workflows fail whenever a pull request has the label

### Dependabot Issues

File: `.github/workflows/dependabot-issues.yml`
Description: Periodically manages all Issues based on Dependabot Alerts
