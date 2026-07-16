# attw-config-nick2bad4u

[![Continuous Integration](https://github.com/Nick2bad4u/attw-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/attw-config-nick2bad4u/actions/workflows/ci.yml)

Shared [Are the Types Wrong?](https://arethetypeswrong.github.io/) profiles for published npm packages.

## Install

```sh
npm install --save-dev @arethetypeswrong/cli attw-config-nick2bad4u
```

## Choose a profile

| Project contract                                             | Profile    | Consumer script                                                                 |
| ------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------- |
| Dual ESM/CJS or legacy-compatible CJS                        | `strict`   | `attw --config-path node_modules/attw-config-nick2bad4u/profiles/strict.json`   |
| Modern Node package that does not promise Node 10 resolution | `node16`   | `attw --config-path node_modules/attw-config-nick2bad4u/profiles/node16.json`   |
| Intentionally ESM-only package                               | `esm-only` | `attw --config-path node_modules/attw-config-nick2bad4u/profiles/esm-only.json` |

The root `.attw.json` remains an ESM-only compatibility default matching the source configuration.

Choose the narrowest profile that matches the package's published contract:

- Use `strict` when every Node 10, Node 16 ESM/CJS, and bundler resolution path is part of the contract.
- Use `node16` when legacy Node 10 resolution is not supported, but both modern Node import and require consumers are.
- Use `esm-only` only when CommonJS consumers are intentionally unsupported.

ATTW has no config inheritance. Profile files are consumed as filesystem paths, not JavaScript exports. The root JavaScript API only provides typed profile names, absolute paths, and validated loaders for automation.

ATTW has no official CJS-only profile. Do not simulate one with broad `ignoreRules`; choose `strict` or `node16` according to the actual compatibility promise.

## Package scripts

Add exactly one contract-appropriate profile to the consuming package:

```json
{
 "scripts": {
  "check:types": "attw --config-path node_modules/attw-config-nick2bad4u/profiles/esm-only.json"
 }
}
```

Then run it after the package has been built:

```sh
npm run build
npm run check:types
```

The profile's `pack: true` setting makes ATTW run `npm pack` in the consumer's current directory. The config package must therefore be a direct development dependency so its stable `node_modules/attw-config-nick2bad4u/profiles/...` path exists.

## CI

The same package script is sufficient in CI:

```yaml
- name: Install dependencies
  run: npm ci
- name: Build package
  run: npm run build
- name: Validate published types
  run: npm run check:types
```

For automation that needs an absolute path instead of a package script:

```js
import { getAttwConfigPath, loadAttwConfig } from "attw-config-nick2bad4u";

const configPath = getAttwConfigPath("esm-only");
const config = await loadAttwConfig("esm-only");
```

## Scope

These profiles set `pack: true`, which invokes `npm pack`. ATTW documents that pack mode does not support pnpm or Yarn. Private applications and data-only packages without published JavaScript/type entrypoints generally should not run ATTW.

For a pnpm or Yarn project, generate the tarball with that package manager and invoke ATTW on the tarball with the matching `--profile` directly; these npm-pack profile files are not the portable transport for that workflow.

## Validation

```sh
npm run release:verify
```
