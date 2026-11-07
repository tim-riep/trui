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

import { useText } from '@tim-riep/trui/core';
import {
  createElement,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link TileGroup}. */
export interface TileGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Level of the title; 2 by default. */
  headingLevel?: 2 | 3 | 4;
  /** The tiles. */
  children: ReactNode;
  ref?: Ref<HTMLElement>;
}

const tileSelector = 'a.trui-tile, button.trui-tile';

/** Moves focus to the tile nearest in the direction of the arrow key. */
function moveFocus(
  grid: HTMLElement,
  from: HTMLElement,
  key: string,
  rtl: boolean,
): HTMLElement | null {
  const tiles = Array.from(grid.querySelectorAll<HTMLElement>(tileSelector));
  const index = tiles.indexOf(from);
  if (index < 0) return null;
  const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
  if (key === forward) return tiles[index + 1] ?? null;
  if (key === (rtl ? 'ArrowRight' : 'ArrowLeft')) return tiles[index - 1] ?? null;
  if (key === 'Home') return tiles[0] ?? null;
  if (key === 'End') return tiles[tiles.length - 1] ?? null;
  const a = from.getBoundingClientRect();
  const center = a.left + a.width / 2;
  const down = key === 'ArrowDown';
  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;
  for (const tile of tiles) {
    const b = tile.getBoundingClientRect();
    const dy = down ? b.top - a.bottom : a.top - b.bottom;
    if (dy < -1) continue;
    const dx = Math.abs(b.left + b.width / 2 - center);
    const score = dy * 4 + dx;
    if (tile !== from && score < bestScore) {
      best = tile;
      bestScore = score;
    }
  }
  return best;
}

/**
 * A titled group of tiles in a grid that wraps with the available width.
 * Wide tiles take two cells; gaps are filled by later tiles.
 *
 * Keyboard: Tab reaches each tile; arrow keys move to the neighboring tile
 * in that direction, Home and End to the first and last tile of the group.
 */
export function TileGroup({
  title,
  headingLevel = 2,
  className,
  children,
  ref,
  ...rest
}: TileGroupProps) {
  const titleId = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key))
      return;
    const from = (event.target as HTMLElement).closest<HTMLElement>(tileSelector);
    if (!from || from.parentElement !== event.currentTarget) return;
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const next = moveFocus(event.currentTarget, from, event.key, rtl);
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };
  return (
    <section
      ref={ref}
      aria-labelledby={title !== undefined ? titleId : undefined}
      className={cx('trui-tile-group', className)}
      {...rest}
    >
      {title !== undefined &&
        createElement(
          `h${headingLevel}`,
          { id: titleId, className: 'trui-tile-group__title', tabIndex: -1 },
          title,
        )}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: arrow keys move between the tiles inside */}
      <div className="trui-tile-group__grid" onKeyDown={onKeyDown}>
        {children}
      </div>
    </section>
  );
}

/** A group of {@link TileGroups}. */
export interface TileGroupData {
  /** Stable identifier of the group, e.g. for personalization later on. */
  id: string;
  title: string;
  tiles: ReactNode;
}

/** Props of {@link TileGroups}. */
export interface TileGroupsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  groups: readonly TileGroupData[];
  /** Shows a bar to jump to the groups; on by default with more than one group. */
  showJumpBar?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Several tile groups with a bar to jump to them. The bar marks the group in
 * view while scrolling. The groups are given as data so that their order can
 * later come from personalization.
 */
export function TileGroups({ groups, showJumpBar, className, ref, ...rest }: TileGroupsProps) {
  const t = useText();
  const [current, setCurrent] = useState(groups[0]?.id);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  // After a jump the group jumped to stays marked while the page scrolls there,
  // also when it cannot scroll to the top (e.g. the last group).
  const jumpedAt = useRef(0);
  const bar = showJumpBar ?? groups.length > 1;
  const baseId = useId();
  const sectionId = (id: string) => `${baseId}-${id}`;

  useEffect(() => {
    if (!bar) return;
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.groupId!;
          visible.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        if (Date.now() - jumpedAt.current < 1000) return;
        const top = groups.find((g) => (visible.get(g.id) ?? 0) > 0);
        if (top) setCurrent(top.id);
      },
      { threshold: [0, 0.25, 0.5, 1], rootMargin: '0px 0px -50% 0px' },
    );
    for (const el of sectionRefs.current.values()) observer.observe(el);
    return () => observer.disconnect();
  }, [bar, groups]);

  const jump = (id: string) => {
    const section = sectionRefs.current.get(id);
    if (!section) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth';
    section.scrollIntoView({ behavior, block: 'start' });
    jumpedAt.current = Date.now();
    section.querySelector<HTMLElement>('.trui-tile-group__title')?.focus({ preventScroll: true });
    setCurrent(id);
  };

  return (
    <div ref={ref} className={cx('trui-tile-groups', className)} {...rest}>
      {bar && (
        <nav aria-label={t('tileGroups.jumpTo')} className="trui-tile-groups__bar">
          {groups.map((group) => (
            <a
              key={group.id}
              href={`#${sectionId(group.id)}`}
              aria-current={current === group.id ? 'location' : undefined}
              className={cx(
                'trui-tile-groups__jump',
                current === group.id && 'trui-tile-groups__jump--current',
              )}
              onClick={(event) => {
                event.preventDefault();
                jump(group.id);
              }}
            >
              {group.title}
            </a>
          ))}
        </nav>
      )}
      {groups.map((group) => (
        <TileGroup
          key={group.id}
          id={sectionId(group.id)}
          data-group-id={group.id}
          title={group.title}
          ref={(el: HTMLElement | null) => {
            if (el) sectionRefs.current.set(group.id, el);
            else sectionRefs.current.delete(group.id);
          }}
        >
          {group.tiles}
        </TileGroup>
      ))}
    </div>
  );
}
