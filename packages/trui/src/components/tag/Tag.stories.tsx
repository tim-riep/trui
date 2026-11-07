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
import { errorIcon } from '../../icons/set/error';
import { successIcon } from '../../icons/set/success';
import { Tag } from './Tag';

/**
 * A short label for a status or category. The text carries the meaning, the
 * color supports it; use an icon where color alone could be missed.
 *
 * **Tokens:** status colors and their `-subtle` variants, `--trui-control-height-s`.
 */
const meta = {
  title: 'Basics/Tag',
  component: Tag,
  args: { children: 'Released', tone: 'success' },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="catalog-row">
      <Tag>Draft</Tag>
      <Tag tone="accent">In approval</Tag>
      <Tag tone="success" icon={successIcon}>
        Released
      </Tag>
      <Tag tone="warning">Partly delivered</Tag>
      <Tag tone="error" icon={errorIcon}>
        Overdue
      </Tag>
      <Tag tone="information">New</Tag>
    </div>
  ),
};
