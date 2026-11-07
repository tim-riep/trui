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
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { DatePicker } from './DatePicker';

const input = () => screen.getByRole<HTMLInputElement>('textbox');

function Controlled({ locale, initial = null }: { locale: string; initial?: string | null }) {
  const [value, setValue] = useState<string | null>(initial);
  return (
    <TruiProvider locale={locale} timeZone="Europe/Berlin">
      <DatePicker
        aria-label="Delivery date"
        nullable
        value={value}
        onChange={setValue}
        min="2026-01-01"
      />
      <output>{value === null ? '<null>' : value}</output>
    </TruiProvider>
  );
}
const output = () => screen.getByRole('status').textContent;

describe('DatePicker', () => {
  it('reads dates typed in the format of the locale', async () => {
    render(<Controlled locale="de" />);
    expect(input().placeholder).toBe('TT.MM.JJJJ');
    await userEvent.type(input(), '7.11.2026');
    expect(output()).toBe('2026-11-07');
    await userEvent.tab();
    expect(input().value).toBe('07.11.2026');
  });

  it('shows an error for invalid and out of range dates', async () => {
    render(<Controlled locale="en-US" />);
    await userEvent.type(input(), '2/30/2026');
    await userEvent.tab();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Enter a valid date')).toBeTruthy();
    await userEvent.clear(input());
    await userEvent.type(input(), '12/31/2025{Enter}');
    expect(output()).toBe('2025-12-31');
    expect(screen.getByText(/on or after/)).toBeTruthy();
  });

  it('picks a date in the calendar with the keyboard', async () => {
    render(<Controlled locale="de" initial="2026-11-07" />);
    input().focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    const grid = await screen.findByRole('grid');
    expect(grid).toBeTruthy();
    expect((document.activeElement as HTMLElement).dataset.date).toBe('2026-11-07');
    await userEvent.keyboard('{ArrowRight}{ArrowDown}{Enter}');
    expect(output()).toBe('2026-11-15');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(input());
  });

  it('closes the calendar with Escape and returns focus', async () => {
    render(<Controlled locale="en" initial="2026-11-07" />);
    await userEvent.click(screen.getByRole('button', { name: 'Open calendar' }));
    await screen.findByRole('grid');
    await userEvent.keyboard('{PageDown}');
    expect(screen.getByText('December 2026')).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('grid')).toBeNull();
    expect(document.activeElement).toBe(input());
    expect(output()).toBe('2026-11-07');
  });
});
