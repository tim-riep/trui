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

import { type DecimalString, decimalDigits, isDecimal, toScale } from './decimal';

/** Separators and digits of a locale for numbers. */
export interface NumberSymbols {
  decimal: string;
  group: string;
  minus: string;
  /** The ten digits of the default numbering system of the locale. */
  digits: string[];
}

/** Separators and digits that `Intl` uses for `locale`. */
export function numberSymbols(locale: string): NumberSymbols {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const find = (type: string, fallback: string) =>
    parts.find((p) => p.type === type)?.value ?? fallback;
  const plain = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = Array.from({ length: 10 }, (_, i) => plain.format(i));
  return {
    decimal: find('decimal', '.'),
    group: find('group', ','),
    minus: find('minusSign', '-'),
    digits,
  };
}

/** Limits for parsing and formatting a decimal. */
export interface DecimalOptions {
  /** Fraction digits; the value is padded to it, more digits are an error. */
  scale?: number;
  /** Maximum number of integer digits. */
  integerDigits?: number;
}

/** Why a localized input is not a valid decimal. */
export type DecimalParseError = 'invalid' | 'tooManyIntegerDigits' | 'tooManyFractionDigits';

export type DecimalParseResult =
  | { ok: true; value: DecimalString }
  | { ok: false; error: DecimalParseError };

const spaces = /[\s   ]/g;
const minusSigns = new Set(['-', '−', '‒', '–']);

/**
 * Reads a number as a user types it in `locale`: `"1.234,5"` in German and
 * `"1,234.5"` in English both give `"1234.5"` (or `"1234.50"` with scale 2).
 * Group separators must separate groups of three digits, so an ambiguous
 * input like `"1.5"` in German is rejected rather than read as 15. Surplus
 * fraction digits are an error, never rounded silently. Digits of the
 * locale's numbering system and ASCII digits are both accepted. Empty input
 * is `invalid`; callers decide what an empty field means.
 */
export function parseLocalizedDecimal(
  input: string,
  locale: string,
  options: DecimalOptions = {},
): DecimalParseResult {
  const symbols = numberSymbols(locale);
  let text = input.trim();
  // Locale digits to ASCII.
  text = Array.from(text, (ch) => {
    const i = symbols.digits.indexOf(ch);
    return i >= 0 ? String(i) : ch;
  }).join('');
  // Strip bidi marks some locales emit around signs.
  text = text.replace(/[‎‏؜]/g, '');

  let negative = false;
  const first = text.charAt(0);
  const last = text.charAt(text.length - 1);
  if (minusSigns.has(first) || first === symbols.minus) {
    negative = true;
    text = text.slice(1);
  } else if (first === '+') {
    text = text.slice(1);
  } else if (minusSigns.has(last) || last === symbols.minus) {
    negative = true;
    text = text.slice(0, -1);
  }
  text = text.trim();

  const groupIsSpace = spaces.test(symbols.group);
  spaces.lastIndex = 0;
  if (groupIsSpace) text = text.replace(spaces, ' ');

  const decimalAt = text.lastIndexOf(symbols.decimal);
  const integerText = decimalAt >= 0 ? text.slice(0, decimalAt) : text;
  const fractionText = decimalAt >= 0 ? text.slice(decimalAt + 1) : '';
  const group = groupIsSpace ? ' ' : symbols.group;

  if (!/^\d*$/.test(fractionText)) return { ok: false, error: 'invalid' };
  let integer: string;
  if (integerText.includes(group)) {
    const groups = integerText.split(group);
    const [head, ...tail] = groups;
    if (!head || !/^\d{1,3}$/.test(head) || !tail.every((g) => /^\d{3}$/.test(g))) {
      return { ok: false, error: 'invalid' };
    }
    integer = groups.join('');
  } else {
    if (!/^\d*$/.test(integerText)) return { ok: false, error: 'invalid' };
    integer = integerText;
  }
  if (integer === '' && fractionText === '') return { ok: false, error: 'invalid' };

  const raw = `${negative ? '-' : ''}${integer.replace(/^0+(?=\d)/, '') || '0'}${fractionText ? `.${fractionText}` : ''}`;
  const value = raw.startsWith('-') && /^-0(\.0*)?$/.test(raw) ? raw.slice(1) : raw;
  if (!isDecimal(value)) return { ok: false, error: 'invalid' };
  return checkLimits(value, options);
}

/**
 * Checks a canonical decimal against the limits and brings it to the scale.
 * More fraction digits than the scale are an error, not rounded.
 */
export function checkLimits(
  value: DecimalString,
  options: DecimalOptions = {},
): DecimalParseResult {
  const digits = decimalDigits(value);
  if (options.integerDigits !== undefined && digits.integer > options.integerDigits) {
    return { ok: false, error: 'tooManyIntegerDigits' };
  }
  if (options.scale !== undefined) {
    if (digits.fraction > options.scale) return { ok: false, error: 'tooManyFractionDigits' };
    return { ok: true, value: toScale(value, options.scale) };
  }
  return { ok: true, value };
}

/** Options for displaying a decimal. */
export interface DecimalFormatOptions {
  /** Fraction digits shown; without it, exactly the digits of the value. */
  scale?: number;
  /** ISO 4217 currency code; formats as amount with the currency symbol. */
  currency?: string;
  /** How the currency is shown. */
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  /** Group separators; on by default. */
  grouping?: boolean;
  /** Shows a plus sign for positive values. */
  signDisplay?: 'auto' | 'always' | 'exceptZero';
}

/**
 * Formats a decimal for `locale` without passing through a JavaScript number:
 * `Intl.NumberFormat` reads the string exactly.
 */
export function formatDecimal(
  value: DecimalString,
  locale: string,
  options: DecimalFormatOptions = {},
): string {
  const shown = options.scale === undefined ? value : toScale(value, options.scale);
  const fraction = decimalDigits(shown).fraction;
  const format = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fraction,
    maximumFractionDigits: fraction,
    useGrouping: options.grouping ?? true,
    signDisplay: options.signDisplay ?? 'auto',
    ...(options.currency
      ? {
          style: 'currency',
          currency: options.currency,
          currencyDisplay: options.currencyDisplay ?? 'symbol',
        }
      : {}),
  });
  return format.format(shown as Intl.StringNumericLiteral);
}

/** Formats a decimal as the user edits it: no grouping, locale separators. */
export function formatDecimalForInput(value: DecimalString, locale: string): string {
  const symbols = numberSymbols(locale);
  return Array.from(value, (ch) => {
    if (ch === '-') return symbols.minus;
    if (ch === '.') return symbols.decimal;
    return symbols.digits[Number(ch)] ?? ch;
  }).join('');
}

/** The number of fraction digits `Intl` uses for a currency, e.g. 2 for EUR, 0 for JPY. */
export function currencyScale(currency: string, locale = 'en'): number {
  return (
    new Intl.NumberFormat(locale, { style: 'currency', currency }).resolvedOptions()
      .maximumFractionDigits ?? 2
  );
}
