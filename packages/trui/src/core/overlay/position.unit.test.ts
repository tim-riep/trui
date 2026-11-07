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
import { directionOf } from '../i18n/direction';
import { formatText } from '../i18n/format-text';
import { de } from '../texts/de';
import { en } from '../texts/en';
import { computePosition } from './position';

const viewport = { x: 0, y: 0, width: 1000, height: 800 };
const anchor = { x: 100, y: 100, width: 200, height: 30 };

describe('computePosition', () => {
  it('places below and aligned to the start', () => {
    const p = computePosition(anchor, { width: 300, height: 200 }, viewport, {
      placement: 'bottom-start',
      dir: 'ltr',
    });
    expect(p).toMatchObject({ x: 100, y: 134, placement: 'bottom-start' });
  });

  it('aligns start to the right edge in right-to-left', () => {
    const p = computePosition(anchor, { width: 300, height: 200 }, viewport, {
      placement: 'bottom-start',
      dir: 'rtl',
    });
    expect(p.x).toBe(8); // 300 - 300 = 0, shifted inside the padding
  });

  it('flips when there is no room', () => {
    const low = { ...anchor, y: 700 };
    const p = computePosition(low, { width: 300, height: 200 }, viewport, {
      placement: 'bottom-start',
      dir: 'ltr',
    });
    expect(p.placement).toBe('top-start');
    expect(p.y).toBe(700 - 4 - 200);
  });

  it('maps start and end sides to the writing direction', () => {
    const ltr = computePosition(anchor, { width: 50, height: 20 }, viewport, {
      placement: 'end',
      dir: 'ltr',
    });
    const rtl = computePosition({ ...anchor, x: 500 }, { width: 50, height: 20 }, viewport, {
      placement: 'end',
      dir: 'rtl',
    });
    expect(ltr.x).toBe(304);
    expect(rtl.x).toBe(500 - 4 - 50);
  });
});

describe('texts', () => {
  it('have the same keys in every package', () => {
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
  });

  it('replace placeholders and select plural forms', () => {
    expect(formatText(en['list.itemCount'], 'en', { count: 1 })).toBe('1 item');
    expect(formatText(en['list.itemCount'], 'en', { count: 1200 })).toBe('1,200 items');
    expect(formatText(de['list.itemCount'], 'de', { count: 1200 })).toBe('1.200 Einträge');
    expect(formatText(en['input.tooManyFractionDigits'], 'en', { digits: 2 })).toBe(
      'Enter at most 2 digits after the decimal separator',
    );
  });

  it('know the writing direction', () => {
    expect(directionOf('de')).toBe('ltr');
    expect(directionOf('ar')).toBe('rtl');
    expect(directionOf('he-IL')).toBe('rtl');
  });
});
