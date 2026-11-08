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

// Searches files and commit messages for banned terms, ignoring case. The
// list is kept outside the repository: TRUI_BANNED_TERMS or
// ~/.config/trui/banned-terms.txt, one term per line, '#' starts a comment.
//
// Usage:
//   node scripts/check-terms.mjs --all            all files of the repository
//   node scripts/check-terms.mjs --staged         files staged for commit
//   node scripts/check-terms.mjs --message <file> a commit message
//   node scripts/check-terms.mjs --commits <range> the messages of a range of commits
//   node scripts/check-terms.mjs <file>...        the given files

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { repoFiles, stagedFiles } from './files.mjs';

const listPath =
  process.env.TRUI_BANNED_TERMS ?? join(homedir(), '.config', 'trui', 'banned-terms.txt');
if (!existsSync(listPath)) {
  console.error(`List of banned terms not found: ${listPath}`);
  process.exit(2);
}
const terms = readFileSync(listPath, 'utf8')
  .split('\n')
  .map((l) => l.replace(/#.*/, '').trim().toLowerCase())
  .filter(Boolean);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// A term matches as a whole word: not directly between two letters. Identifiers
// are split at camel-case boundaries first, so "fooBar" is checked as "foo Bar".
const pattern = new RegExp(`(?<![a-z])(?:${terms.map(escapeRegExp).join('|')})(?![a-z])`, 'gi');

function splitWords(text) {
  return text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
}

function check(name, text) {
  const hits = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const m of splitWords(line).matchAll(pattern)) hits.push(`${name}:${i + 1}: ${m[0]}`);
  });
  if (/[a-z]/i.test(name)) {
    for (const m of splitWords(name).matchAll(pattern))
      hits.push(`${name}: file name contains ${m[0]}`);
  }
  return hits;
}

const args = process.argv.slice(2);
let targets = [];
let message = null;
let commits = null;
if (args[0] === '--all') targets = repoFiles();
else if (args[0] === '--staged') targets = stagedFiles();
else if (args[0] === '--message') message = args[1];
else if (args[0] === '--commits') commits = args[1];
else targets = args;

const hits = [];
for (const file of targets) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  if (text.includes('\0')) {
    hits.push(...check(file, ''));
    continue;
  }
  hits.push(...check(file, text));
}
if (message) {
  const text = readFileSync(message, 'utf8')
    .split('\n')
    .filter((l) => !l.startsWith('#'))
    .join('\n');
  hits.push(...check('commit message', text));
}

if (commits) {
  const log = execFileSync('git', ['log', '--format=%H%n%B%x00', commits], { encoding: 'utf8' });
  for (const entry of log.split('\0')) {
    const [hash, ...body] = entry.trim().split('\n');
    if (hash) hits.push(...check(`commit ${hash.slice(0, 7)}`, body.join('\n')));
  }
}

if (hits.length > 0) {
  console.error('Banned terms found:');
  for (const h of hits) console.error(`  ${h}`);
  process.exit(1);
}
