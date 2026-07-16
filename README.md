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

ATTW has no config inheritance. Profile files are consumed as filesystem paths, not JavaScript exports. The root JavaScript API only provides typed profile names, absolute paths, and validated loaders for automation.

ATTW has no official CJS-only profile. Do not simulate one with broad `ignoreRules`; choose `strict` or `node16` according to the actual compatibility promise.

## Scope

These profiles set `pack: true`, which invokes `npm pack`. ATTW documents that pack mode does not support pnpm or Yarn. Private applications and data-only packages without published JavaScript/type entrypoints generally should not run ATTW.

## Validation

```sh
npm run release:verify
```
