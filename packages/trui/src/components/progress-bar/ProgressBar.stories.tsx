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
import { ProgressBar } from './ProgressBar';

/**
 * Progress of an operation. With `value` it shows how much is done; without
 * it, that something runs. The label names the bar for assistive technology.
 *
 * **Tokens:** `--trui-color-accent` and the status colors, `--trui-color-surface-subtle`.
 */
const meta = {
  title: 'Basics/ProgressBar',
  component: ProgressBar,
  args: { label: 'Importing orders', value: 40, showValue: true },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="catalog-stack">
      <ProgressBar label="Budget used" value={92} showValue tone="warning" />
      <ProgressBar label="Delivered" value={100} showValue tone="success" />
      <ProgressBar label="Failed items" value={12} showValue tone="error" />
      <ProgressBar label="Preparing export" />
    </div>
  ),
};
