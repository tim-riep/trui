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

import type { Decorator, Preview } from '@storybook/react-vite';
import { type Density, type ThemeSetting, TruiProvider } from '@tim-riep/trui/core';
import '../packages/trui/src/styles.css';
import './catalog.css';

const withProvider: Decorator = (Story, context) => {
  const { theme, density, locale } = context.globals as {
    theme: ThemeSetting;
    density: Density;
    locale: string;
  };
  return (
    <TruiProvider theme={theme} density={density} locale={locale} className="catalog-canvas">
      <Story />
    </TruiProvider>
  );
};

const preview: Preview = {
  decorators: [withProvider],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'auto', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density',
      toolbar: {
        title: 'Density',
        icon: 'component',
        items: [
          { value: 'compact', title: 'Compact' },
          { value: 'comfortable', title: 'Comfortable' },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Language',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'de', title: 'German' },
          { value: 'ar', title: 'Arabic (right to left)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', density: 'compact', locale: 'en' },
  parameters: {
    a11y: { test: 'error' },
    controls: { expanded: true, sort: 'requiredFirst' },
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default preview;
