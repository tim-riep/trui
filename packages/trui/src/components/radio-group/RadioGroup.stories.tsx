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
import { RadioGroup } from './RadioGroup';

/**
 * A choice of one of a few options that are all visible. Without a selection
 * the value is `null`.
 *
 * **Keyboard:** Tab moves into the group, arrow keys select.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-color-border-strong`, `--trui-target-size`.
 */
const meta = {
  title: 'Inputs/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Shipping',
    defaultValue: 'standard',
    options: [
      { value: 'standard', label: 'Standard', description: '3 to 5 working days' },
      { value: 'express', label: 'Express', description: 'Next working day' },
      { value: 'pickup', label: 'Pickup', description: 'At the warehouse', disabled: true },
    ],
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = { args: { orientation: 'horizontal' } };
