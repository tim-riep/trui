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

// Builds the module federation example, serves host and remote on two
// origins and checks in a browser that both use exactly one instance of
// React and of the library, and that the remote takes over theme and
// language of the host. TRUI_SKIP_BUILD=1 uses the builds made before;
// they must have been built for the same ports.

import { execFileSync } from 'node:child_process';
import type { Server } from 'node:http';
import { join, resolve } from 'node:path';
import { type Browser, chromium, type Page } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '../../examples/federation/serve.mjs';

const root = resolve(import.meta.dirname, '../..');
const example = join(root, 'examples/federation');
const hostPort = Number(process.env.TRUI_HOST_PORT ?? 3201);
const remotePort = Number(process.env.TRUI_REMOTE_PORT ?? 3202);
const remoteUrl = `http://127.0.0.1:${remotePort}`;

let servers: Server[] = [];
let browser: Browser;
let page: Page;
const remoteRequests: string[] = [];
const errors: string[] = [];

interface SharedVersion {
  from: string;
  loaded?: boolean;
  useIn?: string[];
}

beforeAll(async () => {
  if (!process.env.TRUI_SKIP_BUILD) {
    execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
    const env = { ...process.env, NODE_ENV: 'production', TRUI_REMOTE_URL: remoteUrl };
    execFileSync('npx', ['rsbuild', 'build'], {
      cwd: join(example, 'remote'),
      env,
      stdio: 'inherit',
    });
    execFileSync('npx', ['rsbuild', 'build'], {
      cwd: join(example, 'host'),
      env,
      stdio: 'inherit',
    });
  }
  servers = [
    await serve(join(example, 'remote/dist'), remotePort),
    await serve(join(example, 'host/dist'), hostPort),
  ];
  browser = await chromium.launch();
  page = await browser.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('request', (r) => {
    if (r.url().startsWith(remoteUrl)) remoteRequests.push(r.url());
  });
  await page.goto(`http://127.0.0.1:${hostPort}/`);
  await page.getByTestId('remote-page').waitFor();
}, 300_000);

afterAll(async () => {
  await browser?.close();
  for (const s of servers) s.close();
});

describe('module federation', () => {
  it('loads the page of the remote into the host without errors', async () => {
    expect(await page.getByText('Orders from the remote').isVisible()).toBe(true);
    expect(remoteRequests.some((u) => u.endsWith('/mf-manifest.json'))).toBe(true);
    expect(errors).toEqual([]);
  });

  it('shares exactly one instance of React and of the library', async () => {
    const shared = await page.evaluate(() => {
      const share = (
        window as unknown as { __FEDERATION__: { __SHARE__: Record<string, unknown> } }
      ).__FEDERATION__.__SHARE__;
      const result: Record<string, SharedVersion[]> = {};
      for (const scopes of Object.values(share) as Record<
        string,
        Record<string, Record<string, SharedVersion>>
      >[]) {
        for (const [pkg, versions] of Object.entries(scopes.default ?? {})) {
          const loaded = Object.values(versions)
            .filter((v) => v.loaded)
            .map((v) => ({ from: v.from, useIn: v.useIn ?? [] }));
          result[pkg] = [...(result[pkg] ?? []), ...loaded];
        }
      }
      return result;
    });
    for (const pkg of ['react', 'react-dom', '@tim-riep/trui', '@tim-riep/trui/core']) {
      const froms = new Set(shared[pkg]?.map((v) => v.from));
      expect(froms.size, `${pkg} loaded from ${[...froms].join(', ')}`).toBe(1);
    }
    for (const pkg of ['react', '@tim-riep/trui', '@tim-riep/trui/core']) {
      const users = new Set(shared[pkg]?.flatMap((v) => v.useIn));
      expect([...users].sort(), pkg).toEqual(['host', 'orders']);
    }
    // The remote renders with the very React of the host (the same functions;
    // namespace objects differ per importing module).
    expect(await page.getByTestId('remote-page').getAttribute('data-same-react')).toBe('true');
  });

  it('lets the remote take over theme and language of the host', async () => {
    const context = page.getByTestId('remote-context');
    const cancel = page.getByTestId('remote-cancel');
    expect(await context.textContent()).toBe('light | en');
    expect(await cancel.textContent()).toBe('Cancel');
    const lightBackground = await page
      .getByLabel('Customer')
      .evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor);

    await page.getByRole('button', { name: /^Theme/ }).click();
    await page.getByRole('button', { name: /^Language/ }).click();

    await expect.poll(() => context.textContent()).toBe('dark | de');
    expect(await cancel.textContent()).toBe('Abbrechen');
    const darkBackground = await page
      .getByLabel('Customer')
      .evaluate((el) => getComputedStyle(el.parentElement!).backgroundColor);
    expect(darkBackground).not.toBe(lightBackground);
  });

  it('loads no stylesheet from the remote', () => {
    expect(remoteRequests.filter((u) => u.endsWith('.css'))).toEqual([]);
  });
});
