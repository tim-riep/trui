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
import { Switch } from '../switch/Switch';
import { Checkbox } from './Checkbox';

/**
 * A box to turn an option on or off; `indeterminate` shows a dash for "partly".
 * A native checkbox: it submits under `name` when checked.
 *
 * **Keyboard:** Space toggles.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-color-border-strong`, `--trui-target-size`.
 */
const meta = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  args: { children: 'Deliver partially' },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="catalog-stack">
      <Checkbox defaultChecked>Checked</Checkbox>
      <Checkbox indeterminate>Some items selected</Checkbox>
      <Checkbox disabled>Disabled</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled and checked
      </Checkbox>
      <Checkbox valueState="error" valueStateMessage="Accept the terms to continue">
        I accept the terms of delivery
      </Checkbox>
    </div>
  ),
};

/** A switch is for settings that take effect at once. */
export const Switches: Story = {
  render: () => (
    <div className="catalog-stack">
      <Switch defaultChecked>Notify me by email</Switch>
      <Switch>Show archived orders</Switch>
      <Switch disabled>Disabled</Switch>
    </div>
  ),
};
