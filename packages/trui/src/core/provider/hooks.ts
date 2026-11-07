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

import { useCallback, useContext, useMemo } from 'react';
import type { DateString, TimeString, TimestampString } from '../date/date';
import { formatDate, formatTime, formatTimestamp } from '../date/localized';
import { type DecimalFormatOptions, formatDecimal } from '../decimal/localized';
import { formatText, type TextParams } from '../i18n/format-text';
import type { IconDefinition } from '../icons/define-icon';
import type { TextKey } from '../texts/en';
import {
  type Density,
  DensityContext,
  IconContext,
  LocaleContext,
  type LocaleState,
  OverlayContext,
  TextContext,
  ThemeContext,
  type ThemeState,
} from './contexts';

/** The theme setting and the theme in effect. */
export function useTheme(): ThemeState {
  return useContext(ThemeContext);
}

/** The density in effect. */
export function useDensity(): Density {
  return useContext(DensityContext);
}

/** Locale, writing direction and time zone. */
export function useLocale(): LocaleState {
  return useContext(LocaleContext);
}

/** A function returning texts of the library in the current language. */
export type TextFunction = (key: TextKey, params?: TextParams) => string;

/** Texts of the library in the current language. */
export function useText(): TextFunction {
  const { texts, locale } = useContext(TextContext);
  return useCallback((key, params) => formatText(texts[key], locale, params), [texts, locale]);
}

/** Formatting of values for the current locale and time zone. */
export interface Formatters {
  decimal(value: string, options?: DecimalFormatOptions): string;
  date(value: DateString, style?: 'short' | 'medium' | 'long' | 'full'): string;
  time(value: TimeString, seconds?: boolean): string;
  timestamp(
    value: TimestampString,
    options?: { dateStyle?: 'short' | 'medium' | 'long'; seconds?: boolean },
  ): string;
}

/** Formats decimals, dates, times and timestamps for the current locale. */
export function useFormat(): Formatters {
  const { locale, timeZone } = useContext(LocaleContext);
  return useMemo(
    () => ({
      decimal: (value, options) => formatDecimal(value, locale, options),
      date: (value, style) => formatDate(value, locale, style),
      time: (value, seconds) => formatTime(value, locale, seconds),
      timestamp: (value, options) => formatTimestamp(value, locale, timeZone, options),
    }),
    [locale, timeZone],
  );
}

/** The icon registered under `name`, if any. */
export function useIcon(name: string): IconDefinition | undefined {
  return useContext(IconContext).get(name);
}

/** The element that overlays render into, or null outside of a provider. */
export function useOverlayContainer(): HTMLElement | null {
  return useContext(OverlayContext).container;
}
