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

import type { Meta, StoryObj } from '@storybook/react-vite';

/**
 * The semantic color tokens of the current theme. Components use only these
 * tokens; change `--trui-color-accent` to give an application its own accent.
 */
const meta = { title: 'Foundations/Colors' } satisfies Meta;

export default meta;

const tokens = [
  'background',
  'surface',
  'surface-subtle',
  'surface-raised',
  'surface-hover',
  'border',
  'border-strong',
  'text',
  'text-secondary',
  'text-disabled',
  'accent',
  'accent-hover',
  'accent-subtle',
  'on-accent',
  'error',
  'error-subtle',
  'warning',
  'warning-subtle',
  'success',
  'success-subtle',
  'information',
  'information-subtle',
];

export const Colors: StoryObj = {
  render: () => (
    <div className="catalog-swatches">
      {tokens.map((token) => (
        <div key={token} className="catalog-swatch">
          <span
            className="catalog-swatch__color"
            style={{ background: `var(--trui-color-${token})` }}
          />
          --trui-color-{token}
        </div>
      ))}
    </div>
  ),
};
