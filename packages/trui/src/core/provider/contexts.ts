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

import { createContext } from 'react';
import type { Direction } from '../i18n/direction';
import type { IconDefinition } from '../icons/define-icon';
import { en, type TextPackage } from '../texts/en';

/** Theme setting: a fixed theme or the one of the operating system. */
export type ThemeSetting = 'light' | 'dark' | 'auto';
/** The theme in effect. */
export type Theme = 'light' | 'dark';
/** Spacing and sizes: compact for desktop, comfortable for touch. */
export type Density = 'compact' | 'comfortable';

export interface ThemeState {
  setting: ThemeSetting;
  theme: Theme;
}

export interface LocaleState {
  /** BCP 47 language tag used for `Intl` and the text package. */
  locale: string;
  dir: Direction;
  /** IANA time zone for showing timestamps. */
  timeZone: string;
}

export interface TextState {
  locale: string;
  /** The resolved texts for the locale. */
  texts: TextPackage;
  /** Text packages added by providers, inherited by nested ones. */
  packages: Readonly<Record<string, Partial<TextPackage>>>;
  /** Single texts overridden by providers, inherited by nested ones. */
  overrides: Partial<TextPackage>;
}

export interface OverlayState {
  /** Element that portals of overlays render into; null before mount. */
  container: HTMLElement | null;
}

// Defaults apply to components rendered outside of any provider.
export const ThemeContext = createContext<ThemeState>({ setting: 'light', theme: 'light' });
ThemeContext.displayName = 'TruiThemeContext';

export const DensityContext = createContext<Density>('compact');
DensityContext.displayName = 'TruiDensityContext';

export const LocaleContext = createContext<LocaleState>({
  locale: 'en',
  dir: 'ltr',
  timeZone: 'UTC',
});
LocaleContext.displayName = 'TruiLocaleContext';

export const TextContext = createContext<TextState>({
  locale: 'en',
  texts: en,
  packages: {},
  overrides: {},
});
TextContext.displayName = 'TruiTextContext';

export const IconContext = createContext<ReadonlyMap<string, IconDefinition>>(new Map());
IconContext.displayName = 'TruiIconContext';

export const OverlayContext = createContext<OverlayState>({ container: null });
OverlayContext.displayName = 'TruiOverlayContext';

/** Tells whether a provider is above; outside of one, settings get the defaults. */
export const ProviderPresentContext = createContext(false);
ProviderPresentContext.displayName = 'TruiProviderPresentContext';
