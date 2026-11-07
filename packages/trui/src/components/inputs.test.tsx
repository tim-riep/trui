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

import { render, screen, within } from '@testing-library/react';
import { type ListItem, TruiProvider } from '@tim-riep/trui/core';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Checkbox } from './checkbox/Checkbox';
import { ComboBox } from './combo-box/ComboBox';
import { DateTimePicker } from './date-time-picker/DateTimePicker';
import { Dialog } from './dialog/Dialog';
import { FileInput } from './file-input/FileInput';
import { Form, FormField, FormGroup } from './form/Form';
import { LookupField } from './lookup-field/LookupField';
import { MultiSelect } from './multi-select/MultiSelect';
import { NumberField } from './number-field/NumberField';
import { RadioGroup } from './radio-group/RadioGroup';
import { Select } from './select/Select';
import { Switch } from './switch/Switch';
import { TextArea } from './text-area/TextArea';
import { TextField } from './text-field/TextField';
import { TimePicker } from './time-picker/TimePicker';

const formData = () => new FormData(document.querySelector('form')!);
const countries: ListItem[] = [
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'DE', label: 'Germany' },
  { value: 'DK', label: 'Denmark' },
  { value: 'FR', label: 'France', disabled: true },
];

function Stamp() {
  const [value, setValue] = useState<string | null>('2026-07-01T10:00:00.000000Z');
  return (
    <TruiProvider locale="de" timeZone="Europe/Berlin">
      <DateTimePicker aria-label="Due" nullable value={value} onChange={setValue} />
      <output>{value === null ? '<null>' : value}</output>
    </TruiProvider>
  );
}

function WithDialog() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        open
      </button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Edit"
        footer={<button type="button">done</button>}
      >
        <input aria-label="inside" />
      </Dialog>
    </>
  );
}

function Order({ onSubmit }: { onSubmit: (values: { amount: string | null }) => void }) {
  const { control, handleSubmit } = useForm<{ amount: string | null }>({
    defaultValues: { amount: null },
  });
  return (
    <TruiProvider locale="de">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="amount"
          control={control}
          render={({ field }) => (
            <NumberField
              aria-label="Amount"
              nullable
              scale={2}
              value={field.value}
              onChange={field.onChange}
              ref={field.ref}
            />
          )}
        />
        <button type="submit">submit</button>
      </form>
    </TruiProvider>
  );
}

describe('TextArea', () => {
  it('keeps null and the empty string apart and counts characters', async () => {
    const onChange = vi.fn();
    render(
      <TextArea
        aria-label="Note"
        nullable
        defaultValue="ab"
        maxLength={10}
        showCount
        onChange={onChange}
      />,
    );
    const area = screen.getByRole('textbox');
    expect(screen.getByText('8 characters left')).toBeTruthy();
    await userEvent.clear(area);
    expect(onChange).toHaveBeenLastCalledWith(null, expect.anything());
    expect(screen.getByText('10 characters left')).toBeTruthy();
  });
});

describe('Checkbox, Switch and RadioGroup', () => {
  it('submit natively and reset', async () => {
    render(
      <form>
        <Checkbox name="partial" value="yes">
          Partial
        </Checkbox>
        <Switch name="notify" defaultChecked>
          Notify
        </Switch>
        <RadioGroup
          name="shipping"
          label="Shipping"
          options={[
            { value: 'standard', label: 'Standard' },
            { value: 'express', label: 'Express' },
          ]}
        />
        <button type="reset">reset</button>
      </form>,
    );
    expect(formData().has('partial')).toBe(false);
    expect(formData().get('notify')).toBe('on');
    expect(formData().has('shipping')).toBe(false);
    await userEvent.click(screen.getByText('Partial'));
    await userEvent.click(screen.getByRole('switch'));
    await userEvent.click(screen.getByText('Express'));
    expect(formData().get('partial')).toBe('yes');
    expect(formData().has('notify')).toBe(false);
    expect(formData().get('shipping')).toBe('express');
    expect(screen.getByRole('radiogroup', { name: 'Shipping' })).toBeTruthy();
    await userEvent.click(screen.getByText('reset'));
    expect(formData().has('partial')).toBe(false);
    expect(formData().get('notify')).toBe('on');
    expect(formData().has('shipping')).toBe(false);
  });

  it('shows indeterminate and is a switch', () => {
    render(
      <>
        <Checkbox indeterminate>Some</Checkbox>
        <Switch>Archived</Switch>
      </>,
    );
    expect(screen.getByRole<HTMLInputElement>('checkbox').indeterminate).toBe(true);
    expect(screen.getByRole('switch', { name: 'Archived' })).toBeTruthy();
  });
});

describe('Select', () => {
  it('opens, moves and picks with the keyboard and submits the value', async () => {
    const onChange = vi.fn();
    render(
      <form>
        <Select
          aria-label="Country"
          name="country"
          items={countries}
          defaultValue="BE"
          onChange={onChange}
        />
      </form>,
    );
    const button = screen.getByRole('combobox', { name: 'Country' });
    expect(button.textContent).toContain('Belgium');
    expect(formData().get('country')).toBe('BE');
    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'Belgium' }).getAttribute('aria-selected'),
    ).toBe('true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('DE', countries[2]);
    expect(formData().get('country')).toBe('DE');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('jumps by typing and skips disabled options', async () => {
    render(<Select aria-label="Country" items={countries} />);
    const button = screen.getByRole('combobox');
    button.focus();
    await userEvent.keyboard('de');
    const active = button.getAttribute('aria-activedescendant')!;
    expect(document.getElementById(active)!.textContent).toBe('Denmark');
    await userEvent.keyboard('{End}');
    expect(
      document.getElementById(button.getAttribute('aria-activedescendant')!)!.textContent,
    ).toBe('Denmark');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('offers no selection when nullable', async () => {
    const onChange = vi.fn();
    render(
      <Select
        aria-label="Country"
        items={countries}
        nullable
        defaultValue="AT"
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByRole('option', { name: '(none)' }));
    expect(onChange).toHaveBeenLastCalledWith(null, null);
  });

  it('takes part in required validation', () => {
    render(
      <form>
        <Select aria-label="Country" items={countries} required />
      </form>,
    );
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
  });
});

describe('ComboBox', () => {
  it('filters fixed options and picks with Enter', async () => {
    const onChange = vi.fn();
    render(<ComboBox aria-label="Country" items={countries} onChange={onChange} />);
    const input = screen.getByRole<HTMLInputElement>('combobox');
    await userEvent.type(input, 'den');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Denmark']);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('DK', countries[3]);
    expect(input.value).toBe('Denmark');
  });

  it('loads options, aborts outdated requests and shows the label', async () => {
    const signals: AbortSignal[] = [];
    const loadItems = vi.fn((query: string, signal: AbortSignal) => {
      signals.push(signal);
      return Promise.resolve(
        countries.filter((c) => c.label.toLowerCase().startsWith(query.toLowerCase())),
      );
    });
    const onChange = vi.fn();
    render(
      <ComboBox aria-label="Country" loadItems={loadItems} debounce={20} onChange={onChange} />,
    );
    const input = screen.getByRole<HTMLInputElement>('combobox');
    await userEvent.type(input, 'ge');
    await vi.waitFor(() =>
      expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Germany']),
    );
    expect(signals.slice(0, -1).every((s) => s.aborted)).toBe(true);
    await userEvent.click(screen.getByRole('option', { name: 'Germany' }));
    expect(onChange).toHaveBeenLastCalledWith('DE', expect.objectContaining({ value: 'DE' }));
    expect(input.value).toBe('Germany');
  });

  it('restores the value for unknown text, or takes it with allowCustomValue', async () => {
    render(
      <>
        <ComboBox aria-label="Strict" items={countries} defaultValue="AT" />
        <ComboBox aria-label="Free" items={countries} allowCustomValue name="free" />
      </>,
    );
    const strict = screen.getByRole<HTMLInputElement>('combobox', { name: 'Strict' });
    expect(strict.value).toBe('Austria');
    await userEvent.clear(strict);
    await userEvent.type(strict, 'Atlantis');
    await userEvent.tab();
    expect(strict.value).toBe('Austria');
    const free = screen.getByRole<HTMLInputElement>('combobox', { name: 'Free' });
    await userEvent.type(free, 'Atlantis');
    await userEvent.tab();
    expect(free.value).toBe('Atlantis');
  });
});

describe('MultiSelect', () => {
  it('adds and removes tokens and submits every value', async () => {
    render(
      <form>
        <MultiSelect
          aria-label="Countries"
          name="countries"
          items={countries}
          defaultValue={['AT']}
        />
      </form>,
    );
    const input = screen.getByRole('combobox');
    await userEvent.type(input, 'ger');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(formData().getAll('countries')).toEqual(['AT', 'DE']);
    expect(screen.getByRole('listbox').getAttribute('aria-multiselectable')).toBe('true');
    await userEvent.keyboard('{Escape}');
    await userEvent.keyboard('{Backspace}');
    expect(formData().getAll('countries')).toEqual(['AT']);
    await userEvent.click(screen.getByRole('button', { name: 'Remove Austria' }));
    expect(formData().getAll('countries')).toEqual([]);
  });

  it('gives null when emptied with nullable', async () => {
    const onChange = vi.fn();
    render(
      <MultiSelect
        aria-label="Countries"
        nullable
        items={countries}
        defaultValue={['AT']}
        onChange={onChange}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Remove Austria' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('sums up tokens beyond the visible ones', () => {
    render(
      <MultiSelect
        aria-label="Countries"
        items={countries}
        defaultValue={['AT', 'BE', 'DE', 'DK']}
        maxVisibleTokens={2}
      />,
    );
    expect(screen.getByText('+2')).toBeTruthy();
  });
});

describe('TimePicker and DateTimePicker', () => {
  it('reads typed times and picks from the list', async () => {
    const onChange = vi.fn();
    render(<TimePicker aria-label="Start" nullable onChange={onChange} minuteStep={60} />);
    const input = screen.getByRole<HTMLInputElement>('combobox');
    await userEvent.type(input, '1430');
    expect(onChange).toHaveBeenLastCalledWith('14:30:00');
    await userEvent.tab();
    expect(input.value).toBe('2:30 PM'.replace(' ', input.value.includes(' ') ? ' ' : ' '));
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith('16:00:00');
  });

  it('combines date and time in the time zone of the provider into a UTC timestamp', async () => {
    render(<Stamp />);
    const date = screen.getByRole<HTMLInputElement>('textbox', { name: 'Datum' });
    const time = screen.getByRole<HTMLInputElement>('combobox', { name: 'Uhrzeit' });
    expect(date.value).toBe('01.07.2026');
    expect(time.value).toBe('12:00');
    await userEvent.clear(time);
    await userEvent.type(time, '8:15');
    expect(screen.getByRole('status').textContent).toBe('2026-07-01T06:15:00.000000Z');
    await userEvent.clear(date);
    expect(screen.getByRole('status').textContent).toBe('2026-07-01T06:15:00.000000Z');
    await userEvent.clear(time);
    expect(screen.getByRole('status').textContent).toBe('<null>');
  });
});

describe('FileInput', () => {
  it('lists, removes and submits files', async () => {
    render(
      <form>
        <FileInput aria-label="Attachments" name="files" multiple />
      </form>,
    );
    const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
    await userEvent.upload(input, [
      new File(['a'], 'offer.pdf', { type: 'application/pdf' }),
      new File(['bb'], 'plan.png', { type: 'image/png' }),
    ]);
    expect(screen.getByText('2 files')).toBeTruthy();
    expect(
      formData()
        .getAll('files')
        .map((f) => (f as File).name),
    ).toEqual(['offer.pdf', 'plan.png']);
    await userEvent.click(screen.getByRole('button', { name: 'Remove offer.pdf' }));
    expect(
      formData()
        .getAll('files')
        .map((f) => (f as File).name),
    ).toEqual(['plan.png']);
  });
});

describe('LookupField and Dialog', () => {
  const fetchItems = vi.fn(
    async ({ query, offset, limit }: { query: string; offset: number; limit: number }) => {
      const all = Array.from({ length: 30 }, (_, i) => ({
        value: `S${i}`,
        label: `Supplier ${i}`,
        description: `City ${i}`,
      }));
      const hits = all.filter((s) => s.label.includes(query));
      return { items: hits.slice(offset, offset + limit), total: hits.length };
    },
  );

  it('opens the value help with F4, searches, pages and picks', async () => {
    const onChange = vi.fn();
    render(<LookupField aria-label="Supplier" fetchItems={fetchItems} onChange={onChange} />);
    const input = screen.getByRole('textbox', { name: 'Supplier' });
    input.focus();
    await userEvent.keyboard('{F4}');
    const dialog = await screen.findByRole('dialog', { name: 'Select a value' });
    await vi.waitFor(() => expect(within(dialog).getByText('30 results')).toBeTruthy());
    expect(document.activeElement).toBe(within(dialog).getByRole('searchbox'));
    await userEvent.click(within(dialog).getByRole('button', { name: /Load more/ }));
    await vi.waitFor(() => expect(within(dialog).getByText('Supplier 25')).toBeTruthy());
    await userEvent.type(within(dialog).getByRole('searchbox'), 'Supplier 1');
    await vi.waitFor(() => expect(within(dialog).getByText('11 results')).toBeTruthy());
    await userEvent.click(within(dialog).getByRole('button', { name: /Supplier 12/ }));
    expect(onChange).toHaveBeenLastCalledWith(
      'S12',
      expect.objectContaining({ label: 'Supplier 12' }),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText('City 12')).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it('closes with Escape and keeps Tab inside', async () => {
    render(<WithDialog />);
    const opener = screen.getByText('open');
    // Opened by keyboard: WebKit does not focus buttons on click.
    opener.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Edit' });
    expect(dialog.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });
});

describe('Form', () => {
  it('connects labels, required flags and hints to the inputs', () => {
    render(
      <Form>
        <FormGroup title="Supplier">
          <FormField label="Name" required help="As in the register">
            <TextField />
          </FormField>
          <FormField label="Country">
            <Select items={countries} />
          </FormField>
          <FormField label="Shipping">
            <RadioGroup options={[{ value: 'a', label: 'A' }]} />
          </FormField>
        </FormGroup>
      </Form>,
    );
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(name.hasAttribute('required')).toBe(true);
    expect(document.getElementById(name.getAttribute('aria-describedby')!)!.textContent).toBe(
      'As in the register',
    );
    expect(screen.getByRole('combobox', { name: 'Country' })).toBeTruthy();
    expect(screen.getByRole('radiogroup', { name: 'Shipping' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Supplier' })).toBeTruthy();
  });

  it('works with React Hook Form through Controller for exact numbers', async () => {
    const onSubmit = vi.fn();
    render(<Order onSubmit={onSubmit} />);
    await userEvent.type(screen.getByRole('textbox'), '1.234,5');
    await userEvent.click(screen.getByText('submit'));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toEqual({ amount: '1234.50' });
  });
});
