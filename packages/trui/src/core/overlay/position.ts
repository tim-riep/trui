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

/**
 * Placement of floating elements (popovers, menus, suggestion lists) next to
 * an anchor. Pure geometry, so it can be tested without a browser.
 */

/** Side of the anchor the floating element appears on. */
export type Side = 'top' | 'bottom' | 'start' | 'end';
/** Alignment along that side; `start` and `end` follow the writing direction. */
export type Align = 'start' | 'center' | 'end';
/** A side with an alignment, e.g. `bottom-start`. */
export type Placement = Side | `${Side}-${Exclude<Align, 'center'>}`;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PositionOptions {
  placement: Placement;
  /** Writing direction; `start` is left in `ltr` and right in `rtl`. */
  dir: 'ltr' | 'rtl';
  /** Gap between anchor and floating element. */
  offset?: number;
  /** Minimum distance to the edges of the viewport. */
  padding?: number;
  /** Flips to the opposite side if there is not enough room. */
  flip?: boolean;
}

export interface Position {
  x: number;
  y: number;
  /** The placement actually used after flipping. */
  placement: Placement;
  /** Room on the used side, for limiting the height or width of lists. */
  available: number;
}

const opposite: Record<Side, Side> = { top: 'bottom', bottom: 'top', start: 'end', end: 'start' };

function parse(p: Placement): [Side, Align] {
  const [side, align] = p.split('-') as [Side, Align | undefined];
  return [side, align ?? 'center'];
}

function physical(side: Side, dir: 'ltr' | 'rtl'): 'top' | 'bottom' | 'left' | 'right' {
  if (side === 'top' || side === 'bottom') return side;
  return (side === 'start') === (dir === 'ltr') ? 'left' : 'right';
}

function room(
  side: Side,
  anchor: Rect,
  viewport: Rect,
  dir: 'ltr' | 'rtl',
  offset: number,
  padding: number,
): number {
  switch (physical(side, dir)) {
    case 'top':
      return anchor.y - viewport.y - offset - padding;
    case 'bottom':
      return viewport.y + viewport.height - (anchor.y + anchor.height) - offset - padding;
    case 'left':
      return anchor.x - viewport.x - offset - padding;
    case 'right':
      return viewport.x + viewport.width - (anchor.x + anchor.width) - offset - padding;
  }
}

function place(
  side: Side,
  align: Align,
  anchor: Rect,
  floating: { width: number; height: number },
  dir: 'ltr' | 'rtl',
  offset: number,
): { x: number; y: number } {
  const p = physical(side, dir);
  if (p === 'top' || p === 'bottom') {
    const y = p === 'top' ? anchor.y - offset - floating.height : anchor.y + anchor.height + offset;
    const startEdge = dir === 'ltr' ? anchor.x : anchor.x + anchor.width - floating.width;
    const endEdge = dir === 'ltr' ? anchor.x + anchor.width - floating.width : anchor.x;
    const x =
      align === 'center'
        ? anchor.x + (anchor.width - floating.width) / 2
        : align === 'start'
          ? startEdge
          : endEdge;
    return { x, y };
  }
  const x = p === 'left' ? anchor.x - offset - floating.width : anchor.x + anchor.width + offset;
  const y =
    align === 'center'
      ? anchor.y + (anchor.height - floating.height) / 2
      : align === 'start'
        ? anchor.y
        : anchor.y + anchor.height - floating.height;
  return { x, y };
}

/**
 * Computes where to put a floating element of the given size next to
 * `anchor` within `viewport`. Flips to the opposite side when the preferred
 * side has too little room and the other has more, then shifts along the
 * side to stay inside the viewport.
 */
export function computePosition(
  anchor: Rect,
  floating: { width: number; height: number },
  viewport: Rect,
  options: PositionOptions,
): Position {
  const offset = options.offset ?? 4;
  const padding = options.padding ?? 8;
  const [preferred, align] = parse(options.placement);
  let side = preferred;
  const vertical = side === 'top' || side === 'bottom';
  const size = vertical ? floating.height : floating.width;
  if (options.flip !== false) {
    const here = room(side, anchor, viewport, options.dir, offset, padding);
    const there = room(opposite[side], anchor, viewport, options.dir, offset, padding);
    if (here < size && there > here) side = opposite[side];
  }
  let { x, y } = place(side, align, anchor, floating, options.dir, offset);
  const minX = viewport.x + padding;
  const maxX = viewport.x + viewport.width - padding - floating.width;
  const minY = viewport.y + padding;
  const maxY = viewport.y + viewport.height - padding - floating.height;
  if (vertical) x = Math.max(minX, Math.min(x, Math.max(minX, maxX)));
  else y = Math.max(minY, Math.min(y, Math.max(minY, maxY)));
  const placement = (align === 'center' ? side : `${side}-${align}`) as Placement;
  return { x, y, placement, available: room(side, anchor, viewport, options.dir, offset, padding) };
}
