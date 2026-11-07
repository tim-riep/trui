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
import { Text } from '../text/Text';
import { Tabs } from './Tabs';

/**
 * Sections of which one is shown at a time. Counts show how many entries a
 * tab has; tabs that do not fit scroll.
 *
 * **Keyboard:** Tab reaches the selected tab, arrows move between tabs (and
 * select them unless `activation` is `manual`), Tab again moves into the content.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-color-text-secondary`, `--trui-row-height`.
 */
const meta = {
  title: 'Layout/Tabs',
  component: Tabs,
  args: {
    'aria-label': 'Order sections',
    items: [
      { key: 'items', label: 'Items', count: 12, content: <Text>12 items</Text> },
      { key: 'delivery', label: 'Delivery', content: <Text>Partly delivered</Text> },
      { key: 'invoices', label: 'Invoices', count: 2, content: <Text>2 invoices</Text> },
      { key: 'history', label: 'History', disabled: true },
    ],
  },
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Narrow: Story = {
  render: (args) => (
    <div style={{ width: 260 }}>
      <Tabs {...args} />
    </div>
  ),
};
