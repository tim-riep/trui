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

import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  fromZoned,
  isDate,
  isTime,
  isTimestamp,
  today,
  toZoned,
  weekday,
} from './date';
import {
  dateFieldOrder,
  datePlaceholder,
  firstDayOfWeek,
  formatDate,
  formatDateForInput,
  parseLocalizedDate,
  parseLocalizedTime,
} from './localized';

describe('canonical values', () => {
  it('validates dates, times and timestamps', () => {
    expect(isDate('2024-02-29')).toBe(true);
    expect(isDate('2023-02-29')).toBe(false);
    expect(isDate('2026-13-01')).toBe(false);
    expect(isTime('23:59:59')).toBe(true);
    expect(isTime('24:00:00')).toBe(false);
    expect(isTimestamp('2026-11-07T21:30:00.123456Z')).toBe(true);
    expect(isTimestamp('2026-11-07T21:30:00Z')).toBe(false);
  });

  it('does calendar arithmetic', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2026-01-15', -2)).toBe('2025-11-15');
    expect(weekday('2026-11-07')).toBe(6);
  });

  it('converts between timestamps and local time', () => {
    expect(toZoned('2026-11-07T21:30:00.000001Z', 'Europe/Berlin')).toEqual({
      date: '2026-11-07',
      time: '22:30:00',
      micros: '000001',
    });
    expect(fromZoned('2026-07-01', '12:00:00', 'Europe/Berlin')).toBe(
      '2026-07-01T10:00:00.000000Z',
    );
    // Clocks go back on 2026-10-25 at 03:00: 02:30 occurs twice, the earlier is taken.
    expect(fromZoned('2026-10-25', '02:30:00', 'Europe/Berlin')).toBe(
      '2026-10-25T00:30:00.000000Z',
    );
    // Clocks go forward on 2026-03-29 at 02:00: 02:30 does not exist and moves forward.
    expect(fromZoned('2026-03-29', '02:30:00', 'Europe/Berlin')).toBe(
      '2026-03-29T01:30:00.000000Z',
    );
    expect(today('Pacific/Kiritimati', Date.UTC(2026, 10, 7, 12))).toBe('2026-11-08');
  });
});

describe('localized dates', () => {
  it('knows the field order and placeholder', () => {
    expect(dateFieldOrder('de')).toEqual(['day', 'month', 'year']);
    expect(dateFieldOrder('en-US')).toEqual(['month', 'day', 'year']);
    expect(dateFieldOrder('ja')).toEqual(['year', 'month', 'day']);
    expect(datePlaceholder('de', { day: 'TT', month: 'MM', year: 'JJJJ' })).toBe('TT.MM.JJJJ');
  });

  it('reads typed dates', () => {
    const ref = '2026-11-07';
    expect(parseLocalizedDate('7.11.2026', 'de', ref)).toBe('2026-11-07');
    expect(parseLocalizedDate('07.11.26', 'de', ref)).toBe('2026-11-07');
    expect(parseLocalizedDate('11/7/2026', 'en-US', ref)).toBe('2026-11-07');
    expect(parseLocalizedDate('2026-11-07', 'en-US', ref)).toBe('2026-11-07');
    expect(parseLocalizedDate('07112026', 'de', ref)).toBe('2026-11-07');
    expect(parseLocalizedDate('24.12.', 'de', ref)).toBe('2026-12-24');
    expect(parseLocalizedDate('1.1.80', 'de', ref)).toBe('1980-01-01');
    expect(parseLocalizedDate('31.02.2026', 'de', ref)).toBeNull();
    expect(parseLocalizedDate('morgen', 'de', ref)).toBeNull();
  });

  it('formats dates', () => {
    expect(formatDateForInput('2026-11-07', 'de')).toBe('07.11.2026');
    expect(formatDate('2026-11-07', 'en-US', 'medium')).toBe('Nov 7, 2026');
  });

  it('reads typed times', () => {
    expect(parseLocalizedTime('14:30', 'de')).toBe('14:30:00');
    expect(parseLocalizedTime('1430', 'de')).toBe('14:30:00');
    expect(parseLocalizedTime('9', 'de')).toBe('09:00:00');
    expect(parseLocalizedTime('2:30 PM', 'en-US')).toBe('14:30:00');
    expect(parseLocalizedTime('12:05 am', 'en-US')).toBe('00:05:00');
    expect(parseLocalizedTime('25:00', 'de')).toBeNull();
  });

  it('knows the first day of the week', () => {
    expect(firstDayOfWeek('de-DE')).toBe(1);
    expect(firstDayOfWeek('en-US')).toBe(7);
  });
});
