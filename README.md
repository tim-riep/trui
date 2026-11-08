# TRUI

React components for business applications: inputs, forms, tables, dialogs, page layouts
and the building blocks of a home page with tiles, with one calm and dense appearance.

The library has no runtime dependencies besides `react` and `react-dom` (peer
dependencies, version 19). It is published as ES modules with type definitions; every
component can be imported on its own.

## Development

```bash
npm install
npx playwright install chromium firefox webkit
npm test            # unit tests in Node, component tests in Chromium, Firefox and WebKit
npm run check       # types, lint, license headers, banned terms, structure, API report
npm run catalog     # the component catalog on http://localhost:6006
```

`TRUI_BROWSERS=chromium npm test` limits component tests to one browser.

```bash
npm run build:package    # the go-runtime package TRUI in dist/package/TRUI
npm run test:package     # installs it with rt into a fresh database and serves it
npm run test:federation  # host and remote of the module federation example
npm run test:visual      # screenshots of the catalog in the Playwright container (needs Docker)
```

`npm run test:visual:update` renews the screenshots in `tests/visual/baselines` after an
intended change of the look. `npm run build:package:catalog` adds the built catalog to the
package as second asset repository, served under `/trui/catalog/index.html`.

The catalog (`npm run catalog`) has a page for every component and two examples: a business
page with a list, filter bar and detail form, and a home page in the shell that opens it.

See [docs/go-runtime-package.md](docs/go-runtime-package.md) and
[docs/federation.md](docs/federation.md).

The public API is recorded in `packages/trui/etc/trui.api.md`. After an intended change of
the API, update it with `npm run api:update`.

The term check reads its list from `~/.config/trui/banned-terms.txt` (or the file in
`TRUI_BANNED_TERMS`); the git hooks in `.githooks/` run it before every commit.

## License

TRUI is licensed under the Apache License 2.0, see [LICENSE](LICENSE) and [NOTICE](NOTICE).

It distributes the Inter typeface under the SIL Open Font License 1.1, and the browser build
and the go-runtime package also contain React, React DOM and Scheduler under the MIT
License. [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) lists them with their full license
texts; `npm run check:licenses` checks the licenses of all dependencies. The npm package and
the package TRUI include these files.

## Continuous integration

GitHub Actions run on every push and pull request (`.github/workflows/ci.yml`): checks and
license check, unit tests and story tests with axe, component tests in Chromium, Firefox and
WebKit, the module federation test, the package test against go-runtime and the visual
regression tests in the Playwright container. A tag `v<version>` builds the npm package and
the go-runtime package TRUI and attaches them to a GitHub release
(`.github/workflows/release.yml`).

Secrets: `BANNED_TERMS` holds the list of banned terms (one per line) for the term check;
without it the check is skipped with a warning. `GO_RUNTIME_TOKEN` gives read access to the
go-runtime repository if it is private.
