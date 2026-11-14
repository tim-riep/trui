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

import { computePosition, type Placement, Portal, useLocale } from '@tim-riep/trui/core';
import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { cx } from '../class-names';

export interface FloatingProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The element the floating element is placed next to. */
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  /** Called on a pointer press outside of anchor and floating element. */
  onDismiss?: (() => void) | undefined;
  placement?: Placement;
  /** Makes the floating element at least as wide as the anchor. */
  matchWidth?: boolean;
  /** Limits the height to the room on its side, for scrolling lists. */
  limitHeight?: boolean;
  /**
   * On small screens, shows the element as a sheet along the bottom edge
   * instead of next to the anchor. For lists to pick from, not for
   * suggestions while typing, which the on-screen keyboard would cover.
   */
  sheet?: boolean;
  floatingRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}

/**
 * An element in the top layer next to an anchor (lists, calendars, menus).
 * It renders into the overlay container of the provider, so tokens and
 * writing direction apply, and follows the anchor on scroll and resize.
 */
export function Floating({
  anchor,
  open,
  onDismiss,
  placement = 'bottom-start',
  matchWidth = false,
  limitHeight = true,
  sheet = false,
  floatingRef,
  className,
  style,
  children,
  ...rest
}: FloatingProps) {
  const { dir } = useLocale();
  const own = useRef<HTMLDivElement>(null);
  const ref = floatingRef ?? own;
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useLayoutEffect(() => {
    const el = ref.current;
    const anchorEl = anchor.current;
    if (!open || !el || !anchorEl) return;
    if (!el.matches(':popover-open')) el.showPopover();
    const small = window.matchMedia('(width < 600px)');
    const update = () => {
      if (sheet && small.matches) {
        el.dataset.sheet = '';
        el.style.left = '';
        el.style.top = '';
        el.style.minWidth = '';
        el.style.maxHeight = '';
        return;
      }
      delete el.dataset.sheet;
      const a = anchorEl.getBoundingClientRect();
      if (matchWidth) el.style.minWidth = `${a.width}px`;
      el.style.maxHeight = '';
      const viewport = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight };
      const size = { width: el.offsetWidth, height: el.offsetHeight };
      const p = computePosition(a, size, viewport, { placement, dir });
      if (limitHeight && size.height > p.available) {
        el.style.maxHeight = `${Math.max(p.available, 120)}px`;
        const again = computePosition(
          a,
          { width: el.offsetWidth, height: el.offsetHeight },
          viewport,
          {
            placement: p.placement,
            dir,
            flip: false,
          },
        );
        el.style.left = `${again.x}px`;
        el.style.top = `${again.y}px`;
      } else {
        el.style.left = `${p.x}px`;
        el.style.top = `${p.y}px`;
      }
      el.dataset.placement = p.placement;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observer.observe(anchorEl);
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      if (el.matches(':popover-open')) el.hidePopover();
    };
  }, [open, anchor, ref, placement, matchWidth, limitHeight, sheet, dir]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      const el = ref.current;
      // A press on the backdrop of a sheet targets the sheet itself.
      if (el && target === el && 'sheet' in el.dataset) {
        const r = el.getBoundingClientRect();
        if (event.clientY < r.top) {
          dismiss.current?.();
          return;
        }
      }
      if (el?.contains(target) || anchor.current?.contains(target)) return;
      dismiss.current?.();
    };
    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, anchor, ref]);

  if (!open) return null;
  return (
    <Portal>
      <div
        ref={ref}
        popover="manual"
        className={cx('trui-floating', className)}
        style={style as CSSProperties}
        {...rest}
      >
        {children}
      </div>
    </Portal>
  );
}
