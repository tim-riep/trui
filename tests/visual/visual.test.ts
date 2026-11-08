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

// Screenshots of representative stories in both themes and both densities.

import { expect, test } from '@playwright/test';

const stories = [
  'basics-button--variants',
  'basics-tag--tones',
  'basics-avatar--variants',
  'inputs-textfield--value-states',
  'inputs-select--default',
  'inputs-checkbox--states',
  'forms-form--purchase-order',
  'feedback-banner--tones',
  'layout-tabs--default',
  'layout-page--object-page',
  'data-table--ten-thousand-rows',
  'home-tile--kinds',
  'examples-pages--business-page',
  'examples-pages--home-page',
];

const combinations = [
  { theme: 'light', density: 'compact' },
  { theme: 'dark', density: 'compact' },
  { theme: 'light', density: 'comfortable' },
  { theme: 'dark', density: 'comfortable' },
];

for (const story of stories) {
  for (const { theme, density } of combinations) {
    test(`${story} ${theme} ${density}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${story}&viewMode=story&globals=theme:${theme};density:${density};locale:en`,
      );
      await page.locator('#storybook-root .trui-root').first().waitFor();
      await page.evaluate(() => document.fonts.ready);
      // Lets layouts that measure themselves (toolbars, tables) settle.
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot(`${story}--${theme}-${density}.png`, { fullPage: true });
    });
  }
}
