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
import { DateTimePicker } from '../date-time-picker/DateTimePicker';
import { TimePicker } from '../time-picker/TimePicker';
import { DatePicker } from './DatePicker';

/**
 * Inputs for dates, times and points in time. Values are canonical: dates
 * `YYYY-MM-DD`, times `HH:MM:SS`, points in time UTC timestamps. The fields
 * show and read the format of the language and accept short forms such as
 * `7.11.` or `1430`.
 *
 * **Keyboard:** Alt+Arrow Down or F4 opens the calendar; arrows move by day
 * and week, Page Up and Down by month, Enter picks, Escape closes. The time
 * list opens with Arrow Down.
 *
 * **Tokens:** as TextField, `--trui-color-accent` for the selected day.
 */
const meta = {
  title: 'Inputs/DatePicker',
  component: DatePicker,
  args: { 'aria-label': 'Delivery date', defaultValue: '2026-11-07' },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithRange: Story = { args: { min: '2026-11-01', max: '2026-11-30' } };

function Values() {
  const [date, setDate] = useState<string | null>('2026-11-07');
  const [time, setTime] = useState<string | null>('14:30:00');
  const [stamp, setStamp] = useState<string | null>('2026-11-07T13:30:00.000000Z');
  return (
    <div className="catalog-stack">
      <DatePicker aria-label="Date" nullable value={date} onChange={setDate} />
      <TimePicker aria-label="Time" nullable value={time} onChange={setTime} />
      <DateTimePicker aria-label="Due" nullable value={stamp} onChange={setStamp} />
      <code>
        {JSON.stringify(date)} · {JSON.stringify(time)} · {JSON.stringify(stamp)}
      </code>
    </div>
  );
}

export const AllKinds: Story = { render: () => <Values /> };
