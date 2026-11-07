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
import { AmountField } from '../amount-field/AmountField';
import { NumberField } from './NumberField';

/**
 * Inputs for exact decimal numbers. The value is a canonical string such as
 * `"1234.50"`, never a JavaScript number. Input and display follow the
 * language: switch it in the toolbar and type `1.234,5` in German or
 * `1,234.5` in English. `AmountField` takes the fraction digits from the
 * currency.
 *
 * Invalid text keeps the last valid value; the error shows when leaving the
 * field or pressing Enter.
 *
 * **Keyboard:** with `step`, Arrow Up and Down change the value.
 *
 * **Tokens:** as TextField; digits are tabular and aligned to the end.
 */
const meta = {
  title: 'Inputs/NumberField',
  component: NumberField,
  args: { 'aria-label': 'Quantity', scale: 3, defaultValue: '1250.5' },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

function ValueDemo() {
  const [value, setValue] = useState<string | null>('1234.5');
  return (
    <div className="catalog-stack">
      <NumberField
        aria-label="Weight"
        nullable
        value={value}
        onChange={setValue}
        scale={2}
        min="0"
        max="99999"
        step="0.25"
        endContent="kg"
      />
      <code>value: {value === null ? 'null' : JSON.stringify(value)}</code>
    </div>
  );
}

export const CanonicalValue: Story = { render: () => <ValueDemo /> };

export const Amounts: Story = {
  render: () => (
    <div className="catalog-stack">
      <AmountField aria-label="Net amount" currency="EUR" defaultValue="18990.5" />
      <AmountField aria-label="Amount in yen" currency="JPY" defaultValue="250000" />
      <AmountField
        aria-label="Credit limit"
        currency="CHF"
        defaultValue=""
        valueState="warning"
        valueStateMessage="No credit limit set"
      />
    </div>
  ),
};
