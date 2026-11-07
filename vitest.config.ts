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

import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { sourceAliases } from './aliases.ts';

const browsers = (process.env.TRUI_BROWSERS ?? 'chromium,firefox,webkit').split(',');

export default defineConfig({
  resolve: { alias: sourceAliases },
  test: {
    projects: [
      {
        resolve: { alias: sourceAliases },
        test: {
          name: 'unit',
          environment: 'node',
          include: ['packages/*/src/**/*.unit.test.ts', 'scripts/**/*.test.mjs'],
        },
      },
      {
        plugins: [react()],
        resolve: { alias: sourceAliases },
        test: {
          name: 'browser',
          include: ['packages/*/src/**/*.test.tsx', 'packages/*/src/**/*.browser.test.ts'],
          setupFiles: ['packages/trui/test/setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: browsers.map((browser) => ({ browser: browser as 'chromium' })),
          },
        },
      },
    ],
  },
});
