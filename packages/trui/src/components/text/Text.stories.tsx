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
import { Text } from './Text';

/**
 * Text with a size, a tone and a weight from the tokens. `maxLines` cuts long
 * texts with an ellipsis; `numeric` aligns digits in columns.
 *
 * **Tokens:** `--trui-font-size-xs` … `--trui-font-size-l`, `--trui-color-text`,
 * `--trui-color-text-secondary`, the status colors.
 */
const meta = {
  title: 'Basics/Text',
  component: Text,
  args: { children: 'Purchase order 4500012345 was released.' },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="catalog-stack">
      <Text>Default text</Text>
      <Text tone="secondary">Secondary text</Text>
      <Text tone="accent">Accent text</Text>
      <Text tone="error">Error text</Text>
      <Text tone="warning">Warning text</Text>
      <Text tone="success">Success text</Text>
      <Text tone="information">Information text</Text>
    </div>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div className="catalog-stack" style={{ width: 240 }}>
      <Text maxLines={1}>
        A long description of an item that does not fit into one line of the column.
      </Text>
      <Text as="p" maxLines={2}>
        A long description of an item that does not fit into two lines of the column and is
        therefore cut with an ellipsis at the end.
      </Text>
    </div>
  ),
};
