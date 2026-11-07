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
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';
import { FeedbackProvider } from '../feedback/feedback';
import { type Direction, directionOf } from '../i18n/direction';
import type { IconDefinition } from '../icons/define-icon';
import { de } from '../texts/de';
import { en, type TextPackage } from '../texts/en';
import {
  type Density,
  DensityContext,
  IconContext,
  LocaleContext,
  type LocaleState,
  OverlayContext,
  ProviderPresentContext,
  TextContext,
  type TextState,
  type Theme,
  ThemeContext,
  type ThemeSetting,
  type ThemeState,
} from './contexts';

/** Text packages of the library by language. */
export const builtInTextPackages: Readonly<Record<string, TextPackage>> = { en, de };

/** Props of {@link TruiProvider}. */
export interface TruiProviderProps {
  /** Theme; `auto` follows the operating system. Inherited from an outer provider, otherwise `auto`. */
  theme?: ThemeSetting;
  /** Density. Inherited, otherwise `compact`. */
  density?: Density;
  /** BCP 47 language tag. Inherited, otherwise `en`. */
  locale?: string;
  /** Writing direction. Derived from the locale unless given. */
  dir?: Direction;
  /** IANA time zone for timestamps. Inherited, otherwise the time zone of the browser. */
  timeZone?: string;
  /**
   * Text packages by language, added to the built-in English and German
   * ones. A package may be partial; missing texts come from the built-in
   * package of the language, then from English.
   */
  textPackages?: Readonly<Record<string, Partial<TextPackage>>>;
  /** Overrides single texts in every language. */
  texts?: Partial<TextPackage>;
  /** Icons to register by name, in addition to those of an outer provider. */
  icons?: readonly IconDefinition[];
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
  children?: ReactNode;
}

const darkQuery = '(prefers-color-scheme: dark)';

function subscribeColorScheme(onChange: () => void): () => void {
  const media = window.matchMedia(darkQuery);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function systemTheme(): Theme {
  return window.matchMedia(darkQuery).matches ? 'dark' : 'light';
}

/** The theme of the operating system, updated when it changes. */
export function useSystemTheme(): Theme {
  return useSyncExternalStore(subscribeColorScheme, systemTheme, () => 'light');
}

function resolveTexts(
  locale: string,
  packages: Readonly<Record<string, Partial<TextPackage>>> | undefined,
  overrides: Partial<TextPackage> | undefined,
): TextPackage {
  const language = new Intl.Locale(locale).language;
  const pick = (key: string) => packages?.[key];
  return {
    ...en,
    ...builtInTextPackages[language],
    ...pick(language),
    ...builtInTextPackages[locale],
    ...pick(locale),
    ...overrides,
  };
}

/**
 * Provides theme, density, locale, texts and icons to the components below
 * it and renders their root element. Every setting that is left out is
 * inherited from an outer provider, so a nested provider changes only what
 * it sets, and code loaded at runtime (e.g. through module federation)
 * takes over the settings of the application around it.
 *
 * Overlays such as dialogs and popovers render into a container inside the
 * root element, so that tokens and writing direction apply to them too.
 */
export function TruiProvider(props: TruiProviderProps) {
  const outerTheme = useContext(ThemeContext);
  const outerDensity = useContext(DensityContext);
  const outerLocale = useContext(LocaleContext);
  const outerText = useContext(TextContext);
  const outerIcons = useContext(IconContext);
  const isNested = useContext(ProviderPresentContext);

  const system = useSystemTheme();
  const setting: ThemeSetting = props.theme ?? (isNested ? outerTheme.setting : 'auto');
  const theme: Theme = setting === 'auto' ? system : setting;
  const density: Density = props.density ?? (isNested ? outerDensity : 'compact');
  const locale = props.locale ?? (isNested ? outerLocale.locale : 'en');
  const dir = props.dir ?? (props.locale || !isNested ? directionOf(locale) : outerLocale.dir);
  const timeZone =
    props.timeZone ??
    (isNested ? outerLocale.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone);

  const themeState = useMemo<ThemeState>(() => ({ setting, theme }), [setting, theme]);
  const localeState = useMemo<LocaleState>(
    () => ({ locale, dir, timeZone }),
    [locale, dir, timeZone],
  );
  const packages = useMemo(
    () =>
      props.textPackages ? { ...outerText.packages, ...props.textPackages } : outerText.packages,
    [outerText.packages, props.textPackages],
  );
  const overrides = useMemo(
    () => (props.texts ? { ...outerText.overrides, ...props.texts } : outerText.overrides),
    [outerText.overrides, props.texts],
  );
  const textState = useMemo<TextState>(
    () => ({ locale, packages, overrides, texts: resolveTexts(locale, packages, overrides) }),
    [locale, packages, overrides],
  );
  const icons = useMemo(() => {
    if (!props.icons || props.icons.length === 0) return outerIcons;
    const map = new Map(outerIcons);
    for (const icon of props.icons) map.set(icon.name, icon);
    return map;
  }, [outerIcons, props.icons]);

  const [container, setContainer] = useState<HTMLElement | null>(null);
  const overlayState = useMemo(() => ({ container }), [container]);
  const containerRef = useCallback((el: HTMLDivElement | null) => setContainer(el), []);

  return (
    <ProviderPresentContext.Provider value={true}>
      <ThemeContext.Provider value={themeState}>
        <DensityContext.Provider value={density}>
          <LocaleContext.Provider value={localeState}>
            <TextContext.Provider value={textState}>
              <IconContext.Provider value={icons}>
                <OverlayContext.Provider value={overlayState}>
                  <div
                    ref={props.ref}
                    className={props.className ? `trui-root ${props.className}` : 'trui-root'}
                    style={props.style}
                    data-trui-theme={theme}
                    data-trui-density={density}
                    lang={locale}
                    dir={dir}
                  >
                    {isNested ? (
                      props.children
                    ) : (
                      <FeedbackProvider>{props.children}</FeedbackProvider>
                    )}
                    <div ref={containerRef} className="trui-overlay-container" />
                  </div>
                </OverlayContext.Provider>
              </IconContext.Provider>
            </TextContext.Provider>
          </LocaleContext.Provider>
        </DensityContext.Provider>
      </ThemeContext.Provider>
    </ProviderPresentContext.Provider>
  );
}
