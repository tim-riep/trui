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
import { useState } from 'react';
import { searchIcon } from '../../icons/set/search';
import { Icon } from '../icon/Icon';
import { Label } from '../label/Label';
import { TextField } from './TextField';

/**
 * A single-line text input, controlled (`value`, `onChange`) or uncontrolled
 * (`defaultValue`). `onChange` receives the new value first.
 *
 * Clearing the field gives `""`; with `nullable` it gives `null`, and the prop
 * types allow `null` only then. Inside a native `<form>` the field submits its
 * value under `name` (a `null` value is left out) and returns to
 * `defaultValue` on reset. With React Hook Form, use it through `Controller`.
 *
 * **Value state:** `error`, `warning`, `success` and `information` color the
 * field; `valueStateMessage` is shown below it, referenced with
 * `aria-describedby` and announced when it changes.
 *
 * **Keyboard:** standard text input.
 *
 * **Tokens:** `--trui-control-height`, `--trui-color-border-strong`,
 * `--trui-color-focus`, the status colors.
 */
const meta = {
  title: 'Inputs/TextField',
  component: TextField,
  args: { placeholder: 'Enter a name', 'aria-label': 'Name' },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  render: () => (
    <div className="catalog-stack">
      <Label htmlFor="supplier" required>
        Supplier
      </Label>
      <TextField id="supplier" required defaultValue="Acme Corp" />
    </div>
  ),
};

export const ValueStates: Story = {
  render: () => (
    <div className="catalog-stack">
      <TextField
        aria-label="Error"
        defaultValue="12/34"
        valueState="error"
        valueStateMessage="Enter a valid order number"
      />
      <TextField
        aria-label="Warning"
        defaultValue="Acme"
        valueState="warning"
        valueStateMessage="Supplier is blocked for orders"
      />
      <TextField
        aria-label="Success"
        defaultValue="DE123456789"
        valueState="success"
        valueStateMessage="Tax number verified"
      />
      <TextField
        aria-label="Information"
        defaultValue="EUR"
        valueState="information"
        valueStateMessage="Taken from the company"
      />
    </div>
  ),
};

export const ReadOnlyAndDisabled: Story = {
  render: () => (
    <div className="catalog-stack">
      <TextField aria-label="Read only" readOnly defaultValue="Read only" />
      <TextField aria-label="Disabled" disabled defaultValue="Disabled" />
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div className="catalog-stack">
      <TextField
        aria-label="Search"
        type="search"
        placeholder="Search"
        startContent={<Icon icon={searchIcon} size="s" />}
      />
      <TextField aria-label="Weight" defaultValue="12.5" endContent="kg" />
    </div>
  ),
};

function NullableDemo() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="catalog-stack">
      <TextField
        aria-label="Note"
        nullable
        value={value}
        onChange={setValue}
        placeholder="No value"
      />
      <code>value: {value === null ? 'null' : JSON.stringify(value)}</code>
    </div>
  );
}

export const Nullable: Story = { render: () => <NullableDemo /> };
