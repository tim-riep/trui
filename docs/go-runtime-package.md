# The go-runtime package TRUI

`npm run build:package` builds the library for browsers and puts it into the go-runtime
package `TRUI` in `dist/package/TRUI`:

```
TRUI/
  manifest.json                   id TRUI, version of the library, requires TRBASE
  assets/lib/asset.json           every file with media type, labels in English and German
  assets/lib/index.html           demo page
  assets/lib/trui.js              all components and the core
  assets/lib/core.js              the core: providers, hooks, utilities
  assets/lib/icons.js             all icons
  assets/lib/trui.css             tokens, base styles and all components
  assets/lib/vendor/*.js          React as ES modules
  assets/lib/chunks/*-<hash>.js   shared modules
  assets/lib/fonts/*-<hash>.woff2 the Inter typeface
  schema/http-services/lib.json   serves the repository under /trui/lib/
```

`npm run build:package:catalog` adds the built catalog as second asset repository
`assets/catalog` with the node `schema/http-services/catalog.json`, served anonymously under
`/trui/catalog/index.html`; the API reference is at `/trui/catalog/api/index.html`.

Entry points keep fixed names, so that pages can reference them; all other files carry a
content hash. Source maps lie next to the scripts. The script checks the rules of go-runtime
for asset paths and validates the generated files against the JSON Schemas of go-runtime
(from `GO_RUNTIME_DIR`, default `../go-runtime`).

## Installing and serving

```bash
rt init
rt language add de
rt install dist/package/TRUI
rt http activate /trui
rt serve --addr :8080
```

The node `/trui/lib` uses `/TRBASE/ASSET_HANDLER` with the parameters `package=TRUI` and
`repository=lib` and allows anonymous requests without tenant: the files hold no data worth
protecting, and the handler reads no tenant data. A node is reachable only when the package
node `/trui` is active as well. The asset texts are in English and German, so German must be
set up before installing.

## Using the files in a page

```html
<link rel="stylesheet" href="/trui/lib/trui.css" />
<script type="importmap">
  {
    "imports": {
      "react": "/trui/lib/vendor/react.js",
      "react-dom": "/trui/lib/vendor/react-dom.js",
      "react-dom/client": "/trui/lib/vendor/react-dom-client.js",
      "react/jsx-runtime": "/trui/lib/vendor/react-jsx-runtime.js",
      "@tim-riep/trui": "/trui/lib/trui.js",
      "@tim-riep/trui/core": "/trui/lib/core.js",
      "@tim-riep/trui/icons": "/trui/lib/icons.js"
    }
  }
</script>
<script type="module">
  import { createElement as h } from 'react';
  import { createRoot } from 'react-dom/client';
  import { Button, TruiProvider } from '@tim-riep/trui';
  createRoot(document.getElementById('root')).render(h(TruiProvider, null, h(Button, null, 'Save')));
</script>
```

## Test

`npm run test:package` builds the package with the catalog, installs it into a fresh SQLite database with
`rt install`, activates the node, starts `rt serve` and checks entry points, a hashed font and
a hashed chunk for media type, `ETag` and 304 on `If-None-Match`, and loads the demo page in
Chromium. It takes `rt` from `RT_BIN` or builds it from `GO_RUNTIME_DIR`.

## Caching

The asset handler of go-runtime answers with `Cache-Control: no-cache` for every file, so
browsers revalidate each file with its `ETag`. Files with a content hash could be cached for
good (`Cache-Control: public, max-age=31536000, immutable`); go-runtime offers no way to
declare that yet.
