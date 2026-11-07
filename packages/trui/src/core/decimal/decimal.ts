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
 * Exact decimal numbers as strings.
 *
 * A canonical decimal has an optional minus sign, an integer part without
 * leading zeros and an optional fraction: `"0"`, `"-12.5"`, `"1234.50"`.
 * Trailing zeros of the fraction are significant, they carry the scale.
 * `"-0"` is not canonical. Values never pass through JavaScript numbers.
 */

/** A decimal in canonical form, such as `"1234.50"`. */
export type DecimalString = string;

const canonicalPattern = /^-?(0|[1-9]\d*)(\.\d+)?$/;

interface Parts {
  negative: boolean;
  integer: string;
  fraction: string;
}

function split(value: DecimalString): Parts {
  const negative = value.startsWith('-');
  const body = negative ? value.slice(1) : value;
  const dot = body.indexOf('.');
  return dot < 0
    ? { negative, integer: body, fraction: '' }
    : { negative, integer: body.slice(0, dot), fraction: body.slice(dot + 1) };
}

function join({ negative, integer, fraction }: Parts): DecimalString {
  const int = integer.replace(/^0+(?=\d)/, '') || '0';
  const zero = /^0*$/.test(int) && /^0*$/.test(fraction);
  const body = fraction ? `${int}.${fraction}` : int;
  return negative && !zero ? `-${body}` : body;
}

function requireDecimal(value: string): void {
  if (!isDecimal(value)) throw new RangeError(`not a canonical decimal: ${JSON.stringify(value)}`);
}

/** Tells whether `value` is a decimal in canonical form. */
export function isDecimal(value: string): boolean {
  if (!canonicalPattern.test(value)) return false;
  return !(value.startsWith('-') && /^-0(\.0+)?$/.test(value));
}

/** Number of digits before and after the decimal point. */
export function decimalDigits(value: DecimalString): { integer: number; fraction: number } {
  requireDecimal(value);
  const p = split(value);
  return { integer: p.integer === '0' ? 0 : p.integer.length, fraction: p.fraction.length };
}

function toBigInt(value: DecimalString, scale: number): bigint {
  const p = split(value);
  const n = BigInt(p.integer + p.fraction.padEnd(scale, '0'));
  return p.negative ? -n : n;
}

function fromBigInt(n: bigint, scale: number): DecimalString {
  const negative = n < 0n;
  const digits = (negative ? -n : n).toString().padStart(scale + 1, '0');
  const integer = digits.slice(0, digits.length - scale);
  const fraction = scale > 0 ? digits.slice(digits.length - scale) : '';
  return join({ negative, integer, fraction });
}

/**
 * Brings `value` to exactly `scale` fraction digits. Missing digits are
 * padded with zeros; surplus digits are rounded half away from zero.
 */
export function toScale(value: DecimalString, scale: number): DecimalString {
  requireDecimal(value);
  if (!Number.isInteger(scale) || scale < 0) throw new RangeError(`invalid scale ${scale}`);
  const p = split(value);
  if (p.fraction.length <= scale) return join({ ...p, fraction: p.fraction.padEnd(scale, '0') });
  const kept = BigInt(p.integer + p.fraction.slice(0, scale));
  const roundUp = p.fraction.charCodeAt(scale) >= 0x35; // '5'
  const magnitude = roundUp ? kept + 1n : kept;
  return fromBigInt(p.negative ? -magnitude : magnitude, scale);
}

/** Compares two decimals numerically: -1, 0 or 1. `"1.0"` equals `"1.00"`. */
export function compareDecimal(a: DecimalString, b: DecimalString): -1 | 0 | 1 {
  requireDecimal(a);
  requireDecimal(b);
  const scale = Math.max(split(a).fraction.length, split(b).fraction.length);
  const x = toBigInt(a, scale);
  const y = toBigInt(b, scale);
  return x < y ? -1 : x > y ? 1 : 0;
}

/** Sum of two decimals with the larger scale of both. */
export function addDecimal(a: DecimalString, b: DecimalString): DecimalString {
  requireDecimal(a);
  requireDecimal(b);
  const scale = Math.max(split(a).fraction.length, split(b).fraction.length);
  return fromBigInt(toBigInt(a, scale) + toBigInt(b, scale), scale);
}

/** Difference `a - b` with the larger scale of both. */
export function subtractDecimal(a: DecimalString, b: DecimalString): DecimalString {
  return addDecimal(a, negateDecimal(b));
}

/** The decimal with the opposite sign. */
export function negateDecimal(value: DecimalString): DecimalString {
  requireDecimal(value);
  const p = split(value);
  return join({ ...p, negative: !p.negative });
}

/** Sign of a decimal: -1, 0 or 1. */
export function signDecimal(value: DecimalString): -1 | 0 | 1 {
  return compareDecimal(value, '0');
}

/**
 * Moves the decimal point: `shiftDecimal("1234.5", -3)` is `"1.2345"`,
 * `shiftDecimal("1.5", 2)` is `"150"`. Exact, used for scaling to thousands
 * and millions.
 */
export function shiftDecimal(value: DecimalString, places: number): DecimalString {
  requireDecimal(value);
  const p = split(value);
  const digits = p.integer + p.fraction;
  const point = p.integer.length + places;
  if (point <= 0)
    return join({ negative: p.negative, integer: '0', fraction: '0'.repeat(-point) + digits });
  if (point >= digits.length)
    return join({ negative: p.negative, integer: digits.padEnd(point, '0'), fraction: '' });
  return join({
    negative: p.negative,
    integer: digits.slice(0, point),
    fraction: digits.slice(point),
  });
}

/** Removes trailing zeros of the fraction: `"1.500"` becomes `"1.5"`. */
export function trimDecimal(value: DecimalString): DecimalString {
  requireDecimal(value);
  const p = split(value);
  return join({ ...p, fraction: p.fraction.replace(/0+$/, '') });
}
