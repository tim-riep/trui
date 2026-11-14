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

import { type IconDefinition, type Placement, useLocale, useText } from '@tim-riep/trui/core';
import { type KeyboardEvent, type RefObject, useEffect, useRef, useState } from 'react';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Floating } from '../../internal/overlay/Floating';
import { Icon } from '../icon/Icon';

/** An entry of a {@link Menu}. */
export interface MenuItem {
  /** Identifies the entry in `onAction`. */
  key: string;
  label: string;
  icon?: IconDefinition;
  disabled?: boolean;
  /** Shows the entry as destructive. */
  danger?: boolean;
  /** Draws a line before the entry, to group entries. */
  separatorBefore?: boolean;
  /** Entries of a submenu. */
  items?: readonly MenuItem[];
}

/** Props of {@link Menu}. */
export interface MenuProps {
  /** The element the menu opens from, usually a button. */
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  /** Called when the menu closes: after an action, on Escape, Tab or a click outside. */
  onClose: () => void;
  items: readonly MenuItem[];
  /** Called with the key of the chosen entry. */
  onAction: (key: string, item: MenuItem) => void;
  placement?: Placement;
  /** Starts on the last entry, e.g. when opened with Arrow Up. */
  focusLast?: boolean;
  'aria-label'?: string;
}

interface MenuListProps {
  anchor: RefObject<HTMLElement | null>;
  items: readonly MenuItem[];
  placement: Placement;
  focusLast: boolean;
  /** Closes the whole menu. */
  closeAll: (returnFocus: boolean) => void;
  /** Closes this level (a submenu) and returns to its parent entry. */
  closeLevel: (() => void) | undefined;
  onAction: (key: string, item: MenuItem) => void;
  label: string | undefined;
}

function MenuList({
  anchor,
  items,
  placement,
  focusLast,
  closeAll,
  closeLevel,
  onAction,
  label,
}: MenuListProps) {
  const { dir, locale } = useLocale();
  const t = useText();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);
  const [active, setActive] = useState(
    () => (focusLast ? enabled[enabled.length - 1] : enabled[0]) ?? -1,
  );
  const [submenu, setSubmenu] = useState<number | null>(null);
  const typed = useRef({ text: '', at: 0 });

  useEffect(() => {
    if (submenu === null) itemRefs.current[active]?.focus();
  }, [active, submenu]);

  const move = (delta: number) => {
    if (enabled.length === 0) return;
    const at = enabled.indexOf(active);
    setActive(enabled[(at + delta + enabled.length) % enabled.length]!);
  };
  const activate = (index: number) => {
    const item = items[index];
    if (!item || item.disabled) return;
    if (item.items) {
      setActive(index);
      setSubmenu(index);
      return;
    }
    closeAll(true);
    onAction(item.key, item);
  };
  const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';

  const onKeyDown = (event: KeyboardEvent) => {
    if (submenu !== null) return;
    event.stopPropagation();
    switch (event.key) {
      case 'ArrowDown':
        move(1);
        break;
      case 'ArrowUp':
        move(-1);
        break;
      case 'Home':
        setActive(enabled[0] ?? -1);
        break;
      case 'End':
        setActive(enabled[enabled.length - 1] ?? -1);
        break;
      case 'Enter':
      case ' ':
        activate(active);
        break;
      case 'Escape':
        if (closeLevel) closeLevel();
        else closeAll(true);
        break;
      case 'Tab':
        closeAll(false);
        return;
      default:
        if (event.key === forward && items[active]?.items) activate(active);
        else if (event.key === back && closeLevel) closeLevel();
        else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          const now = Date.now();
          typed.current = {
            text: now - typed.current.at < 700 ? typed.current.text + event.key : event.key,
            at: now,
          };
          const query = typed.current.text.toLocaleLowerCase(locale);
          const start = enabled.indexOf(active);
          for (let step = 1; step <= enabled.length; step++) {
            const i = enabled[(start + step) % enabled.length]!;
            if (items[i]!.label.toLocaleLowerCase(locale).startsWith(query)) {
              setActive(i);
              break;
            }
          }
        } else return;
    }
    event.preventDefault();
  };

  const submenuAnchor = useRef<HTMLElement | null>(null);
  submenuAnchor.current = submenu === null ? null : (itemRefs.current[submenu] ?? null);

  return (
    <Floating
      sheet
      anchor={anchor}
      open
      onDismiss={closeLevel ? undefined : () => closeAll(false)}
      placement={placement}
      floatingRef={listRef}
      role="menu"
      aria-label={label}
      className="trui-menu"
      onKeyDown={onKeyDown}
    >
      {items.map((item, index) => (
        <div
          key={item.key}
          role="none"
          className={cx(item.separatorBefore && index > 0 && 'trui-menu__group')}
        >
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: the menu handles the keyboard */}
          <div
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="menuitem"
            tabIndex={index === active ? 0 : -1}
            aria-disabled={item.disabled || undefined}
            aria-haspopup={item.items ? 'menu' : undefined}
            aria-expanded={item.items ? submenu === index : undefined}
            className={cx(
              'trui-menu__item',
              item.danger && 'trui-menu__item--danger',
              index === active && 'trui-menu__item--active',
            )}
            onClick={() => activate(index)}
            onMouseEnter={() => {
              if (item.disabled) return;
              setActive(index);
              setSubmenu(item.items ? index : null);
            }}
          >
            <span className="trui-menu__icon">
              {item.icon && <Icon icon={item.icon} size="s" />}
            </span>
            <span className="trui-menu__label">{item.label}</span>
            {item.items && (
              <Icon
                icon={chevronRightIcon}
                size="s"
                className="trui-menu__chevron"
                label={t('menu.submenu')}
              />
            )}
          </div>
          {item.items && submenu === index && (
            <MenuList
              anchor={submenuAnchor}
              items={item.items}
              placement="end-start"
              focusLast={false}
              closeAll={closeAll}
              closeLevel={() => {
                setSubmenu(null);
                itemRefs.current[index]?.focus();
              }}
              onAction={onAction}
              label={item.label}
            />
          )}
        </div>
      ))}
    </Floating>
  );
}

/**
 * A list of actions that opens from a button. Entries may have icons and
 * submenus.
 *
 * Keyboard: focus moves into the menu; arrows move, Home and End jump,
 * typing letters jumps to an entry, Enter or Space runs it, the arrow
 * pointing forward opens a submenu and the one pointing back closes it,
 * Escape closes and returns focus to the button.
 */
export function Menu({
  anchor,
  open,
  onClose,
  items,
  onAction,
  placement = 'bottom-start',
  focusLast = false,
  ...aria
}: MenuProps) {
  if (!open) return null;
  return (
    <MenuList
      anchor={anchor}
      items={items}
      placement={placement}
      focusLast={focusLast}
      closeAll={(returnFocus) => {
        onClose();
        if (returnFocus) anchor.current?.focus();
      }}
      closeLevel={undefined}
      onAction={onAction}
      label={aria['aria-label']}
    />
  );
}
