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

// Copies the license files of the repository into a build output, so that
// they travel with what is distributed.
// Usage: node scripts/copy-legal.mjs <target directory> [--txt]
//   --txt names LICENSE and NOTICE with the extension .txt, for asset
//   repositories that derive the media type from the extension.

import { copyFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const [target, flag] = process.argv.slice(2);
if (!target) {
  console.error('usage: node scripts/copy-legal.mjs <target directory> [--txt]');
  process.exit(2);
}
const ext = flag === '--txt' ? '.txt' : '';
mkdirSync(target, { recursive: true });
copyFileSync(join(root, 'LICENSE'), join(target, `LICENSE${ext}`));
copyFileSync(join(root, 'NOTICE'), join(target, `NOTICE${ext}`));
copyFileSync(join(root, 'THIRD_PARTY_NOTICES.md'), join(target, 'THIRD_PARTY_NOTICES.md'));
