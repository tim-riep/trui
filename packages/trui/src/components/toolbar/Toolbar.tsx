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

import { type IconDefinition, useLocale, useText } from '@tim-riep/trui/core';
import {
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { moreHorizontalIcon } from '../../icons/set/more-horizontal';
import { cx } from '../../internal/class-names';
import { Button, type ButtonVariant } from '../button/Button';
import type { MenuItem } from '../menu/Menu';
import { MenuButton } from '../menu/MenuButton';

/** An action of a {@link Toolbar}. */
export interface ToolbarItem {
  key: string;
  label: string;
  icon?: IconDefinition;
  /** Shows only the icon in the toolbar; the label names it and appears in the overflow menu. */
  iconOnly?: boolean;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Entries of a menu that the action opens instead of running. */
  menu?: readonly MenuItem[];
  /**
   * Whether the action may move into the overflow menu when there is no room:
   * `auto` (default) from the end, `never` stays visible, `always` is only in the menu.
   */
  overflow?: 'auto' | 'never' | 'always';
}

/** Props of {@link Toolbar}. */
export interface ToolbarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  items: readonly ToolbarItem[];
  /** Called with the key of the action, or of the menu entry for actions with a menu. */
  onAction: (key: string) => void;
  /** Content at the start, e.g. a title or a search field; it does not overflow. */
  start?: ReactNode;
  /** Name of the toolbar for assistive technology. */
  'aria-label'?: string;
  ref?: Ref<HTMLDivElement>;
}

function ToolbarButton({ item, onAction }: { item: ToolbarItem; onAction: (key: string) => void }) {
  const common = {
    variant: item.variant ?? 'text',
    disabled: item.disabled ?? false,
    ...(item.icon ? { icon: item.icon } : {}),
  } as const;
  if (item.menu) {
    return item.iconOnly ? (
      <MenuButton
        {...common}
        aria-label={item.label}
        items={item.menu}
        onAction={(key) => onAction(key)}
      />
    ) : (
      <MenuButton {...common} items={item.menu} onAction={(key) => onAction(key)}>
        {item.label}
      </MenuButton>
    );
  }
  return item.iconOnly ? (
    <Button {...common} aria-label={item.label} onClick={() => onAction(item.key)} />
  ) : (
    <Button {...common} onClick={() => onAction(item.key)}>
      {item.label}
    </Button>
  );
}

/**
 * A row of actions. When there is not enough room, actions move from the end
 * into an overflow menu; their order and labels are kept.
 *
 * Keyboard: Tab reaches each action; Arrow Left and Right move between them
 * as well, Home and End to the first and last.
 */
export function Toolbar({ items, onAction, start, className, ref, ...rest }: ToolbarProps) {
  const t = useText();
  const { dir } = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);
  const [visibleCount, setVisibleCount] = useState(items.length);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const update = () => {
      const widths = Array.from(measure.children).map((c) => (c as HTMLElement).offsetWidth);
      const moreWidth = widths.pop() ?? 0;
      const gap = Number.parseFloat(getComputedStyle(measure).columnGap) || 0;
      const available = root.clientWidth - (startRef.current?.offsetWidth ?? 0) - gap * 2;
      const candidates = items.filter((i) => i.overflow !== 'always');
      const required = candidates.reduce(
        (sum, item) => sum + widths[items.indexOf(item)]! + gap,
        0,
      );
      const anyAlways = items.some((i) => i.overflow === 'always');
      if (required <= available && !anyAlways) {
        setVisibleCount(candidates.length);
        return;
      }
      // Never-overflowing actions take their room first; the rest fills up in order.
      let room = available - moreWidth - gap;
      for (const item of candidates)
        if (item.overflow === 'never') room -= widths[items.indexOf(item)]! + gap;
      let count = 0;
      for (const item of candidates) {
        if (item.overflow === 'never') continue;
        const w = widths[items.indexOf(item)]! + gap;
        if (w > room) break;
        room -= w;
        count++;
      }
      setVisibleCount(count);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(root);
    observer.observe(measure);
    return () => observer.disconnect();
  }, [items]);

  let shownAuto = 0;
  const visible: ToolbarItem[] = [];
  const hidden: ToolbarItem[] = [];
  for (const item of items) {
    if (item.overflow === 'always') hidden.push(item);
    else if (item.overflow === 'never') visible.push(item);
    else if (shownAuto < visibleCount) {
      visible.push(item);
      shownAuto++;
    } else hidden.push(item);
  }
  const overflowItems: MenuItem[] = hidden.map((item) => ({
    key: item.key,
    label: item.label,
    ...(item.icon ? { icon: item.icon } : {}),
    ...(item.disabled ? { disabled: true } : {}),
    ...(item.menu ? { items: item.menu } : {}),
  }));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    if (![forward, back, 'Home', 'End'].includes(event.key)) return;
    const buttons = Array.from(
      rootRef.current?.querySelectorAll<HTMLButtonElement>(
        '.trui-toolbar__actions button:not(:disabled)',
      ) ?? [],
    );
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? buttons.length - 1
          : (index + (event.key === forward ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-orientation="horizontal"
      className={cx('trui-toolbar', className)}
      onKeyDown={onKeyDown}
      {...rest}
    >
      {start !== undefined && (
        <div ref={startRef} className="trui-toolbar__start">
          {start}
        </div>
      )}
      <div className="trui-toolbar__actions">
        {visible.map((item) => (
          <ToolbarButton key={item.key} item={item} onAction={(key) => onAction(key)} />
        ))}
        {hidden.length > 0 && (
          <MenuButton
            variant="text"
            icon={moreHorizontalIcon}
            aria-label={t('common.more')}
            items={overflowItems}
            onAction={(key) => onAction(key)}
          />
        )}
      </div>
      {/* Invisible copy of all actions to measure their widths. */}
      <div ref={measureRef} className="trui-toolbar__measure" aria-hidden="true" inert>
        {items.map((item) => (
          <ToolbarButton key={item.key} item={item} onAction={() => undefined} />
        ))}
        <Button
          variant="text"
          icon={moreHorizontalIcon}
          aria-label={t('common.more')}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}
