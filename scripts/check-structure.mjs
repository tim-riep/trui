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

// Checks architecture rules that linters do not cover:
// - React contexts are created only in src/core;
// - code outside src/core imports the core only as '@tim-riep/trui/core';
// - library modules do not import CSS.

import { readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { repoFiles } from './files.mjs';

const root = 'packages/trui/src/';
const core = `${root}core/`;
const problems = [];

for (const file of repoFiles()) {
  if (!file.startsWith(root) || !/\.(ts|tsx)$/.test(file)) continue;
  if (/\.(test|stories)\.tsx?$/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  const inCore = file.startsWith(core);
  if (!inCore && /\bcreateContext\s*\(/.test(text)) {
    problems.push(`${file}: createContext outside src/core`);
  }
  for (const m of text.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
    const spec = m[1];
    if (spec.endsWith('.css')) problems.push(`${file}: imports CSS (${spec})`);
    if (!inCore && spec.startsWith('.')) {
      const target = `${relative('.', join(dirname(file), spec))}/`;
      if (target.startsWith(core)) {
        problems.push(
          `${file}: imports the core by relative path (${spec}); use '@tim-riep/trui/core'`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error('Structure problems:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
