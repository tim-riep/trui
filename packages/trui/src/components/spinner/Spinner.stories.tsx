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
import { Spinner } from './Spinner';

/**
 * Shows that something runs without a known duration. It is a status region,
 * so assistive technology announces its label. With `delay` it appears only if
 * loading takes longer, which avoids flicker.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-icon-size-s` … `--trui-icon-size-xl`.
 */
const meta = {
  title: 'Basics/Spinner',
  component: Spinner,
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="catalog-row">
      <Spinner size="s" />
      <Spinner size="m" />
      <Spinner size="l" />
    </div>
  ),
};
