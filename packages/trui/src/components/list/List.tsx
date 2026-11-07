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

import { type IconDefinition, useControllableState, useLocale, useText } from '@tim-riep/trui/core';
import { type KeyboardEvent, type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { checkIcon } from '../../icons/set/check';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Tag, type Tone } from '../tag/Tag';

/** An entry of a {@link List}. */
export interface ListEntry {
  key: string;
  title: ReactNode;
  /** A second line below the title. */
  description?: ReactNode;
  icon?: IconDefinition;
  /** Shown before the text instead of an icon, e.g. an avatar. */
  avatar?: ReactNode;
  /** Text at the end, e.g. an amount or a date. */
  info?: ReactNode;
  /** A status tag at the end. */
  status?: { label: string; tone: Tone };
  disabled?: boolean;
  /** Text of the entry for typing to jump to it; the title if it is a string. */
  textValue?: string;
}

/** Props of {@link List}. */
export interface ListProps {
  items: readonly ListEntry[];
  /** Name of the list for assistive technology. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: ReadonlySet<string>;
  defaultSelectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (keys: ReadonlySet<string>) => void;
  /** Called when an entry is chosen by click or Enter, e.g. to open its detail. */
  onItemPress?: (item: ListEntry) => void;
  /** Shows a chevron on entries that lead to a detail. */
  navigable?: boolean;
  /** Content without entries; "No data" by default. */
  renderEmpty?: () => ReactNode;
  /** Number of all entries when more can be loaded; shows a button to load more. */
  total?: number;
  /** Loads more entries; called by the button at the end. */
  onLoadMore?: () => void;
  /** Shows that entries are being loaded. */
  loading?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A list of entries with title, description, icon, information and status.
 * Entries can be chosen to navigate and selected singly or multiply; more
 * entries can be loaded at the end.
 *
 * Keyboard: Tab moves to the list; arrow keys move between entries, Home and
 * End to the first and last, typing jumps to an entry. Enter chooses an
 * entry, Space selects it.
 */
export function List({
  items,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  onItemPress,
  navigable = false,
  renderEmpty,
  total,
  onLoadMore,
  loading = false,
  className,
  ref,
  ...aria
}: ListProps) {
  const t = useText();
  const { locale } = useLocale();
  const [selected, setSelected] = useControllableState<ReadonlySet<string>>(
    selectedKeys,
    () => defaultSelectedKeys ?? new Set(),
    onSelectionChange,
  );
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const focusPending = useRef(false);
  const typed = useRef({ text: '', at: 0 });
  const selectable = selectionMode !== 'none';

  useEffect(() => {
    if (active >= items.length && items.length > 0) setActive(items.length - 1);
  }, [items.length, active]);
  useEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    itemRefs.current[active]?.focus();
  }, [active]);

  const toggle = (item: ListEntry) => {
    if (item.disabled || !selectable) return;
    if (selectionMode === 'single') setSelected(new Set(selected.has(item.key) ? [] : [item.key]));
    else {
      const next = new Set(selected);
      if (next.has(item.key)) next.delete(item.key);
      else next.add(item.key);
      setSelected(next);
    }
  };
  const press = (item: ListEntry) => {
    if (item.disabled) return;
    if (onItemPress) onItemPress(item);
    else toggle(item);
  };
  const move = (index: number) => {
    if (items.length === 0) return;
    focusPending.current = true;
    setActive(Math.max(0, Math.min(index, items.length - 1)));
  };

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const item = items[index]!;
    switch (event.key) {
      case 'ArrowDown':
        move(index + 1);
        break;
      case 'ArrowUp':
        move(index - 1);
        break;
      case 'Home':
        move(0);
        break;
      case 'End':
        move(items.length - 1);
        break;
      case 'Enter':
        press(item);
        break;
      case ' ':
        if (selectable) toggle(item);
        else press(item);
        break;
      default: {
        if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
        const now = Date.now();
        typed.current = {
          text: now - typed.current.at < 700 ? typed.current.text + event.key : event.key,
          at: now,
        };
        const query = typed.current.text.toLocaleLowerCase(locale);
        for (let step = 1; step <= items.length; step++) {
          const i = (index + step) % items.length;
          const entry = items[i]!;
          const text = entry.textValue ?? (typeof entry.title === 'string' ? entry.title : '');
          if (text.toLocaleLowerCase(locale).startsWith(query)) {
            move(i);
            break;
          }
        }
      }
    }
    event.preventDefault();
  };

  if (items.length === 0 && !loading) {
    return (
      <div ref={ref} className={cx('trui-list', 'trui-list--empty', className)}>
        {renderEmpty?.() ?? t('common.noData')}
      </div>
    );
  }

  return (
    <div ref={ref} className={cx('trui-list', className)} aria-busy={loading || undefined}>
      <ul
        {...(selectable
          ? { role: 'listbox', 'aria-multiselectable': selectionMode === 'multiple' || undefined }
          : { role: 'list' })}
        className="trui-list__items"
        {...aria}
      >
        {items.map((item, index) => {
          const isSelected = selected.has(item.key);
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the entry handles the keyboard
            <li
              key={item.key}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              {...(selectable
                ? { role: 'option', 'aria-selected': isSelected }
                : { role: 'listitem' })}
              aria-disabled={item.disabled || undefined}
              tabIndex={index === active ? 0 : -1}
              className={cx(
                'trui-list__item',
                isSelected && 'trui-list__item--selected',
                (onItemPress || selectable) && !item.disabled && 'trui-list__item--interactive',
              )}
              onClick={() => {
                setActive(index);
                press(item);
              }}
              onKeyDown={(e) => onKeyDown(e, index)}
              onFocus={() => setActive(index)}
            >
              {selectionMode === 'multiple' && (
                <span className="trui-list__check" aria-hidden="true">
                  {isSelected && <Icon icon={checkIcon} size="s" />}
                </span>
              )}
              {item.avatar ?? (item.icon && <Icon icon={item.icon} className="trui-list__icon" />)}
              <span className="trui-list__text">
                <span className="trui-list__title">{item.title}</span>
                {item.description !== undefined && (
                  <span className="trui-list__description">{item.description}</span>
                )}
              </span>
              {(item.info !== undefined || item.status) && (
                <span className="trui-list__end">
                  {item.info !== undefined && <span className="trui-list__info">{item.info}</span>}
                  {item.status && <Tag tone={item.status.tone}>{item.status.label}</Tag>}
                </span>
              )}
              {navigable && (
                <Icon icon={chevronRightIcon} size="s" className="trui-list__chevron" />
              )}
            </li>
          );
        })}
      </ul>
      {total !== undefined && items.length < total && onLoadMore && (
        <div className="trui-list__more">
          <Button variant="text" loading={loading} onClick={onLoadMore}>
            {t('list.loadMore')} ({t('list.shown', { shown: items.length, total })})
          </Button>
        </div>
      )}
    </div>
  );
}
