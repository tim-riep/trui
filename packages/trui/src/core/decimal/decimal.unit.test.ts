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
  addDecimal,
  compareDecimal,
  isDecimal,
  shiftDecimal,
  subtractDecimal,
  toScale,
  trimDecimal,
} from './decimal';
import {
  checkLimits,
  formatDecimal,
  formatDecimalForInput,
  parseLocalizedDecimal,
} from './localized';

describe('canonical decimals', () => {
  it('accepts canonical forms only', () => {
    for (const v of ['0', '1', '-1', '1234.50', '0.001', '-0.5', '12345678901234567890.12']) {
      expect(isDecimal(v), v).toBe(true);
    }
    for (const v of ['', '-0', '-0.00', '01', '1.', '.5', '+1', '1e3', '1,5', ' 1', 'NaN']) {
      expect(isDecimal(v), v).toBe(false);
    }
  });

  it('pads and rounds half away from zero', () => {
    expect(toScale('1234.5', 2)).toBe('1234.50');
    expect(toScale('1.005', 2)).toBe('1.01');
    expect(toScale('-1.005', 2)).toBe('-1.01');
    expect(toScale('1.004', 2)).toBe('1.00');
    expect(toScale('-0.004', 2)).toBe('0.00');
    expect(toScale('9.995', 2)).toBe('10.00');
    expect(toScale('2.5', 0)).toBe('3');
  });

  it('is exact beyond the range of JavaScript numbers', () => {
    expect(addDecimal('9007199254740993.10', '0.01')).toBe('9007199254740993.11');
    expect(addDecimal('0.1', '0.2')).toBe('0.3');
    expect(subtractDecimal('1.00', '1')).toBe('0.00');
    expect(compareDecimal('1.0', '1.00')).toBe(0);
    expect(compareDecimal('-2', '1.5')).toBe(-1);
  });

  it('shifts the decimal point', () => {
    expect(shiftDecimal('1234.5', -3)).toBe('1.2345');
    expect(shiftDecimal('1.5', 2)).toBe('150');
    expect(shiftDecimal('12', -4)).toBe('0.0012');
    expect(shiftDecimal('-0.5', 1)).toBe('-5');
    expect(trimDecimal('1.500')).toBe('1.5');
    expect(trimDecimal('2.000')).toBe('2');
  });
});

describe('localized input', () => {
  it('reads German and English input to the same canonical value', () => {
    expect(parseLocalizedDecimal('1.234,5', 'de', { scale: 2 })).toEqual({
      ok: true,
      value: '1234.50',
    });
    expect(parseLocalizedDecimal('1,234.5', 'en', { scale: 2 })).toEqual({
      ok: true,
      value: '1234.50',
    });
    expect(parseLocalizedDecimal('1234,5', 'de')).toEqual({ ok: true, value: '1234.5' });
    expect(parseLocalizedDecimal('-0,50', 'de')).toEqual({ ok: true, value: '-0.50' });
    expect(parseLocalizedDecimal('-0', 'de')).toEqual({ ok: true, value: '0' });
    expect(parseLocalizedDecimal(',5', 'de')).toEqual({ ok: true, value: '0.5' });
    expect(parseLocalizedDecimal('5-', 'de')).toEqual({ ok: true, value: '-5' });
  });

  it('rejects ambiguous and invalid input instead of guessing', () => {
    expect(parseLocalizedDecimal('1.5', 'de')).toEqual({ ok: false, error: 'invalid' });
    expect(parseLocalizedDecimal('1,5', 'en')).toEqual({ ok: false, error: 'invalid' });
    expect(parseLocalizedDecimal('12.34.5', 'de')).toEqual({ ok: false, error: 'invalid' });
    expect(parseLocalizedDecimal('abc', 'en')).toEqual({ ok: false, error: 'invalid' });
    expect(parseLocalizedDecimal('', 'en')).toEqual({ ok: false, error: 'invalid' });
  });

  it('reports surplus digits instead of rounding', () => {
    expect(parseLocalizedDecimal('1,234', 'de', { scale: 2 })).toEqual({
      ok: false,
      error: 'tooManyFractionDigits',
    });
    expect(parseLocalizedDecimal('123456', 'en', { integerDigits: 5 })).toEqual({
      ok: false,
      error: 'tooManyIntegerDigits',
    });
    expect(checkLimits('0.5', { integerDigits: 0, scale: 1 })).toEqual({ ok: true, value: '0.5' });
  });

  it('accepts spaces as group separator and locale digits', () => {
    expect(parseLocalizedDecimal('1 234,5', 'fr')).toEqual({ ok: true, value: '1234.5' });
    expect(parseLocalizedDecimal('1 234,5', 'fr')).toEqual({ ok: true, value: '1234.5' });
    expect(parseLocalizedDecimal('١٢٫٥', 'ar-EG')).toEqual({ ok: true, value: '12.5' });
  });

  it('reads values beyond the range of JavaScript numbers', () => {
    expect(parseLocalizedDecimal('9.007.199.254.740.993,01', 'de')).toEqual({
      ok: true,
      value: '9007199254740993.01',
    });
  });
});

describe('formatting', () => {
  it('formats exactly for the locale', () => {
    expect(formatDecimal('1234.50', 'de')).toBe('1.234,50');
    expect(formatDecimal('1234.50', 'en')).toBe('1,234.50');
    expect(formatDecimal('9007199254740993.01', 'en')).toBe('9,007,199,254,740,993.01');
    expect(formatDecimal('1234.5', 'de', { scale: 2, currency: 'EUR' })).toBe('1.234,50 €');
    expect(formatDecimalForInput('-1234.5', 'de')).toBe('-1234,5');
  });
});
