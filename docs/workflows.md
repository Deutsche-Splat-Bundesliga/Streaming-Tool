# GitHub Actions - Workflows – Technical Documentation

## Workflows

The workflows defined in `.github/workflows/` automate build, test, quality checks, and release note generation for the Streaming Tool repository.

| Workflow                                  | File                                       | Description                                                                                                             |
| ----------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Build .NET CI                             | `.github/workflows/build-dotnet.yml`       | Checks backend formatting with CSharpier and builds the Backend .NET project. |
| Run .NET Tests CI                         | `.github/workflows/test-dotnet.yml`        | Runs Backend unit tests on pull requests and pushes to `master`. |
| Build Node.js CI                          | `.github/workflows/build-nodejs.yml`       | Checks workflow contracts and builds the Frontend production bundle. |
| TypeScript Code Quality CI                | `.github/workflows/typescript-quality.yml` | Checks the code quality of the Frontend TypeScript code using ESLint.                                                   |
| E2E Tests                                 | `.github/workflows/e2e.yml`                | Builds and runs all End-to-End Tests.                                                                                   |
| Run Node.js Tests CI                      | `.github/workflows/test-nodejs.yml`        | Builds and runs all Frontend unit tests.                                                                                |
| Generate Release Notes                    | `.github/workflows/release-notes.yml`      | Generates release notes when a new release with a milestone is created.                                                 |
| Check Pull Request labels for merge block | `.github/workflows/fail-by-label.yml`       | Let workflows fail whenever a pull request has the label `NoMerge`                                                      |
| Dependabot Issues | `.github/workflows/dependabot-issues.yml` | Periodically manages Dependabot Alert issues |

## Workflow details

### Scheduling and dependency caches

Build, unit-test and TypeScript quality workflows run independently on pull requests targeting `master` and pushes to `master`. Tests check out the triggering revision directly rather than waiting for another workflow to finish. E2E tests run on pull requests.

Each of these workflows cancels older runs for the same pull request when a new revision arrives. Push runs use unique concurrency groups and are not cancelled by later pushes. Workflow names and job identifiers remain stable for branch protection.

Frontend jobs cache npm downloads and use `npm ci`; they do not cache `node_modules` or install extra packages after restoring the lockfile. .NET build, unit-test and E2E jobs cache NuGet packages with keys based on the operating system, workflow name, project files and NuGet configuration. Each workflow saves its own dependency set; restore prefixes allow reuse across project changes and workflows. A cache miss still runs the normal dependency restore.

### Build .NET CI

File: `.github/workflows/build-dotnet.yml`
Description: Checks backend formatting with the repository-pinned CSharpier tool, then builds the Backend .NET project.

### Run .NET Tests CI

File: `.github/workflows/test-dotnet.yml`
Description: Restores dependencies once, then runs the Backend unit tests (`DSB.StreamBackend.Tests`) with `--no-restore`. Triggers directly on every pull request targeting `master` and every push to `master`, independently of Build .NET CI.

### Build Node.js CI

File: `.github/workflows/build-nodejs.yml`
Description: Runs workflow contract checks, then builds the Frontend production bundle with the repository-local Angular CLI.

### TypeScript Code Quality CI

File: `.github/workflows/typescript-quality.yml`
Description: Runs ESLint rules on Frontend TypeScript sources to ensure consistent code quality.

### E2E Tests

File: `.github/workflows/e2e.yml`
Description: Executes the end-to-end test suite in separate Chromium, Firefox and WebKit jobs. Installs the .NET 9 SDK/runtime for the test project and the .NET 10 SDK/runtime for the backend. Starts the previously built backend with `--no-build`. See [E2E tests](e2e-tests.md) for service readiness checks and failure logs.

### Run Node.js Tests CI

File: `.github/workflows/test-nodejs.yml`
Description: Runs the Frontend unit tests in Chromium, WebKit and Firefox with `npm test -- --watch=false`. Angular CLI and the Vitest browser provider come from `npm ci`; Playwright installs all required browsers.

### Verifying workflow changes

Run the dependency-free contract checks from the repository root:

```powershell
node --test tests\workflows.test.cjs
```

These static checks cover workflow names, PR-only cancellation, direct test triggers, deterministic frontend installs, NuGet cache configuration and E2E SDK/browser coverage. Build Node.js CI runs the same checks. They do not execute GitHub Actions or validate action inputs.

After changing a workflow, use a pull request and a subsequent push to verify runner behavior:

1. Confirm build, quality and unit-test workflows run for the triggering revision without chained `workflow_run` executions.
2. Push another revision while PR checks are running; confirm older runs are cancelled and replacement checks start.
3. Confirm push runs on `master` are not cancelled by later pushes.
4. Compare a cold run with a warm run for NuGet cache hits and job duration. Dependency restoration must succeed in both cases.
5. Confirm all three frontend unit-test browsers and all three E2E jobs complete. On E2E failure, check the service-log artifacts.

### Generate Release Notes

File: `.github/workflows/release-notes.yml`
Description: Generates release notes automatically for tagged release events with milestone information.

### Check Pull Request labels for merge block

File: `.github/workflows/fail-by-label.yml`
Description: Let workflows fail whenever a pull request has the label

### Dependabot Issues

File: `.github/workflows/dependabot-issues.yml`
Description: Periodically manages all Issues based on Dependabot Alerts
