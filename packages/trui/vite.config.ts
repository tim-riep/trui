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

import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const src = fileURLToPath(new URL('./src/', import.meta.url));

// Every folder below components/ is an entry point of its own, so that each
// component can be imported separately.
function entries(): Record<string, string> {
  const result: Record<string, string> = {
    index: `${src}index.ts`,
    'core/index': `${src}core/index.ts`,
  };
  for (const dir of readdirSync(`${src}components`, { withFileTypes: true })) {
    if (dir.isDirectory())
      result[`components/${dir.name}/index`] = `${src}components/${dir.name}/index.ts`;
  }
  // Every icon is an entry point as well, and the index of all icons.
  result['icons/index'] = `${src}icons/index.ts`;
  for (const file of readdirSync(`${src}icons/set`)) {
    result[`icons/set/${file.replace(/\.ts$/, '')}`] = `${src}icons/set/${file}`;
  }
  return result;
}

// The core is external to all other entry points: they reach it through the
// package name, so that it stays one shared module.
const external = (id: string) =>
  id === 'react' ||
  id === 'react-dom' ||
  id.startsWith('react/') ||
  id.startsWith('react-dom/') ||
  id === '@tim-riep/trui/core';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    target: 'es2023',
    lib: { entry: entries(), formats: ['es'] },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
  },
});
