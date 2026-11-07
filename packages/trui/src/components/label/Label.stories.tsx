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
import { TextField } from '../text-field/TextField';
import { Label } from './Label';

/**
 * The label of a field. Connect it with `htmlFor` to the id of the field; a
 * click on the label then focuses the field and assistive technology reads it
 * as the name of the field. The required marker is decorative; the field
 * itself carries `required`.
 *
 * **Tokens:** `--trui-color-text-secondary`, `--trui-color-error`.
 */
const meta = {
  title: 'Basics/Label',
  component: Label,
  args: { children: 'Supplier' },
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Required: Story = { args: { required: true } };
export const WithColon: Story = { args: { showColon: true } };
/** A disabled label belongs to a disabled field; WCAG exempts both from contrast requirements. */
export const Disabled: Story = {
  render: () => (
    <div className="catalog-stack">
      <Label htmlFor="disabled-field" disabled>
        Supplier
      </Label>
      <TextField id="disabled-field" disabled defaultValue="Acme Corp" />
    </div>
  ),
};
