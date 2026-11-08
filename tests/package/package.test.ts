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

// Builds the package TRUI, installs it into a fresh go-runtime database,
// activates its service node, starts the server and checks that the files
// are delivered with media type, ETag and 304 for conditional requests, and
// that the demo page loads the library from there in a browser.
//
// Needs go-runtime: the binary in RT_BIN, or the sources in GO_RUNTIME_DIR
// (default ../go-runtime) and Go to build it. TRUI_SKIP_BUILD=1 uses the
// package built before.

import { type ChildProcess, execFileSync, spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const runtimeDir = resolve(process.env.GO_RUNTIME_DIR ?? join(root, '../go-runtime'));
const packageDir = join(root, 'dist/package/TRUI');
const work = mkdtempSync(join(tmpdir(), 'trui-package-'));
const env = { ...process.env, RT_DATABASE: `sqlite:${join(work, 'runtime.db')}` };

let rt = process.env.RT_BIN ?? '';
let server: ChildProcess | undefined;
let base = '';

function run(...args: string[]): string {
  return execFileSync(rt, args, { env, encoding: 'utf8' });
}

async function freePort(): Promise<number> {
  return new Promise((ok, fail) => {
    const s = createServer();
    s.once('error', fail);
    s.listen(0, '127.0.0.1', () => {
      const { port } = s.address() as { port: number };
      s.close(() => ok(port));
    });
  });
}

async function waitFor(url: string): Promise<void> {
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`server did not start: ${url}`);
}

beforeAll(async () => {
  if (!process.env.TRUI_SKIP_BUILD) {
    execFileSync('npm', ['run', 'build:package:catalog'], { cwd: root, stdio: 'inherit' });
  }
  if (!rt) {
    rt = join(work, 'rt');
    execFileSync('go', ['build', '-o', rt, './cmd/rt'], { cwd: runtimeDir, stdio: 'inherit' });
  }
  run('init');
  run('language', 'add', 'de');
  run('install', packageDir);
  run('http', 'activate', '/trui');
  const port = await freePort();
  base = `http://127.0.0.1:${port}`;
  server = spawn(rt, ['serve', '--addr', `127.0.0.1:${port}`], { env, stdio: 'ignore' });
  await waitFor(`${base}/trbase/ping`);
}, 300_000);

afterAll(() => {
  server?.kill('SIGTERM');
  rmSync(work, { recursive: true, force: true });
});

describe('package TRUI in go-runtime', () => {
  it('is installed with the version of the library and a reachable node', () => {
    const version = JSON.parse(
      readFileSync(join(root, 'packages/trui/package.json'), 'utf8'),
    ).version;
    expect(run('list')).toMatch(new RegExp(`TRUI\\s+${version.replaceAll('.', '\\.')}`));
    expect(run('http', 'list', 'TRUI')).toMatch(
      /\/trui\/lib\s+active\s+yes\s+\/TRBASE\/ASSET_HANDLER/,
    );
  });

  it.each([
    ['trui.js', 'text/javascript'],
    ['core.js', 'text/javascript'],
    ['vendor/react.js', 'text/javascript'],
    ['trui.css', 'text/css'],
    ['index.html', 'text/html'],
    ['trui.js.map', 'application/json'],
  ])('delivers %s as %s without authentication', async (path, type) => {
    const response = await fetch(`${base}/trui/lib/${path}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe(type);
    expect(response.headers.get('etag')).toMatch(/^"[0-9a-f]{64}"$/);
    const local = readFileSync(join(packageDir, 'assets/lib', path));
    expect(Buffer.from(await response.arrayBuffer()).equals(local)).toBe(true);
  });

  it('delivers files with content hash and answers 304 to conditional requests', async () => {
    const assets = JSON.parse(readFileSync(join(packageDir, 'assets/lib/asset.json'), 'utf8'));
    const hashed = Object.keys(assets.files).filter((p) => /-[0-9a-f]{8,}\.(js|woff2)$/.test(p));
    const font = hashed.find((p) => p.endsWith('.woff2'))!;
    const chunk = hashed.find((p) => p.endsWith('.js'))!;
    expect(font).toBeDefined();
    expect(chunk).toBeDefined();
    for (const [path, type] of [
      [font, 'font/woff2'],
      [chunk, 'text/javascript'],
    ] as const) {
      const first = await fetch(`${base}/trui/lib/${path}`);
      expect(first.status).toBe(200);
      expect(first.headers.get('content-type')).toBe(type);
      const etag = first.headers.get('etag')!;
      const second = await fetch(`${base}/trui/lib/${path}`, {
        headers: { 'If-None-Match': etag },
      });
      expect(second.status).toBe(304);
      expect(await second.text()).toBe('');
    }
  });

  it('serves the catalog as second repository', async () => {
    expect(run('http', 'list', 'TRUI')).toMatch(/\/trui\/catalog\s+active\s+yes/);
    const index = await fetch(`${base}/trui/catalog/index.html`);
    expect(index.status).toBe(200);
    expect(index.headers.get('content-type')).toBe('text/html');
    const iframe = await (await fetch(`${base}/trui/catalog/iframe.html`)).text();
    const script = iframe.match(/src="\.\/([^"]+\.js)"/)?.[1];
    expect(script).toBeDefined();
    const response = await fetch(`${base}/trui/catalog/${script}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/javascript');
  });

  it('answers 404 for missing files', async () => {
    const response = await fetch(`${base}/trui/lib/missing.js`);
    expect(response.status).toBe(404);
  });

  it('serves a page that loads the library and shows components', async () => {
    const browser = await chromium.launch();
    try {
      const page = await browser.newPage();
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
      await page.goto(`${base}/trui/lib/index.html`);
      await page.getByRole('button', { name: 'Create' }).waitFor();
      const field = page.getByLabel('Supplier');
      await field.fill('Beta GmbH');
      await expect.poll(() => page.getByTestId('echo').textContent()).toBe('Supplier: Beta GmbH');
      await page.getByRole('button', { name: /^Theme/ }).click();
      expect(await page.locator('.trui-root').first().getAttribute('data-trui-theme')).toBe('dark');
      const fontsLoaded = await page.evaluate(async () => {
        await document.fonts.ready;
        return document.fonts.check('14px "Inter Variable"');
      });
      expect(fontsLoaded).toBe(true);
      expect(errors).toEqual([]);
    } finally {
      await browser.close();
    }
  });
});

if (!existsSync(runtimeDir) && !process.env.RT_BIN) {
  throw new Error(`go-runtime not found in ${runtimeDir}; set GO_RUNTIME_DIR or RT_BIN`);
}
