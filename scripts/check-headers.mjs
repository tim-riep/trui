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

// Checks that every source file starts with the license header.
// Usage: node scripts/check-headers.mjs [--fix]

import { readFileSync, writeFileSync } from 'node:fs';
import { extname } from 'node:path';
import { repoFiles } from './files.mjs';
import { headerFor } from './license-header.mjs';

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.css', '.html', '.mdx']);
const fix = process.argv.includes('--fix');
const missing = [];

for (const file of repoFiles()) {
  const ext = extname(file);
  if (!sourceExtensions.has(ext)) continue;
  const header = headerFor(ext);
  const content = readFileSync(file, 'utf8');
  const body = content.startsWith('#!') ? content.slice(content.indexOf('\n') + 1) : content;
  if (body.startsWith(header)) continue;
  if (fix) {
    writeFileSync(file, `${header}\n${content}`);
  } else {
    missing.push(file);
  }
}

if (missing.length > 0) {
  console.error('Files without license header:');
  for (const f of missing) console.error(`  ${f}`);
  console.error('Run node scripts/check-headers.mjs --fix to add it.');
  process.exit(1);
}
