# Module federation

Applications can load parts of their user interface at runtime with module federation:
a host loads pages that remotes expose. TRUI works across hosts and remotes as long as they
share the library, so that there is one React and one set of TRUI contexts.

## Rules

- Share `react`, `react-dom`, `react/jsx-runtime`, `react-dom/client`, `@tim-riep/trui`,
  `@tim-riep/trui/core` and `@tim-riep/trui/icons` as singletons. `@tim-riep/trui/core`
  holds all contexts; it must be shared even if an application imports only single
  components (`@tim-riep/trui/button`), because those import the core by its package name.
- The host renders `TruiProvider` and loads `@tim-riep/trui/styles.css` once. Remotes bring
  neither: their components take theme, density, language, texts and icons from the host.
  A remote may render a nested `TruiProvider` to change single settings for its part.
- Require compatible versions with `requiredVersion: '^<major>.0.0'` (for 0.x versions
  `^0.<minor>.0`). TRUI changes its public API incompatibly only in major versions.
- Shared modules are loaded as a whole and cannot be tree-shaken. This is the price of one
  instance for all applications.
- Load the code of the host behind an asynchronous boundary (`import('./bootstrap')`), so that
  the shared modules are negotiated before any of them runs.

## Configuration

With Rsbuild and `@module-federation/rsbuild-plugin`:

```ts
const shared = {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react/jsx-runtime': { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom/client': { singleton: true, requiredVersion: '^19.0.0' },
  '@tim-riep/trui': { singleton: true, requiredVersion: '^0.2.0' },
  '@tim-riep/trui/core': { singleton: true, requiredVersion: '^0.2.0' },
  '@tim-riep/trui/icons': { singleton: true, requiredVersion: '^0.2.0' },
};

// Host
pluginModuleFederation({
  name: 'host',
  remotes: { orders: 'orders@https://example.com/orders/mf-manifest.json' },
  shared,
});

// Remote
pluginModuleFederation({
  name: 'orders',
  exposes: { './OrdersPage': './src/OrdersPage.tsx' },
  shared,
});
```

## Example

[examples/federation](../examples/federation) contains a host and a remote. The host renders
the provider with switches for theme and language and loads the page `orders/OrdersPage`
from the remote. `npm run test:federation` builds both, serves them on two origins and
checks in a browser that React and the library are loaded once and that the remote follows
theme and language of the host.

```bash
npm run build
cd examples/federation/remote && npx rsbuild dev   # http://localhost:3002
cd examples/federation/host && npx rsbuild dev     # http://localhost:3001
```
