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
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { useControllableState } from '../controllable/use-controllable-state';
import { HiddenValue } from './hidden-value';
import { useFormReset } from './use-form-reset';

function formData(): FormData {
  return new FormData(document.querySelector('form')!);
}

describe('HiddenValue', () => {
  it('leaves null out of the form data and keeps the empty string', () => {
    render(
      <form>
        <HiddenValue name="none" value={null} />
        <HiddenValue name="empty" value="" />
        <HiddenValue name="amount" value="1234.50" />
        <HiddenValue name="tags" value={['a', 'b']} />
      </form>,
    );
    const data = formData();
    expect(data.has('none')).toBe(false);
    expect(data.get('empty')).toBe('');
    expect(data.get('amount')).toBe('1234.50');
    expect(data.getAll('tags')).toEqual(['a', 'b']);
  });
});

function Counter(props: { value?: string | null; onChange?: (v: string | null) => void }) {
  const [value, setValue] = useControllableState<string | null>(
    props.value,
    'start',
    props.onChange,
  );
  const ref = useRef<HTMLButtonElement>(null);
  useFormReset(ref, () => setValue('start'));
  return (
    <>
      <output>{value === null ? '<null>' : `"${value}"`}</output>
      <button ref={ref} type="button" onClick={() => setValue(null)}>
        clear
      </button>
      <button type="button" onClick={() => setValue('')}>
        empty
      </button>
    </>
  );
}

function Parent() {
  const [v, setV] = useState<string | null>(null);
  return <Counter value={v} onChange={setV} />;
}

describe('useControllableState', () => {
  it('keeps null and the empty string apart when uncontrolled', async () => {
    const onChange = vi.fn();
    render(
      <form>
        <Counter onChange={onChange} />
        <button type="reset">reset</button>
      </form>,
    );
    await userEvent.click(screen.getByText('clear'));
    expect(screen.getByRole('status').textContent).toBe('<null>');
    await userEvent.click(screen.getByText('empty'));
    expect(screen.getByRole('status').textContent).toBe('""');
    expect(onChange.mock.calls).toEqual([[null], ['']]);
    await userEvent.click(screen.getByText('reset'));
    expect(screen.getByRole('status').textContent).toBe('"start"');
  });

  it('treats null as a controlled value', async () => {
    render(<Parent />);
    expect(screen.getByRole('status').textContent).toBe('<null>');
    await userEvent.click(screen.getByText('empty'));
    expect(screen.getByRole('status').textContent).toBe('""');
  });
});
