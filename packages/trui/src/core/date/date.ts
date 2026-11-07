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

/**
 * Calendar dates, times of day and timestamps as canonical strings.
 *
 * - Date: `YYYY-MM-DD`, a day without time zone.
 * - Time: `HH:MM:SS`, a time of day without time zone.
 * - Timestamp: `YYYY-MM-DDTHH:MM:SS.ffffffZ`, a point in time in UTC with
 *   microseconds.
 */

/** A calendar date `YYYY-MM-DD`. */
export type DateString = string;
/** A time of day `HH:MM:SS`. */
export type TimeString = string;
/** A point in time `YYYY-MM-DDTHH:MM:SS.ffffffZ` in UTC. */
export type TimestampString = string;

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;
const timePattern = /^(\d{2}):(\d{2}):(\d{2})$/;
const timestampPattern = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})\.(\d{6})Z$/;

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** Number of days of a month (1-12). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Tells whether `value` is a valid date `YYYY-MM-DD`. */
export function isDate(value: string): boolean {
  const m = datePattern.exec(value);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return y >= 1 && mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}

/** Tells whether `value` is a valid time `HH:MM:SS`. */
export function isTime(value: string): boolean {
  const m = timePattern.exec(value);
  return !!m && Number(m[1]) < 24 && Number(m[2]) < 60 && Number(m[3]) < 60;
}

/** Tells whether `value` is a valid timestamp `YYYY-MM-DDTHH:MM:SS.ffffffZ`. */
export function isTimestamp(value: string): boolean {
  const m = timestampPattern.exec(value);
  return !!m && isDate(m[1]!) && isTime(m[2]!);
}

/** Year, month (1-12) and day of a date. */
export function dateParts(value: DateString): { year: number; month: number; day: number } {
  const m = datePattern.exec(value);
  if (!m || !isDate(value)) throw new RangeError(`not a date: ${JSON.stringify(value)}`);
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

/** Builds a date from its parts; returns `null` if the day does not exist. */
export function makeDate(year: number, month: number, day: number): DateString | null {
  const value = `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
  return isDate(value) ? value : null;
}

function toUtcMillis(value: DateString): number {
  const { year, month, day } = dateParts(value);
  const d = new Date(0);
  d.setUTCFullYear(year, month - 1, day);
  return d.getTime();
}

function fromUtcMillis(ms: number): DateString {
  const d = new Date(ms);
  return `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** The date `days` days after `value` (negative for before). */
export function addDays(value: DateString, days: number): DateString {
  return fromUtcMillis(toUtcMillis(value) + days * 86_400_000);
}

/** The same day `months` months later, clamped to the end of the month. */
export function addMonths(value: DateString, months: number): DateString {
  const { year, month, day } = dateParts(value);
  const index = year * 12 + (month - 1) + months;
  const y = Math.floor(index / 12);
  const m = (index % 12) + 1;
  return makeDate(y, m, Math.min(day, daysInMonth(y, m)))!;
}

/** Day of the week: 1 Monday … 7 Sunday. */
export function weekday(value: DateString): number {
  const d = new Date(toUtcMillis(value)).getUTCDay();
  return d === 0 ? 7 : d;
}

/** Compares two dates, times or timestamps of the same kind. */
export function compareCanonical(a: string, b: string): -1 | 0 | 1 {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Offset of `timeZone` from UTC in minutes at the instant `ms`. */
export function timeZoneOffset(timeZone: string, ms: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    era: 'short',
  }).formatToParts(new Date(ms));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  let year = get('year');
  if (parts.find((p) => p.type === 'era')?.value === 'BC') year = 1 - year;
  const local = new Date(0);
  local.setUTCFullYear(year, get('month') - 1, get('day'));
  local.setUTCHours(get('hour'), get('minute'), get('second'), 0);
  return Math.round((local.getTime() - (ms - (((ms % 1000) + 1000) % 1000))) / 60_000);
}

/** Date and time of a timestamp as seen in `timeZone`; microseconds are kept. */
export function toZoned(
  value: TimestampString,
  timeZone: string,
): { date: DateString; time: TimeString; micros: string } {
  const m = timestampPattern.exec(value);
  if (!m || !isTimestamp(value)) throw new RangeError(`not a timestamp: ${JSON.stringify(value)}`);
  const ms = toUtcMillis(m[1]!) + timeToSeconds(m[2]!) * 1000;
  const shifted = ms + timeZoneOffset(timeZone, ms) * 60_000;
  const d = new Date(shifted);
  return {
    date: fromUtcMillis(shifted),
    time: `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`,
    micros: m[3]!,
  };
}

/**
 * The timestamp of a local date and time in `timeZone`. For a local time that
 * occurs twice when clocks go back, the earlier instant is taken; a local
 * time skipped when clocks go forward is moved forward by the gap.
 */
export function fromZoned(
  date: DateString,
  time: TimeString,
  timeZone: string,
  micros = '000000',
): TimestampString {
  if (!isDate(date) || !isTime(time) || !/^\d{6}$/.test(micros)) {
    throw new RangeError('invalid local date, time or microseconds');
  }
  const local = toUtcMillis(date) + timeToSeconds(time) * 1000;
  // The offsets a day before and after cover at most one transition.
  const offsets = new Set([
    timeZoneOffset(timeZone, local - 86_400_000),
    timeZoneOffset(timeZone, local),
    timeZoneOffset(timeZone, local + 86_400_000),
  ]);
  const valid = [...offsets]
    .map((o) => local - o * 60_000)
    .filter((t) => timeZoneOffset(timeZone, t) * 60_000 === local - t);
  const ms = valid.length > 0 ? Math.min(...valid) : local - Math.min(...offsets) * 60_000;
  const d = new Date(ms);
  return `${fromUtcMillis(ms)}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${micros}Z`;
}

function timeToSeconds(value: TimeString): number {
  const [h, m, s] = value.split(':').map(Number);
  return h! * 3600 + m! * 60 + s!;
}

/** Today in `timeZone`. */
export function today(timeZone: string, now = Date.now()): DateString {
  return fromUtcMillis(now + timeZoneOffset(timeZone, now) * 60_000);
}

/** The current instant as timestamp. Milliseconds are the finest resolution of the clock. */
export function nowTimestamp(now = Date.now()): TimestampString {
  const d = new Date(now);
  return `${fromUtcMillis(now)}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.${pad(d.getUTCMilliseconds(), 3)}000Z`;
}

/** Converts a timestamp to a `Date`; microseconds below milliseconds are dropped. */
export function timestampToDate(value: TimestampString): Date {
  const m = timestampPattern.exec(value);
  if (!m || !isTimestamp(value)) throw new RangeError(`not a timestamp: ${JSON.stringify(value)}`);
  return new Date(toUtcMillis(m[1]!) + timeToSeconds(m[2]!) * 1000 + Number(m[3]!.slice(0, 3)));
}

/** A date as a `Date` at midnight UTC, for formatting with `timeZone: 'UTC'`. */
export function dateToUtcDate(value: DateString): Date {
  return new Date(toUtcMillis(value));
}
