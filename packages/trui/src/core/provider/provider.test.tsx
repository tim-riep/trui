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

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { defineIcon } from '../icons/define-icon';
import { useDensity, useIcon, useLocale, useText, useTheme } from './hooks';
import { IconProvider } from './icon-provider';
import { Portal } from './portal';
import { TruiProvider } from './trui-provider';

function Probe() {
  const { theme, setting } = useTheme();
  const density = useDensity();
  const { locale, dir } = useLocale();
  const t = useText();
  const icon = useIcon('custom');
  return (
    <output>
      {[
        setting,
        theme,
        density,
        locale,
        dir,
        t('common.cancel'),
        t('list.itemCount', { count: 2 }),
        icon?.name ?? '-',
      ].join('|')}
    </output>
  );
}

const text = () => screen.getByRole('status').textContent;

describe('TruiProvider', () => {
  it('provides defaults outside of any provider', () => {
    render(<Probe />);
    expect(text()).toBe('light|light|compact|en|ltr|Cancel|2 items|-');
  });

  it('sets the attributes of its root element', () => {
    const { container } = render(
      <TruiProvider theme="dark" density="comfortable" locale="de">
        <Probe />
      </TruiProvider>,
    );
    const root = container.querySelector('.trui-root')!;
    expect(root.getAttribute('data-trui-theme')).toBe('dark');
    expect(root.getAttribute('data-trui-density')).toBe('comfortable');
    expect(root.getAttribute('lang')).toBe('de');
    expect(root.getAttribute('dir')).toBe('ltr');
    expect(text()).toBe('dark|dark|comfortable|de|ltr|Abbrechen|2 Einträge|-');
  });

  it('follows the system theme with auto', () => {
    render(
      <TruiProvider>
        <Probe />
      </TruiProvider>,
    );
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    expect(text()?.startsWith(`auto|${system}|`)).toBe(true);
  });

  it('lets nested providers change only what they set', () => {
    const custom = defineIcon('custom', ['M0 0h1']);
    render(
      <TruiProvider
        theme="dark"
        locale="de"
        texts={{ 'common.cancel': 'Verwerfen' }}
        icons={[custom]}
      >
        <TruiProvider density="comfortable">
          <Probe />
        </TruiProvider>
      </TruiProvider>,
    );
    expect(text()).toBe('dark|dark|comfortable|de|ltr|Verwerfen|2 Einträge|custom');
  });

  it('derives the writing direction from the locale', () => {
    render(
      <TruiProvider locale="ar">
        <Probe />
      </TruiProvider>,
    );
    expect(text()?.split('|')[4]).toBe('rtl');
  });

  it('takes partial text packages for other languages, falling back to English', () => {
    render(
      <TruiProvider locale="fr-CH" textPackages={{ fr: { 'common.cancel': 'Annuler' } }}>
        <Probe />
      </TruiProvider>,
    );
    expect(text()).toContain('|Annuler|2 items|');
  });

  it('registers icons with IconProvider', () => {
    render(
      <IconProvider icons={[defineIcon('custom', [])]}>
        <Probe />
      </IconProvider>,
    );
    expect(text()?.endsWith('|custom')).toBe(true);
  });

  it('renders portals into the overlay container of the provider', async () => {
    const { container } = render(
      <TruiProvider theme="dark">
        <Portal>
          <span>overlay</span>
        </Portal>
      </TruiProvider>,
    );
    const overlay = await screen.findByText('overlay');
    expect(overlay.parentElement?.className).toBe('trui-overlay-container');
    expect(overlay.closest('[data-trui-theme]')).toBe(container.querySelector('.trui-root'));
  });
});
