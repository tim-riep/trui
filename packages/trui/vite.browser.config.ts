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

// The build for browsers without a bundler, delivered as asset repository of
// the go-runtime package TRUI. Entry points keep fixed names so that their
// paths stay stable; everything else carries a content hash and can be
// cached for good. React comes along as ES modules under vendor/; pages map
// the bare specifiers with an import map:
//
//   "react" -> vendor/react.js, "react-dom" -> vendor/react-dom.js,
//   "react-dom/client" -> vendor/react-dom-client.js,
//   "react/jsx-runtime" -> vendor/react-jsx-runtime.js,
//   "@tim-riep/trui" -> trui.js, "@tim-riep/trui/core" -> core.js,
//   "@tim-riep/trui/icons" -> icons.js
//
// All entry points come from one build, so they share one instance of React
// and of the core.

import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const require = createRequire(import.meta.url);
const src = fileURLToPath(new URL('./src/', import.meta.url));

// React is published as CommonJS; these wrappers give it named ES exports.
const vendor: Record<string, string> = {
  'vendor/react': 'react',
  'vendor/react-dom': 'react-dom',
  'vendor/react-dom-client': 'react-dom/client',
  'vendor/react-jsx-runtime': 'react/jsx-runtime',
};

function vendorWrappers(): Plugin {
  const prefix = '\0trui-vendor:';
  return {
    name: 'trui-vendor-wrappers',
    resolveId(id) {
      return id.startsWith('trui-vendor:') ? `\0${id}` : null;
    },
    load(id) {
      if (!id.startsWith(prefix)) return null;
      const specifier = id.slice(prefix.length);
      const names = Object.keys(require(specifier)).filter(
        (n) => n !== 'default' && /^[A-Za-z_$][\w$]*$/.test(n),
      );
      return [
        `import * as m from ${JSON.stringify(specifier)};`,
        'const mod = m.default ?? m;',
        ...names.map((n) => `export const ${n} = mod[${JSON.stringify(n)}];`),
        'export default mod;',
      ].join('\n');
    },
  };
}

export default defineConfig({
  plugins: [react(), vendorWrappers()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: {
    alias: [
      { find: /^@tim-riep\/trui\/core$/, replacement: `${src}core/index.ts` },
      { find: /^@tim-riep\/trui$/, replacement: `${src}index.ts` },
    ],
  },
  build: {
    outDir: 'dist-browser',
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2023',
    minify: true,
    copyPublicDir: false,
    rollupOptions: {
      input: {
        trui: `${src}index.ts`,
        core: `${src}core/index.ts`,
        icons: `${src}icons/index.ts`,
        ...Object.fromEntries(
          Object.entries(vendor).map(([name, spec]) => [name, `trui-vendor:${spec}`]),
        ),
      },
      preserveEntrySignatures: 'strict',
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
        hashCharacters: 'hex',
      },
    },
  },
});
