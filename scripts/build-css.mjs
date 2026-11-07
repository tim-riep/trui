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

// Builds the stylesheet of the library: inlines the imports of
// packages/trui/src/styles.css in order, rewrites relative URLs and copies
// the files they reference. Run from packages/trui; writes dist/trui.css.
//
// Options: --out <dir> writes to another directory; --hash names the
// referenced files after their content (fonts/<name>-<hash>.woff2), so that
// they can be cached for good while trui.css keeps its name.

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { headerFor } from './license-header.mjs';

const src = resolve('src');
const args = process.argv.slice(2);
const outIndex = args.indexOf('--out');
const out = resolve(outIndex >= 0 ? args[outIndex + 1] : 'dist');
const hash = args.includes('--hash');
const header = headerFor('.css');
const assets = new Map();

function strip(css) {
  return css.startsWith(header) ? css.slice(header.length).replace(/^\n/, '') : css;
}

function inline(file) {
  const css = strip(readFileSync(file, 'utf8'));
  const dir = dirname(file);
  // URLs first, relative to this file; imported files rewrite their own.
  return css
    .replace(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g, (match, url) => {
      if (/^(data:|https?:|#|\/)/.test(url)) return match;
      const source = resolve(dir, url);
      const name = basename(source);
      const target = hash
        ? `fonts/${name.replace(/(\.[^.]+)$/, `-${createHash('sha256').update(readFileSync(source)).digest('hex').slice(0, 10)}$1`)}`
        : `fonts/${name}`;
      assets.set(source, target);
      return `url('./${target}')`;
    })
    .replace(/^@import\s+['"]([^'"]+)['"];\s*$/gm, (_, spec) =>
      inline(resolve(dir, spec)).trimEnd(),
    );
}

const css = `${header}\n${inline(join(src, 'styles.css'))}`;
mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'trui.css'), css);
for (const [source, target] of assets) {
  mkdirSync(dirname(join(out, target)), { recursive: true });
  copyFileSync(source, join(out, target));
}
// The license of the font travels with it.
copyFileSync(join(src, 'tokens/fonts/OFL.txt'), join(out, 'fonts/OFL.txt'));
console.log(
  `dist/trui.css (${(css.length / 1024).toFixed(1)} kB), ${assets.size} files: ${[...assets.values()].map((t) => relative('.', t)).join(', ')}`,
);
