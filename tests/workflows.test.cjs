const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
const { test } = require("node:test");

const root = resolve(__dirname, "..");
const workflow = (name) =>
  readFileSync(resolve(root, ".github", "workflows", `${name}.yml`), "utf8");

const workflows = {
  "build-dotnet": "Build .NET CI",
  "test-dotnet": "Run .NET Tests CI",
  "build-nodejs": "Build Node.js CI",
  "test-nodejs": "Run Node.js Tests CI",
  "typescript-quality": "TypeScript Code Quality CI",
  e2e: "E2E Tests",
};

for (const [file, name] of Object.entries(workflows)) {
  test(`${name} preserves its name and cancels only superseded PR runs`, () => {
    const source = workflow(file);
    assert.match(
      source,
      new RegExp(`^name: ${name.replaceAll(".", "\\.")}$`, "m"),
    );
    assert.match(
      source,
      /group: \$\{\{ github\.workflow \}\}-\$\{\{ github\.event\.pull_request\.number \|\| github\.run_id \}\}/,
    );
    assert.match(
      source,
      /cancel-in-progress: \$\{\{ github\.event_name == 'pull_request' \}\}/,
    );
    assert.match(source, /contents: read/);
  });
}

for (const file of ["test-dotnet", "test-nodejs"]) {
  test(`${file} tests the triggering revision directly on pushes and PRs`, () => {
    const source = workflow(file);
    assert.match(source, /^\s+push:\s*\r?\n\s+branches:\s*\r?\n\s+- master/m);
    assert.match(
      source,
      /^\s+pull_request:\s*\r?\n\s+branches:\s*\r?\n\s+- master/m,
    );
    assert.doesNotMatch(source, /workflow_run|^\s+if:/m);
  });
}

test("frontend CI uses locked local dependencies and non-watching tests", () => {
  const source = workflow("test-nodejs");
  const installs = source.match(/^\s+run: npm (?:ci|install).*$/gm);
  assert.equal(installs.length, 1);
  assert.match(installs[0], /npm ci$/);
  assert.match(source, /run: npm test -- --watch=false/);
  assert.match(source, /run: npx playwright install --with-deps/);
  assert.match(workflow("build-nodejs"), /run: npm run build\r?$/m);
  const angular = JSON.parse(
    readFileSync(
      resolve(root, "Frontend", "control-panel", "angular.json"),
      "utf8",
    ),
  );
  assert.deepEqual(
    angular.projects["control-panel"].architect.test.options.browsers,
    ["chromium", "webkit", "firefox"],
  );
});

test(".NET workflows cache only packages and invalidate on project changes", () => {
  for (const file of ["build-dotnet", "test-dotnet", "e2e"]) {
    const source = workflow(file);
    assert.match(source, /uses: actions\/cache@v5/);
    assert.match(source, /path: ~\/\.nuget\/packages/);
    assert.match(
      source,
      /key: \$\{\{ runner\.os \}\}-nuget-\$\{\{ github\.workflow \}\}-/,
    );
    assert.match(
      source,
      /hashFiles\('\*\*\/\*\.csproj', '\*\*\/nuget\.config'\)/,
    );
  }
  assert.match(workflow("test-dotnet"), /run: dotnet test --no-restore /);
});

test("E2E keeps every browser and starts the already-built backend", () => {
  const source = workflow("e2e");
  assert.match(source, /browser: \[chromium, firefox, webkit\]/);
  assert.match(source, /fail-fast: false/);
  assert.match(source, /dotnet-version: \|\s+9\.0\.x\s+10\.0\.x/);
  assert.match(source, /run: dotnet run --no-build --project /);
  assert.match(source, /run: dotnet test --no-build /);
  assert.match(source, /if: failure\(\)/);
});
