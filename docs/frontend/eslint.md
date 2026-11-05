# ESLint - Rules Documentation
This document serves to document which rules we're using in our Code Quality tests with [ESLint](https://eslint.org) and [typescript-eslint](https://typescript-eslint.io)

The check is scoped to TypeScript files under `src/`. Run it locally with `npm run code-quality` from `Frontend/control-panel`; CI runs the same script and adds its GitHub Actions formatter.

# Used Rulesets
## Predefined Rulesets

| Library | Rulesets |
|---|---|
| ESLint | [recommended](https://eslint.org/docs/latest/rules/) |
| typescript-eslint | [recommended](https://typescript-eslint.io/rules/?=recommended) |

## Additional ESLint Rules

Additional rules from ESLint that aren't enabled by default with recommended rulesets, but are worth using
| Rule | Severity |
|---|---|
| [eqeqeq](https://eslint.org/docs/latest/rules/eqeqeq) | ❌ Error |