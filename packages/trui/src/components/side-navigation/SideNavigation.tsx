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

import { type IconDefinition, useText } from '@tim-riep/trui/core';
import { type HTMLAttributes, type MouseEvent, type Ref, useRef, useState } from 'react';
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { sidebarIcon } from '../../icons/set/sidebar';
import { cx } from '../../internal/class-names';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Menu } from '../menu/Menu';

/** An entry of a {@link SideNavigation}. */
export interface NavigationItem {
  key: string;
  label: string;
  icon?: IconDefinition;
  /** Address of the page; without it the entry is a button. */
  href?: string;
  /** A count after the label. */
  badge?: number;
  disabled?: boolean;
  /** Entries of the second level. */
  items?: readonly NavigationItem[];
}

/** Props of {@link SideNavigation}. */
export interface SideNavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  items: readonly NavigationItem[];
  /** Entries at the bottom, e.g. settings. */
  footerItems?: readonly NavigationItem[];
  /** Key of the current page. */
  selectedKey?: string;
  /**
   * Called when an entry is chosen. For links, call `event.preventDefault()`
   * to stop following the `href`, e.g. to use a router. The event is null
   * for entries chosen in the menu of the collapsed navigation; their `href`
   * is followed only without `onSelect`.
   */
  onSelect?: (key: string, item: NavigationItem, event: MouseEvent | null) => void;
  /** Shows only icons; entries with a second level open it as menu. */
  collapsed?: boolean;
  /** Offers a button to collapse and expand and is called with the new state. */
  onCollapsedChange?: (collapsed: boolean) => void;
  ref?: Ref<HTMLElement>;
}

function contains(item: NavigationItem, key: string | undefined): boolean {
  return (
    key !== undefined && (item.key === key || (item.items ?? []).some((i) => contains(i, key)))
  );
}

/**
 * Navigation between the pages of an application, in up to two levels. It
 * marks the current page and contains no routing: the application reacts to
 * `onSelect` or lets links follow their `href`.
 *
 * Keyboard: Tab moves through the entries; Enter follows an entry or opens
 * and closes a group.
 */
export function SideNavigation({
  items,
  footerItems,
  selectedKey,
  onSelect,
  collapsed = false,
  onCollapsedChange,
  className,
  ref,
  ...rest
}: SideNavigationProps) {
  const t = useText();
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(items.filter((i) => i.items && contains(i, selectedKey)).map((i) => i.key)),
  );
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const menuAnchor = useRef<HTMLElement | null>(null);

  const entry = (item: NavigationItem, level: 1 | 2) => {
    const current = item.key === selectedKey;
    const content = (
      <>
        {item.icon ? (
          <Icon icon={item.icon} size="m" className="trui-side-nav__icon" />
        ) : (
          level === 1 && <span className="trui-side-nav__icon" />
        )}
        <span
          className={collapsed && level === 1 ? 'trui-visually-hidden' : 'trui-side-nav__label'}
        >
          {item.label}
        </span>
        {item.badge !== undefined && !collapsed && <Badge count={item.badge} />}
      </>
    );
    const classes = cx(
      'trui-side-nav__entry',
      `trui-side-nav__entry--level-${level}`,
      current && 'trui-side-nav__entry--current',
    );
    const title = collapsed && level === 1 ? item.label : undefined;
    const select = (event: MouseEvent) => {
      onSelect?.(item.key, item, event);
      setMenuFor(null);
    };
    return item.href !== undefined && !item.disabled ? (
      <a
        href={item.href}
        className={classes}
        aria-current={current ? 'page' : undefined}
        title={title}
        onClick={select}
      >
        {content}
      </a>
    ) : (
      <button
        type="button"
        className={classes}
        aria-current={current ? 'page' : undefined}
        disabled={item.disabled}
        title={title}
        onClick={select}
      >
        {content}
      </button>
    );
  };

  const renderItem = (item: NavigationItem) => {
    if (!item.items) return <li key={item.key}>{entry(item, 1)}</li>;
    const open = expanded.has(item.key);
    const active = contains(item, selectedKey);
    const groupId = `trui-nav-${item.key}`;
    return (
      <li key={item.key}>
        <button
          type="button"
          className={cx(
            'trui-side-nav__entry',
            'trui-side-nav__entry--level-1',
            active && 'trui-side-nav__entry--contains-current',
          )}
          aria-expanded={collapsed ? menuFor === item.key : open}
          aria-controls={collapsed ? undefined : groupId}
          aria-haspopup={collapsed ? 'menu' : undefined}
          title={collapsed ? item.label : undefined}
          onClick={(event) => {
            if (collapsed) {
              menuAnchor.current = event.currentTarget;
              setMenuFor(menuFor === item.key ? null : item.key);
              return;
            }
            const next = new Set(expanded);
            if (open) next.delete(item.key);
            else next.add(item.key);
            setExpanded(next);
          }}
        >
          {item.icon ? (
            <Icon icon={item.icon} size="m" className="trui-side-nav__icon" />
          ) : (
            <span className="trui-side-nav__icon" />
          )}
          <span className={collapsed ? 'trui-visually-hidden' : 'trui-side-nav__label'}>
            {item.label}
          </span>
          {!collapsed && (
            <Icon
              icon={chevronDownIcon}
              size="s"
              className={cx('trui-side-nav__chevron', open && 'trui-side-nav__chevron--open')}
            />
          )}
        </button>
        {!collapsed && open && (
          <ul id={groupId} className="trui-side-nav__list trui-side-nav__list--level-2">
            {item.items.map((child) => (
              <li key={child.key}>{entry(child, 2)}</li>
            ))}
          </ul>
        )}
        {collapsed && (
          <Menu
            anchor={menuAnchor}
            open={menuFor === item.key}
            onClose={() => setMenuFor(null)}
            placement="end-start"
            aria-label={item.label}
            items={item.items.map((child) => ({
              key: child.key,
              label: child.label,
              ...(child.icon ? { icon: child.icon } : {}),
              ...(child.disabled ? { disabled: true } : {}),
            }))}
            onAction={(key) => {
              const child = item.items?.find((c) => c.key === key);
              if (!child) return;
              if (onSelect) onSelect(key, child, null);
              else if (child.href !== undefined) window.location.assign(child.href);
            }}
          />
        )}
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      aria-label={rest['aria-label'] ?? t('sideNavigation.label')}
      className={cx('trui-side-nav', collapsed && 'trui-side-nav--collapsed', className)}
      {...rest}
    >
      <ul className="trui-side-nav__list">{items.map(renderItem)}</ul>
      {(footerItems || onCollapsedChange) && (
        <div className="trui-side-nav__footer">
          {footerItems && <ul className="trui-side-nav__list">{footerItems.map(renderItem)}</ul>}
          {onCollapsedChange && (
            <Button
              variant="text"
              icon={sidebarIcon}
              aria-label={collapsed ? t('sideNavigation.expand') : t('sideNavigation.collapse')}
              aria-expanded={!collapsed}
              className="trui-side-nav__toggle"
              onClick={() => onCollapsedChange(!collapsed)}
            />
          )}
        </div>
      )}
    </nav>
  );
}
