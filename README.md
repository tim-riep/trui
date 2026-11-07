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
```

See [docs/go-runtime-package.md](docs/go-runtime-package.md) and
[docs/federation.md](docs/federation.md).

The public API is recorded in `packages/trui/etc/trui.api.md`. After an intended change of
the API, update it with `npm run api:update`.

The term check reads its list from `~/.config/trui/banned-terms.txt` (or the file in
`TRUI_BANNED_TERMS`); the git hooks in `.githooks/` run it before every commit.

## License

Apache License 2.0, see [LICENSE](LICENSE).
