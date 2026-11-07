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

import { render, screen } from '@testing-library/react';
import { TruiProvider } from '@tim-riep/trui/core';
import { useState } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { AmountField } from '../amount-field/AmountField';
import { NumberField, type NumberFieldProps } from './NumberField';

const input = () => screen.getByRole<HTMLInputElement>('textbox');
const formData = () => new FormData(document.querySelector('form')!);

function Controlled(props: { locale: string; scale?: number }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <TruiProvider locale={props.locale}>
      <NumberField
        aria-label="Amount"
        nullable
        value={value}
        onChange={setValue}
        {...(props.scale !== undefined ? { scale: props.scale } : {})}
      />
      <output>{value === null ? '<null>' : JSON.stringify(value)}</output>
    </TruiProvider>
  );
}
const output = () => screen.getByRole('status').textContent;

describe('NumberField', () => {
  it('allows null only with nullable', () => {
    expectTypeOf<Extract<NumberFieldProps, { nullable: true }>['value']>().toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf<Exclude<NumberFieldProps, { nullable: true }>['value']>().toEqualTypeOf<
      string | undefined
    >();
  });

  it.each([
    ['de', '1.234,5', '"1234.50"', '1.234,50'],
    ['de', '1234,5', '"1234.50"', '1.234,50'],
    ['en', '1,234.5', '"1234.50"', '1,234.50'],
    ['en', '-0.5', '"-0.50"', '-0.50'],
    ['de', '9.007.199.254.740.993,01', '"9007199254740993.01"', '9.007.199.254.740.993,01'],
  ])('reads %s input %s exactly as %s', async (locale, typed, value, shown) => {
    render(<Controlled locale={locale} scale={2} />);
    await userEvent.type(input(), typed);
    expect(output()).toBe(value);
    await userEvent.tab();
    expect(input().value).toBe(shown);
  });

  it('keeps the last valid value for invalid text and reports an error', async () => {
    render(
      <form>
        <Controlled locale="de" scale={2} />
      </form>,
    );
    await userEvent.type(input(), '12');
    await userEvent.type(input(), 'x');
    expect(output()).toBe('"12.00"');
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
    await userEvent.keyboard('{Enter}');
    expect(input().getAttribute('aria-invalid')).toBe('true');
    await userEvent.clear(input());
    expect(output()).toBe('<null>');
    expect(input().hasAttribute('aria-invalid')).toBe(false);
  });

  it('rejects surplus fraction digits instead of rounding', async () => {
    render(<Controlled locale="en" scale={2} />);
    await userEvent.type(input(), '1.005{Enter}');
    expect(output()).toBe('"1.00"');
    expect(screen.getByText(/at most 2 digits after/)).toBeTruthy();
  });

  it('gives the empty string when cleared without nullable', async () => {
    const onChange = vi.fn();
    render(<NumberField aria-label="Amount" defaultValue="5" onChange={onChange} />);
    await userEvent.clear(input());
    expect(onChange).toHaveBeenLastCalledWith('');
  });

  it('submits the canonical value and resets', async () => {
    render(
      <TruiProvider locale="de">
        <form>
          <NumberField aria-label="Quantity" name="quantity" defaultValue="1500.25" scale={2} />
          <NumberField aria-label="Discount" name="discount" nullable />
          <button type="reset">reset</button>
        </form>
      </TruiProvider>,
    );
    const [quantity] = screen.getAllByRole<HTMLInputElement>('textbox');
    expect(quantity!.value).toBe('1.500,25');
    expect(formData().get('quantity')).toBe('1500.25');
    expect(formData().has('discount')).toBe(false);
    await userEvent.clear(quantity!);
    await userEvent.type(quantity!, '7');
    // Firefox may deliver the last key after the call returns when the machine is busy.
    await expect.poll(() => formData().get('quantity')).toBe('7.00');
    document.querySelector('form')!.reset();
    await expect.poll(() => formData().get('quantity')).toBe('1500.25');
    await expect.poll(() => quantity!.value).toBe('1.500,25');
  });

  it('checks the range and steps with the arrow keys', async () => {
    render(
      <NumberField aria-label="Rate" defaultValue="9" min="0" max="10" step="0.5" scale={1} />,
    );
    input().focus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
    expect(input().value).toBe('10.0');
    await userEvent.clear(input());
    await userEvent.type(input(), '11{Enter}');
    expect(screen.getByText('Enter a value of at most 10')).toBeTruthy();
  });

  it('takes the scale of an amount from its currency', async () => {
    render(
      <form>
        <AmountField aria-label="Price" name="price" currency="JPY" defaultValue="1500" />
        <AmountField aria-label="Total" name="total" currency="EUR" defaultValue="12.5" />
      </form>,
    );
    expect(formData().get('price')).toBe('1500');
    expect(screen.getByText('JPY')).toBeTruthy();
    const [, total] = screen.getAllByRole<HTMLInputElement>('textbox');
    expect(total!.value).toBe('12.50');
  });
});
