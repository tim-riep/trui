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

// Checks the licenses of third-party code:
// - every installed package has a license from the accepted list, and the
//   packages of this repository are under Apache-2.0;
// - every package bundled into the browser build (found in its source maps)
//   is listed in THIRD_PARTY_NOTICES.md. This part runs when the browser
//   build exists (npm run build:browser).

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Permissive licenses, and weak copyleft licenses that are accepted for
// development tools, which are not distributed.
const accepted = new Set([
  'MIT',
  'MIT-0',
  'ISC',
  '0BSD',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'Apache-2.0',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'CC-BY-4.0',
  'Python-2.0',
  'PSF-2.0',
  'MPL-2.0',
  'OFL-1.1',
  'Unlicense',
]);
// Bundled packages that THIRD_PARTY_NOTICES.md names, by package name.
const noticeNames = { react: 'React', 'react-dom': 'React DOM', scheduler: 'Scheduler' };

const problems = [];

function licenseOf(pkg) {
  const l = pkg.license ?? pkg.licenses;
  if (typeof l === 'string') return l;
  if (Array.isArray(l)) return l.map((x) => x.type ?? x).join(' OR ');
  return l?.type ?? 'UNKNOWN';
}

function acceptedExpression(expression) {
  // "A OR B" is fine if any alternative is accepted; "A AND B" needs all.
  const clean = expression.replace(/[()]/g, '');
  if (clean.includes(' OR ')) return clean.split(' OR ').some((x) => accepted.has(x.trim()));
  return clean.split(' AND ').every((x) => accepted.has(x.trim()));
}

const installed = JSON.parse(
  execFileSync('npm', ['query', '*'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }),
);
for (const pkg of installed) {
  const license = licenseOf(pkg);
  const own = pkg.location && !pkg.location.includes('node_modules');
  if (own) {
    if (license !== 'Apache-2.0')
      problems.push(`${pkg.name}: own package must be Apache-2.0, is ${license}`);
  } else if (!acceptedExpression(license)) {
    problems.push(`${pkg.name}@${pkg.version}: license ${license} is not accepted`);
  }
}

const browserBuild = 'packages/trui/dist-browser';
let bundled = [];
if (existsSync(browserBuild)) {
  const maps = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name.endsWith('.map')) maps.push(full);
    }
  };
  walk(browserBuild);
  const names = new Set();
  for (const map of maps) {
    for (const source of JSON.parse(readFileSync(map, 'utf8')).sources ?? []) {
      const m = /node_modules\/((?:@[^/]+\/)?[^/]+)/.exec(source);
      if (m) names.add(m[1]);
    }
  }
  bundled = [...names].sort();
  const notices = readFileSync('THIRD_PARTY_NOTICES.md', 'utf8');
  for (const name of bundled) {
    const title = noticeNames[name] ?? name;
    if (!notices.includes(`| ${title} `))
      problems.push(`${name} is bundled but not listed in THIRD_PARTY_NOTICES.md`);
  }
}

if (problems.length > 0) {
  console.error('License problems:');
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(
  `${installed.length} packages with accepted licenses` +
    (bundled.length
      ? `; bundled in the browser build: ${bundled.join(', ')}`
      : '; browser build not present, bundle not checked'),
);
