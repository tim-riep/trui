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

import { fileURLToPath } from 'node:url';

// Resolves the self-references of the library to its sources, for tests, the
// catalog and examples that run without a build.
export const sourceAliases = [
  {
    find: /^@tim-riep\/trui\/core$/,
    replacement: fileURLToPath(new URL('./packages/trui/src/core/index.ts', import.meta.url)),
  },
  {
    find: /^@tim-riep\/trui$/,
    replacement: fileURLToPath(new URL('./packages/trui/src/index.ts', import.meta.url)),
  },
];
