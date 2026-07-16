# Repository Instructions

This repository publishes `attw-config-nick2bad4u`.
Treat `.attw.json`, every file under `profiles/`, and the typed path/loader API as public package surfaces.

## Priorities

- Support only ATTW's official `strict`, `node16`, and `esm-only` profiles.
- Never add broad `ignoreRules` to a shared profile.
- Keep profile assets consumable by direct `node_modules` filesystem paths.
- Keep `.attw.json` aligned with the ESM-only compatibility default.
- Validate package contents and real ATTW behavior before release.

## Commands

```sh
npm run build:runtime
npm run typecheck
npm test
npm run release:verify
```
