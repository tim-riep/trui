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
 * Sizes of type, spacing, shapes and controls. Components use only these
 * tokens; the densities change spacing and heights of controls and rows.
 */
const meta = { title: 'Foundations/Typography and spacing' } satisfies Meta;
export default meta;

const fontSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
const spaces = ['xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
const radii = ['s', 'm', 'l', 'xl', 'round'];
const density = ['control-height', 'control-height-s', 'row-height', 'target-size', 'tile-size'];

export const Typography: StoryObj = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      {fontSizes.map((size) => (
        <div key={size} className="catalog-row">
          <code style={{ width: 200 }}>--trui-font-size-{size}</code>
          <span style={{ fontSize: `var(--trui-font-size-${size})` }}>
            Purchase order 4500012345
          </span>
        </div>
      ))}
    </div>
  ),
};

export const Spacing: StoryObj = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      {spaces.map((space) => (
        <div key={space} className="catalog-row">
          <code style={{ width: 200 }}>--trui-space-{space}</code>
          <span
            style={{
              width: `var(--trui-space-${space})`,
              height: 12,
              background: 'var(--trui-color-accent)',
            }}
          />
        </div>
      ))}
      {radii.map((radius) => (
        <div key={radius} className="catalog-row">
          <code style={{ width: 200 }}>--trui-radius-{radius}</code>
          <span
            style={{
              width: 48,
              height: 32,
              border: '1px solid var(--trui-color-border-strong)',
              borderRadius: `var(--trui-radius-${radius})`,
            }}
          />
        </div>
      ))}
    </div>
  ),
};

/** Switch the density in the toolbar to see these change. */
export const Density: StoryObj = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      {density.map((token) => (
        <div key={token} className="catalog-row">
          <code style={{ width: 200 }}>--trui-{token}</code>
          <span
            style={{
              width: `var(--trui-${token})`,
              height: 12,
              background: 'var(--trui-color-accent)',
            }}
          />
        </div>
      ))}
    </div>
  ),
};
