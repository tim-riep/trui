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
import { Controller, useForm } from 'react-hook-form';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Label } from '../label/Label';
import { TextField, type TextFieldProps } from './TextField';

const input = () => screen.getByRole<HTMLInputElement>('textbox');
const formData = () => new FormData(document.querySelector('form')!);

describe('TextField types', () => {
  it('allows null only with nullable', () => {
    expectTypeOf<Extract<TextFieldProps, { nullable: true }>['value']>().toEqualTypeOf<
      string | null | undefined
    >();
    expectTypeOf<Exclude<TextFieldProps, { nullable: true }>['value']>().toEqualTypeOf<
      string | undefined
    >();
    // @ts-expect-error null needs nullable
    <TextField value={null} aria-label="x" />;
  });
});

function Controlled() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <TextField aria-label="Note" nullable value={value} onChange={setValue} />
      <output>{value === null ? '<null>' : JSON.stringify(value)}</output>
    </>
  );
}

function HookForm({ onSubmit }: { onSubmit: (values: { note: string | null }) => void }) {
  const { control, handleSubmit } = useForm<{ note: string | null }>({
    defaultValues: { note: 'x' },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="note"
        control={control}
        render={({ field }) => (
          <TextField
            aria-label="Note"
            nullable
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            ref={field.ref}
          />
        )}
      />
      <button type="submit">submit</button>
    </form>
  );
}

describe('TextField', () => {
  it('gives the empty string when cleared without nullable', async () => {
    const onChange = vi.fn();
    render(<TextField aria-label="Name" defaultValue="ab" onChange={onChange} />);
    await userEvent.clear(input());
    expect(onChange).toHaveBeenLastCalledWith('', expect.anything());
  });

  it('gives null when cleared with nullable', async () => {
    const onChange = vi.fn();
    render(<TextField aria-label="Name" nullable defaultValue="ab" onChange={onChange} />);
    await userEvent.clear(input());
    expect(onChange).toHaveBeenLastCalledWith(null, expect.anything());
  });

  it('works controlled with null and the empty string as different values', async () => {
    render(<Controlled />);
    expect(screen.getByRole('status').textContent).toBe('<null>');
    await userEvent.type(input(), 'x');
    expect(screen.getByRole('status').textContent).toBe('"x"');
    await userEvent.clear(input());
    expect(screen.getByRole('status').textContent).toBe('<null>');
  });

  it('submits its value in a native form and resets to the default', async () => {
    render(
      <form>
        <TextField aria-label="Name" name="name" defaultValue="Acme" />
        <TextField aria-label="Note" name="note" nullable />
        <TextField aria-label="Remark" name="remark" nullable defaultValue="" />
        <button type="reset">reset</button>
      </form>,
    );
    let data = formData();
    expect(data.get('name')).toBe('Acme');
    expect(data.has('note')).toBe(false);
    expect(data.get('remark')).toBe('');

    const [name] = screen.getAllByRole<HTMLInputElement>('textbox');
    await userEvent.clear(name!);
    await userEvent.type(name!, 'Beta');
    expect(formData().get('name')).toBe('Beta');

    await userEvent.click(screen.getByText('reset'));
    data = formData();
    expect(data.get('name')).toBe('Acme');
    expect(name!.value).toBe('Acme');
  });

  it('takes part in constraint validation', () => {
    render(
      <form>
        <TextField aria-label="Name" name="name" required />
      </form>,
    );
    expect(document.querySelector('form')!.checkValidity()).toBe(false);
  });

  it('describes the value state and announces its message', () => {
    render(
      <TruiProvider locale="de">
        <TextField
          aria-label="Order"
          aria-describedby="hint"
          valueState="error"
          valueStateMessage="Invalid number"
        />
        <span id="hint">Ten digits</span>
      </TruiProvider>,
    );
    const field = input();
    expect(field.getAttribute('aria-invalid')).toBe('true');
    const ids = field.getAttribute('aria-describedby')!.split(' ');
    expect(ids[0]).toBe('hint');
    const message = document.getElementById(ids[1]!)!;
    expect(message.getAttribute('aria-live')).toBe('polite');
    expect(message.textContent).toBe('Fehler: Invalid number');
  });

  it('is labeled by a Label', async () => {
    render(
      <>
        <Label htmlFor="supplier">Supplier</Label>
        <TextField id="supplier" />
      </>,
    );
    expect(screen.getByLabelText('Supplier')).toBe(input());
    await userEvent.click(screen.getByText('Supplier'));
    expect(document.activeElement).toBe(input());
  });

  it('works with React Hook Form through Controller', async () => {
    const onSubmit = vi.fn();
    render(<HookForm onSubmit={onSubmit} />);
    await userEvent.clear(input());
    await userEvent.click(screen.getByText('submit'));
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0]![0]).toEqual({ note: null });
  });
});
