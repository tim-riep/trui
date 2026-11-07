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

import { render } from '@testing-library/react';
import { TruiProvider } from '@tim-riep/trui/core';
import { describe, expect, it } from 'vitest';
import '../styles.css';

// Pairs of foreground and background tokens with the contrast WCAG 2.2 AA
// requires: 4.5 for text, 3 for boundaries of controls and focus indicators.
const pairs: [string, string, number][] = [
  ['text', 'surface', 4.5],
  ['text', 'background', 4.5],
  ['text', 'surface-subtle', 4.5],
  ['text-secondary', 'surface', 4.5],
  ['text-secondary', 'background', 4.5],
  ['text-secondary', 'surface-subtle', 4.5],
  ['accent-text', 'surface', 4.5],
  ['accent-text', 'background', 4.5],
  ['on-accent', 'accent', 4.5],
  ['on-accent', 'accent-hover', 4.5],
  ['on-accent', 'accent-active', 4.5],
  ['text', 'accent-subtle', 4.5],
  ['error', 'surface', 4.5],
  ['warning', 'surface', 4.5],
  ['success', 'surface', 4.5],
  ['information', 'surface', 4.5],
  ['text', 'error-subtle', 4.5],
  ['text', 'warning-subtle', 4.5],
  ['on-error', 'error', 4.5],
  ['on-error', 'danger-hover', 4.5],
  ['border-strong', 'surface', 3],
  ['border-strong', 'background', 3],
  ['focus', 'surface', 3],
  ['focus', 'background', 3],
];

/** Resolves a token to sRGB components 0–1 by letting the browser compute it. */
function resolve(probe: HTMLElement, token: string): [number, number, number] {
  probe.style.color = `var(--trui-color-${token})`;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.fillStyle = getComputedStyle(probe).color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a !== 255) throw new Error(`token ${token} is not opaque`);
  return [r! / 255, g! / 255, b! / 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

describe.each(['light', 'dark'] as const)('contrast of the %s theme', (theme) => {
  it('meets WCAG 2.2 AA for every pair of tokens', () => {
    const { container } = render(
      <TruiProvider theme={theme}>
        <span data-probe="" />
      </TruiProvider>,
    );
    const probe = container.querySelector<HTMLElement>('[data-probe]')!;
    const failures = pairs
      .map(([fg, bg, min]) => ({
        fg,
        bg,
        min,
        ratio: contrast(resolve(probe, fg), resolve(probe, bg)),
      }))
      .filter((p) => p.ratio < p.min)
      .map((p) => `${p.fg} on ${p.bg}: ${p.ratio.toFixed(2)} < ${p.min}`);
    expect(failures).toEqual([]);
  });
});
