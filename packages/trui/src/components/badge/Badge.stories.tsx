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
import { Badge } from './Badge';

/**
 * A small count. Give it a `label` that says what is counted, so that
 * assistive technology reads "3 unread notifications" instead of "3".
 * Zero hides the badge unless `showZero` is set.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-color-error`, `--trui-radius-round`.
 */
const meta = {
  title: 'Basics/Badge',
  component: Badge,
  args: { count: 3, label: '3 unread notifications' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="catalog-row">
      <Badge count={3} />
      <Badge count={12} tone="error" />
      <Badge count={1500} max={999} />
      <Badge count={0} showZero tone="neutral" />
    </div>
  ),
};
