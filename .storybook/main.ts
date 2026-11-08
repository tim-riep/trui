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

import type { StorybookConfig } from '@storybook/react-vite';
import { sourceAliases } from '../aliases.ts';

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    '../catalog/**/*.mdx',
    '../catalog/**/*.stories.tsx',
    '../packages/trui/src/**/*.mdx',
    '../packages/trui/src/**/*.stories.tsx',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => !prop.parent || !/node_modules/.test(prop.parent.fileName),
    },
  },
  core: { disableTelemetry: true },
  viteFinal: (vite) => {
    vite.resolve ??= {};
    vite.resolve.alias = [
      ...sourceAliases,
      ...(Array.isArray(vite.resolve.alias) ? vite.resolve.alias : []),
    ];
    return vite;
  },
};

export default config;
