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
import { Avatar } from './Avatar';

/**
 * Stands for a person or an organization: a picture, the initials of the name
 * or an icon. The color follows from the name, so the same name always gets
 * the same color. Set `decorative` when the name is shown next to it anyway.
 *
 * **Tokens:** `--trui-color-decorative-1-subtle` … `--trui-color-decorative-6-subtle`.
 */
const meta = {
  title: 'Basics/Avatar',
  component: Avatar,
  args: { name: 'Anna Schmidt', size: 'l' },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="catalog-row">
      <Avatar name="Anna Schmidt" size="s" />
      <Avatar name="Ben Okafor" size="m" />
      <Avatar name="Chiara Rossi" size="l" />
      <Avatar name="Dmitri Volkov" size="xl" />
      <Avatar name="Acme Corp" shape="square" size="l" />
      <Avatar size="l" />
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div className="catalog-row">
      {([1, 2, 3, 4, 5, 6] as const).map((c) => (
        <Avatar key={c} name={`Color ${c}`} color={c} size="l" />
      ))}
    </div>
  ),
};
