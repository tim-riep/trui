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
import { Title } from './Title';

/**
 * A heading. `level` sets the element (`h1` … `h6`) and with it the outline of
 * the page; `size` sets the look independently.
 *
 * **Tokens:** `--trui-font-size-m` … `--trui-font-size-xxxl`, `--trui-font-weight-semibold`.
 */
const meta = {
  title: 'Basics/Title',
  component: Title,
  args: { children: 'Purchase orders', level: 2 },
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Levels: Story = {
  render: () => (
    <div className="catalog-stack">
      <Title level={1}>Level 1</Title>
      <Title level={2}>Level 2</Title>
      <Title level={3}>Level 3</Title>
      <Title level={4}>Level 4</Title>
      <Title level={5}>Level 5</Title>
      <Title level={2} size="s">
        Level 2 in size s
      </Title>
    </div>
  ),
};
