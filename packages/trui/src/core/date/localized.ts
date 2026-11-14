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

import {
  addDays,
  addMonths,
  type DateString,
  dateParts,
  dateToUtcDate,
  fromZoned,
  isDate,
  isTime,
  makeDate,
  type TimeString,
  type TimestampString,
  toZoned,
} from './date';

/** Order of day, month and year in the short date format of a locale. */
export type DateFieldOrder = ('day' | 'month' | 'year')[];

/** Order of the date fields in `locale`, e.g. day-month-year for German. */
export function dateFieldOrder(locale: string): DateFieldOrder {
  const parts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
    numberingSystem: 'latn',
  }).formatToParts(new Date(Date.UTC(2033, 10, 22)));
  const order = parts
    .map((p) => p.type)
    .filter((t): t is 'day' | 'month' | 'year' => t === 'day' || t === 'month' || t === 'year');
  return order.length === 3 ? order : ['year', 'month', 'day'];
}

/** A short example of the date format for placeholders, e.g. `DD.MM.YYYY`. */
export function datePlaceholder(
  locale: string,
  letters = { day: 'DD', month: 'MM', year: 'YYYY' },
): string {
  const parts = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
    numberingSystem: 'latn',
  }).formatToParts(new Date(Date.UTC(2033, 10, 22)));
  return parts
    .map((p) =>
      p.type === 'day' || p.type === 'month' || p.type === 'year' ? letters[p.type] : p.value,
    )
    .join('')
    .replace(/[‎‏]/g, '');
}

/** Formats a date for `locale`. */
export function formatDate(
  value: DateString,
  locale: string,
  style: 'short' | 'medium' | 'long' | 'full' = 'medium',
): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: style, timeZone: 'UTC' }).format(
    dateToUtcDate(value),
  );
}

/** Formats a date as the user edits it: numeric with the locale's order. */
export function formatDateForInput(value: DateString, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  })
    .format(dateToUtcDate(value))
    .replace(/[‎‏]/g, '');
}

function asciiDigits(text: string, locale: string): string {
  const plain = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, i) => plain.format(i));
  return Array.from(text, (ch) => {
    const i = digits.indexOf(ch);
    return i >= 0 ? String(i) : ch;
  }).join('');
}

function expandYear(year: string, referenceYear: number): number {
  if (year.length > 2) return Number(year);
  // Two-digit years fall into the window of 50 years around the reference year.
  const y = Number(year);
  const century = Math.floor(referenceYear / 100) * 100;
  const candidate = century + y;
  if (candidate > referenceYear + 50) return candidate - 100;
  if (candidate < referenceYear - 49) return candidate + 100;
  return candidate;
}

/**
 * Reads a date as typed in `locale`. Accepts ISO dates (`2026-11-07`), the
 * numeric format of the locale with any separator (`7.11.2026`, `7/11/26`),
 * day and month without year (current year of `referenceDate`), and digits
 * without separators (`07112026`, `071126`). Returns `null` if the input is
 * not a valid date.
 */
export function parseLocalizedDate(
  input: string,
  locale: string,
  referenceDate: DateString,
): DateString | null {
  const text = asciiDigits(input.trim(), locale).replace(/[‎‏]/g, '');
  if (text === '') return null;
  if (isDate(text)) return text;
  const reference = dateParts(referenceDate);
  const order = dateFieldOrder(locale);

  let fields: string[];
  if (/^\d+$/.test(text)) {
    const yearLength = text.length === 8 ? 4 : text.length === 6 ? 2 : 0;
    if (!yearLength) return null;
    fields = [];
    let at = 0;
    for (const f of order) {
      const len = f === 'year' ? yearLength : 2;
      fields.push(text.slice(at, at + len));
      at += len;
    }
  } else {
    fields = text.split(/\D+/).filter(Boolean);
  }

  const values: Partial<Record<'day' | 'month' | 'year', string>> = {};
  if (fields.length === 3) {
    order.forEach((f, i) => {
      const v = fields[i];
      if (v !== undefined) values[f] = v;
    });
  } else if (fields.length === 2) {
    order
      .filter((f) => f !== 'year')
      .forEach((f, i) => {
        const v = fields[i];
        if (v !== undefined) values[f] = v;
      });
  } else {
    return null;
  }
  const day = Number(values.day);
  const month = Number(values.month);
  const year = values.year === undefined ? reference.year : expandYear(values.year, reference.year);
  if (!values.day || !values.month || values.day.length > 2 || values.month.length > 2) return null;
  return makeDate(year, month, day);
}

/** Words of a language for dates relative to today. */
export interface RelativeDateWords {
  today: string;
  tomorrow: string;
  yesterday: string;
  /** Letters for day, week, month and year in this order, e.g. `dwmy`. */
  units: string;
}

/**
 * Reads a date relative to `referenceDate`: the words for today, tomorrow and
 * yesterday, or a signed count with an optional unit, e.g. `+3` (days), `-1w`
 * or `+2m`. Case does not matter. Returns `null` for any other input.
 */
export function parseRelativeDate(
  input: string,
  words: RelativeDateWords,
  referenceDate: DateString,
): DateString | null {
  const text = input.trim().toLocaleLowerCase();
  if (text === '') return null;
  if (text === words.today.toLocaleLowerCase()) return referenceDate;
  if (text === words.tomorrow.toLocaleLowerCase()) return addDays(referenceDate, 1);
  if (text === words.yesterday.toLocaleLowerCase()) return addDays(referenceDate, -1);
  const match = /^([+-])\s*(\d{1,4})\s*(\p{L})?$/u.exec(text);
  if (!match) return null;
  const count = Number(match[2]) * (match[1] === '-' ? -1 : 1);
  const unit = match[3] === undefined ? 0 : words.units.toLocaleLowerCase().indexOf(match[3]);
  if (unit === 0) return addDays(referenceDate, count);
  if (unit === 1) return addDays(referenceDate, count * 7);
  if (unit === 2) return addMonths(referenceDate, count);
  if (unit === 3) return addMonths(referenceDate, count * 12);
  return null;
}

/** Tells whether `locale` shows times with a 12-hour clock. */
export function uses12HourClock(locale: string): boolean {
  const cycle = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions().hourCycle;
  return cycle === 'h12' || cycle === 'h11';
}

/** Formats a time of day for `locale`. */
export function formatTime(value: TimeString, locale: string, seconds = false): string {
  const [h, m, s] = value.split(':').map(Number);
  return new Intl.DateTimeFormat(locale, {
    hour: uses12HourClock(locale) ? 'numeric' : '2-digit',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' } : {}),
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2000, 0, 1, h, m, s)));
}

function dayPeriods(locale: string): { am: string; pm: string } {
  const f = new Intl.DateTimeFormat(locale, { hour: 'numeric', hourCycle: 'h12', timeZone: 'UTC' });
  const period = (h: number) =>
    f.formatToParts(new Date(Date.UTC(2000, 0, 1, h))).find((p) => p.type === 'dayPeriod')?.value ??
    '';
  return { am: period(9).toLowerCase(), pm: period(15).toLowerCase() };
}

/**
 * Reads a time as typed in `locale`: `14:30`, `14.30`, `1430`, `14:30:15`,
 * `2:30 pm` (with the day periods of the locale or am/pm). Returns `null`
 * if the input is not a valid time.
 */
export function parseLocalizedTime(input: string, locale: string): TimeString | null {
  let text = asciiDigits(input.trim().toLowerCase(), locale).replace(/[‎‏]/g, '');
  if (text === '') return null;
  const periods = dayPeriods(locale);
  let period: 'am' | 'pm' | null = null;
  for (const [key, labels] of [
    ['am', [periods.am, 'am', 'a.m.', 'a']],
    ['pm', [periods.pm, 'pm', 'p.m.', 'p']],
  ] as const) {
    for (const label of labels) {
      if (label && text.endsWith(label)) {
        period = key;
        text = text.slice(0, -label.length).trim();
        break;
      }
      if (label && text.startsWith(label)) {
        period = key;
        text = text.slice(label.length).trim();
        break;
      }
    }
    if (period) break;
  }
  let fields: string[];
  if (/^\d+$/.test(text)) {
    if (text.length <= 2) fields = [text];
    else if (text.length === 3 || text.length === 4) fields = [text.slice(0, -2), text.slice(-2)];
    else if (text.length === 6) fields = [text.slice(0, 2), text.slice(2, 4), text.slice(4)];
    else return null;
  } else {
    fields = text.split(/[^\d]+/).filter(Boolean);
  }
  if (fields.length < 1 || fields.length > 3 || fields.some((f) => f.length > 2)) return null;
  let hour = Number(fields[0]);
  const minute = Number(fields[1] ?? 0);
  const second = Number(fields[2] ?? 0);
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = (hour % 12) + (period === 'pm' ? 12 : 0);
  }
  const value = [hour, minute, second].map((n) => String(n).padStart(2, '0')).join(':');
  return isTime(value) ? value : null;
}

/** Formats a timestamp in `timeZone` for `locale`. */
export function formatTimestamp(
  value: TimestampString,
  locale: string,
  timeZone: string,
  options: { dateStyle?: 'short' | 'medium' | 'long'; seconds?: boolean } = {},
): string {
  const { date, time } = toZoned(value, timeZone);
  return `${formatDate(date, locale, options.dateStyle ?? 'medium')}, ${formatTime(time, locale, options.seconds)}`;
}

/** Converts a local date and time in `timeZone` to a timestamp. */
export function zonedToTimestamp(
  date: DateString,
  time: TimeString,
  timeZone: string,
): TimestampString {
  return fromZoned(date, time, timeZone);
}

/** First day of the week in `locale`: 1 Monday … 7 Sunday. */
export function firstDayOfWeek(locale: string): number {
  const l = new Intl.Locale(locale) as Intl.Locale & {
    getWeekInfo?: () => { firstDay: number };
    weekInfo?: { firstDay: number };
  };
  const info = l.getWeekInfo?.() ?? l.weekInfo;
  if (info) return info.firstDay;
  const region = l.maximize().region ?? '';
  return ['US', 'CA', 'MX', 'BR', 'JP', 'KR', 'IL', 'IN', 'PH', 'TW', 'HK', 'ZA', 'AU'].includes(
    region,
  )
    ? 7
    : 1;
}

/** Names of the weekdays, starting with Monday. */
export function weekdayNames(
  locale: string,
  width: 'narrow' | 'short' | 'long' = 'short',
): string[] {
  const f = new Intl.DateTimeFormat(locale, { weekday: width, timeZone: 'UTC' });
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2024, 0, 1 + i))));
}

/** Names of the months, starting with January. */
export function monthNames(locale: string, width: 'short' | 'long' = 'long'): string[] {
  const f = new Intl.DateTimeFormat(locale, { month: width, timeZone: 'UTC' });
  return Array.from({ length: 12 }, (_, i) => f.format(new Date(Date.UTC(2024, i, 1))));
}
