// Copyright 2026 The TRUI Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Builds the go-runtime package TRUI from the browser build of the library:
//
//   dist/package/TRUI/
//     manifest.json                    id TRUI, version of the library, requires TRBASE
//     assets/lib/asset.json            every file with its media type
//     assets/lib/...                   packages/trui/dist-browser and package/index.html
//     schema/http-services/lib.json    serves the repository anonymously under /trui/lib/
//
// With --with-catalog, the built catalog (dist/catalog, `npm run catalog:build`)
// becomes the second asset repository `catalog`, served under /trui/catalog/.
//
// Checks the rules of go-runtime for asset paths and, if the schemas of
// go-runtime are found (GO_RUNTIME_DIR or ../go-runtime), validates the
// generated files against them. Run `npm run build:browser` first.

import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const root = resolve(import.meta.dirname, '..');
const browserBuild = join(root, 'packages/trui/dist-browser');
const out = join(root, 'dist/package/TRUI');
const repository = join(out, 'assets/lib');
const version = JSON.parse(readFileSync(join(root, 'packages/trui/package.json'), 'utf8')).version;
const withCatalog = process.argv.includes('--with-catalog');
const catalogBuild = join(root, 'dist/catalog');
const catalogRepository = join(out, 'assets/catalog');

if (withCatalog && !existsSync(join(catalogBuild, 'index.html'))) {
  console.error('The catalog build is missing; run npm run catalog:build first.');
  process.exit(1);
}

if (!existsSync(join(browserBuild, 'trui.js'))) {
  console.error('The browser build is missing; run npm run build:browser first.');
  process.exit(1);
}

// Media types are set for every file, also where go-runtime would derive the same.
const mediaTypes = {
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.map': 'application/json',
  '.json': 'application/json',
  '.html': 'text/html',
  '.txt': 'text/plain',
  '.png': 'image/png',
  '.ico': 'image/vnd.microsoft.icon',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

// Files with a fixed name that applications reference; all others carry a hash.
const entryPoints = {
  'index.html': { en: 'Demo page of the components', de: 'Demoseite der Komponenten' },
  'trui.js': { en: 'All components and the core', de: 'Alle Komponenten und der Kern' },
  'core.js': {
    en: 'Core: providers, hooks and utilities',
    de: 'Kern: Provider, Hooks und Hilfsfunktionen',
  },
  'icons.js': { en: 'All icons', de: 'Alle Icons' },
  'trui.css': {
    en: 'Stylesheet with tokens and all components',
    de: 'Stylesheet mit Tokens und allen Komponenten',
  },
  'vendor/react.js': { en: 'React as ES module', de: 'React als ES-Modul' },
  'vendor/react-dom.js': { en: 'React DOM as ES module', de: 'React DOM als ES-Modul' },
  'vendor/react-dom-client.js': {
    en: 'React DOM client as ES module',
    de: 'React-DOM-Client als ES-Modul',
  },
  'vendor/react-jsx-runtime.js': {
    en: 'React JSX runtime as ES module',
    de: 'React-JSX-Laufzeit als ES-Modul',
  },
  'fonts/OFL.txt': { en: 'License of the Inter typeface', de: 'Lizenz der Schrift Inter' },
};

const folders = {
  chunks: { en: 'Shared modules with content hash', de: 'Gemeinsame Module mit Inhalts-Hash' },
  fonts: { en: 'Fonts with content hash', de: 'Schriften mit Inhalts-Hash' },
  vendor: { en: 'React for pages without bundler', de: 'React für Seiten ohne Bundler' },
};

function listFiles(dir, base = dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    // Hidden files such as .nojekyll are not assets.
    if (e.name.startsWith('.')) return [];
    const full = join(dir, e.name);
    if (lstatSync(full).isSymbolicLink()) throw new Error(`symbolic link not allowed: ${full}`);
    return e.isDirectory() ? listFiles(full, base) : [relative(base, full).split('\\').join('/')];
  });
}

// The rules of go-runtime for asset paths.
function checkPaths(paths) {
  const problems = [];
  const lower = new Map();
  for (const p of paths) {
    if (Buffer.byteLength(p) > 255) problems.push(`${p}: longer than 255 bytes`);
    for (const segment of p.split('/')) {
      if (!/^[A-Za-z0-9_-][A-Za-z0-9._-]*$/.test(segment))
        problems.push(`${p}: invalid segment ${segment}`);
      if (Buffer.byteLength(segment) > 100) problems.push(`${p}: segment longer than 100 bytes`);
    }
    const key = p.toLowerCase();
    if (lower.has(key)) problems.push(`${p}: differs only in case from ${lower.get(key)}`);
    lower.set(key, p);
    if (!(extname(p) in mediaTypes)) problems.push(`${p}: no media type for ${extname(p)}`);
  }
  if (problems.length > 0) throw new Error(`invalid asset paths:\n  ${problems.join('\n  ')}`);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(repository, { recursive: true });
cpSync(browserBuild, repository, { recursive: true });
cpSync(join(root, 'package/index.html'), join(repository, 'index.html'));

const paths = listFiles(repository).sort();
checkPaths(paths);
for (const name of Object.keys(entryPoints)) {
  if (!paths.includes(name)) throw new Error(`entry point ${name} is missing`);
}

const assetJson = {
  description: { en: 'TRUI components for browsers', de: 'TRUI-Komponenten für Browser' },
  folders: Object.fromEntries(Object.entries(folders).map(([f, d]) => [f, { description: d }])),
  files: Object.fromEntries(
    paths.map((p) => [
      p,
      entryPoints[p]
        ? { mimeType: mediaTypes[extname(p)], description: entryPoints[p] }
        : { mimeType: mediaTypes[extname(p)] },
    ]),
  ),
};

const manifest = {
  id: 'TRUI',
  version,
  description: 'TRUI: React components for business applications, served as files',
  requires: [{ id: 'TRBASE', version: '>=1.0.0' }],
};

const service = (path, texts) => ({
  path,
  texts,
  handlers: [
    {
      class: '/TRBASE/ASSET_HANDLER',
      parameters: [
        { name: 'package', value: 'TRUI' },
        { name: 'repository', value: path },
      ],
    },
  ],
  // The files hold no data worth protecting and the handler reads no tenant data.
  settings: { anonymous: true, anonymousTenant: null },
});

const libService = service('lib', {
  en: {
    label: 'TRUI library files',
    description: 'JavaScript, CSS and fonts of the TRUI components',
  },
  de: {
    label: 'TRUI-Bibliotheksdateien',
    description: 'JavaScript, CSS und Schriften der TRUI-Komponenten',
  },
});

let catalogAssets = null;
let catalogService = null;
let catalogCount = 0;
if (withCatalog) {
  mkdirSync(catalogRepository, { recursive: true });
  cpSync(catalogBuild, catalogRepository, {
    recursive: true,
    filter: (src) => !src.split('/').pop().startsWith('.'),
  });
  const catalogPaths = listFiles(catalogRepository).sort();
  checkPaths(catalogPaths);
  catalogCount = catalogPaths.length;
  catalogAssets = {
    description: { en: 'Catalog of the TRUI components', de: 'Katalog der TRUI-Komponenten' },
    files: Object.fromEntries(
      catalogPaths.map((p) => [
        p,
        p === 'index.html'
          ? {
              mimeType: mediaTypes['.html'],
              description: { en: 'Start page of the catalog', de: 'Startseite des Katalogs' },
            }
          : { mimeType: mediaTypes[extname(p)] },
      ]),
    ),
  };
  catalogService = service('catalog', {
    en: { label: 'TRUI catalog', description: 'Catalog of the TRUI components with examples' },
    de: { label: 'TRUI-Katalog', description: 'Katalog der TRUI-Komponenten mit Beispielen' },
  });
}

const write = (file, data) => {
  mkdirSync(resolve(file, '..'), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};
write(join(out, 'manifest.json'), manifest);
write(join(repository, 'asset.json'), assetJson);
write(join(out, 'schema/http-services/lib.json'), libService);
if (catalogAssets && catalogService) {
  write(join(catalogRepository, 'asset.json'), catalogAssets);
  write(join(out, 'schema/http-services/catalog.json'), catalogService);
}

// Validation against the schemas of go-runtime, where available.
const runtimeDir = resolve(process.env.GO_RUNTIME_DIR ?? join(root, '../go-runtime'));
const schemaDir = join(runtimeDir, 'schemas');
if (existsSync(schemaDir)) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  for (const f of readdirSync(schemaDir).filter((f) => f.endsWith('.json'))) {
    ajv.addSchema(JSON.parse(readFileSync(join(schemaDir, f), 'utf8')));
  }
  const base = 'https://github.com/tim-riep/go-runtime/schemas/';
  const checks = [
    ['manifest.schema.json', manifest, 'manifest.json'],
    ['asset.schema.json', assetJson, 'assets/lib/asset.json'],
    ['http-service.schema.json', libService, 'schema/http-services/lib.json'],
    ...(catalogAssets && catalogService
      ? [
          ['asset.schema.json', catalogAssets, 'assets/catalog/asset.json'],
          ['http-service.schema.json', catalogService, 'schema/http-services/catalog.json'],
        ]
      : []),
  ];
  for (const [schema, data, file] of checks) {
    const validate = ajv.getSchema(base + schema);
    if (!validate) throw new Error(`schema ${schema} not found in ${schemaDir}`);
    if (!validate(data)) {
      throw new Error(
        `${file} does not match ${schema}:\n${JSON.stringify(validate.errors, null, 2)}`,
      );
    }
  }
  console.log(`validated against the schemas in ${relative(root, schemaDir)}`);
} else {
  console.log('go-runtime schemas not found; skipped schema validation');
}

console.log(
  `${relative(root, out)}: version ${version}, ${paths.length} files in assets/lib` +
    (withCatalog ? `, ${catalogCount} files in assets/catalog` : ''),
);
