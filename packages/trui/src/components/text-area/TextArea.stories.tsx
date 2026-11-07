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
import { TextArea } from './TextArea';

/**
 * A text input with several lines. `autoGrow` makes it grow with its content
 * up to `maxRows`; `showCount` tells how many characters of `maxLength` are
 * left. Clearing gives `""`, or `null` with `nullable`.
 *
 * **Keyboard:** standard multi-line text input.
 *
 * **Tokens:** as TextField.
 */
const meta = {
  title: 'Inputs/TextArea',
  component: TextArea,
  args: { 'aria-label': 'Note', placeholder: 'Note for the supplier' },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const AutoGrowWithCount: Story = {
  args: { autoGrow: true, showCount: true, maxLength: 200 },
};
export const WithError: Story = {
  args: {
    defaultValue: 'Deliver to gate',
    valueState: 'error',
    valueStateMessage: 'Name the gate number',
  },
};
