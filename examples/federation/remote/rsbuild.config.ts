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

import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { shared } from '../shared.mjs';

const port = Number(process.env.TRUI_REMOTE_PORT ?? 3002);

export default defineConfig({
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: 'orders',
      exposes: { './OrdersPage': './src/OrdersPage.tsx' },
      shared,
    }),
  ],
  server: { port, headers: { 'Access-Control-Allow-Origin': '*' } },
  output: { assetPrefix: process.env.TRUI_REMOTE_URL ? `${process.env.TRUI_REMOTE_URL}/` : 'auto' },
  html: { title: 'TRUI remote' },
});
