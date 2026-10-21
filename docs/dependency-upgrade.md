# Dependency upgrade verification

Verified on 2026-10-21 with Bun 1.4.3 and Node 26.7.0. Implements the canvas
batch from the droplet dependency upgrade plan. The working tree was clean
before this update.

## Scope and versions

| Dependency path (development only) | Before | After |
| --- | --- | --- |
| `vite` | 6.3.5 | 6.4.5 |
| `vite > postcss` | 8.5.8 | 8.5.23 |
| `vite > postcss > nanoid` | 3.3.11 | 3.3.18 |
| `vite > picomatch` (also through `tinyglobby`/`fdir`) | 4.0.3 | 4.0.4 |
| `vite > postcss > source-map-js` | 1.2.1 | 1.2.2 |

The npm registry and lockfile integrity hashes were checked for all five
selected versions. Vite 6.4 remains a
[supported security-fix branch](https://vite.dev/releases).
The plan proposed 6.4.4; the current 6.4.5 release adds a `server.fs` check
after stripping queries, per the
[maintainer changelog](https://github.com/vitejs/vite/blob/v6.4.5/packages/vite/CHANGELOG.md).

After pinning Vite, `bun audit fix --dry-run` proposed only the four transitive
updates above. These minimum advisory-free versions were applied with
`bun audit fix` and the resulting diff reviewed. They satisfy the existing
parent ranges; no overrides, major upgrades, new direct dependencies, or
downgrades were needed. Rollup and esbuild retain their existing resolutions.
Application JavaScript, HTML, and Vite configuration are unchanged.

## Validation

- Baseline production build passed on Vite 6.3.5.
- `bun install --frozen-lockfile` and `bun run build` passed both in the
  checkout and in a clean temporary source copy with no existing
  `node_modules`. The frozen install did not change the lockfile.
- Both builds emitted `assets/index-DR8n5u7g.js` (23.97 kB) and a 7.63 kB
  `index.html`, matching the baseline filenames and sizes.
- `node --check` passed for every `js/*.js` file and `vite.config.js`.
- `bun test` found no tests (exit 1). There are no test files, test script,
  lint script, or type-check script in this repository.
- `git diff --check` passed.
- Browser smoke checks used the Vite development server and production
  preview, both bound to loopback. Verified particle/connection rendering,
  layout selection, particle count and size controls, debug and placing
  toggles, left/right placement, clear gravity, reset, panel hiding, keyboard
  shortcuts, and production-page reload. The Vite client connected without
  console warnings or errors.
- Save was attempted, but the in-app browser reports `prompt() is not
  supported`. Save/rename prompt flows could not be verified in this browser.
  That was the only observed production console error. Import/export and
  responsive resizing were not verified in this smoke pass.

## Remaining advisories

None reported by the final `bun audit --json` or
`bun audit --production --json`: both returned `{}` with exit 0.
The baseline full audit reported 20 advisory entries across five packages;
the baseline production-only audit was also clean. Canvas has no declared
production dependencies and ships static assets; these findings concerned
development/build tooling. No advisory exceptions or deferred dependency
fixes remain in this batch.

Audit results reflect the registry database at verification time. No merge,
deployment, or production-site change was performed.
