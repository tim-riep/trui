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
import {
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { chevronLeftIcon } from '../../icons/set/chevron-left';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';

/** A tab of {@link Tabs}. */
export interface TabItem {
  key: string;
  label: string;
  icon?: IconDefinition;
  /** A number after the label, e.g. of items in the tab. */
  count?: number;
  disabled?: boolean;
  /** Content of the tab; alternatively use `renderPanel`. */
  content?: ReactNode;
}

/** Props of {@link Tabs}. */
export interface TabsProps {
  items: readonly TabItem[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  /**
   * `automatic` selects a tab as soon as the arrow keys reach it; `manual`
   * waits for Enter or Space, for tabs whose content takes long to show.
   */
  activation?: 'automatic' | 'manual';
  /** Content of the selected tab, if the items have none. */
  renderPanel?: (key: string) => ReactNode;
  /** Keeps the content of tabs that are not selected in the document, hidden. */
  keepMounted?: boolean;
  /** Name of the tabs for assistive technology. */
  'aria-label'?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Sections of content of which one is shown at a time. Tabs that do not fit
 * scroll horizontally.
 *
 * Keyboard: Tab moves to the selected tab and then into its content; arrow
 * keys move between tabs, Home and End to the first and last.
 */
export function Tabs({
  items,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  activation = 'automatic',
  renderPanel,
  keepMounted = false,
  className,
  ref,
  ...aria
}: TabsProps) {
  const t = useText();
  const { dir } = useLocale();
  const id = useId();
  const firstEnabled = items.find((i) => !i.disabled)?.key ?? '';
  const [selected, setSelected] = useControllableState(
    selectedKey,
    defaultSelectedKey ?? firstEnabled,
    onSelectionChange,
  );
  const [focused, setFocused] = useState(selected);
  const listRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const scrolled = Math.abs(list.scrollLeft);
      setOverflow({ start: scrolled > 1, end: scrolled + list.clientWidth < list.scrollWidth - 1 });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    list.addEventListener('scroll', update, { passive: true });
    return () => {
      observer.disconnect();
      list.removeEventListener('scroll', update);
    };
  }, []);

  const tabId = (key: string) => `${id}-tab-${key}`;
  const panelId = (key: string) => `${id}-panel-${key}`;
  const focusTab = (key: string) => {
    setFocused(key);
    const el = document.getElementById(tabId(key));
    el?.focus();
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (activation === 'automatic') setSelected(key);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const enabled = items.filter((i) => !i.disabled).map((i) => i.key);
    const at = enabled.indexOf(focused);
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    let next: string | undefined;
    if (event.key === forward) next = enabled[(at + 1) % enabled.length];
    else if (event.key === back) next = enabled[(at - 1 + enabled.length) % enabled.length];
    else if (event.key === 'Home') next = enabled[0];
    else if (event.key === 'End') next = enabled[enabled.length - 1];
    else if ((event.key === 'Enter' || event.key === ' ') && activation === 'manual') {
      event.preventDefault();
      setSelected(focused);
      return;
    }
    if (next === undefined) return;
    event.preventDefault();
    focusTab(next);
  };

  const scrollBy = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    list.scrollBy({
      left: direction * (dir === 'rtl' ? -1 : 1) * list.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  const panels = keepMounted ? items : items.filter((i) => i.key === selected);
  return (
    <div ref={ref} className={cx('trui-tabs', className)}>
      <div className="trui-tabs__bar">
        {overflow.start && (
          <Button
            variant="text"
            icon={chevronLeftIcon}
            aria-label={t('tabs.scrollStart')}
            tabIndex={-1}
            className="trui-tabs__scroll"
            onClick={() => scrollBy(-1)}
          />
        )}
        <div
          ref={listRef}
          role="tablist"
          className="trui-tabs__list"
          onKeyDown={onKeyDown}
          {...aria}
        >
          {items.map((item) => (
            <button
              key={item.key}
              id={tabId(item.key)}
              type="button"
              role="tab"
              aria-selected={item.key === selected}
              aria-controls={keepMounted || item.key === selected ? panelId(item.key) : undefined}
              aria-disabled={item.disabled || undefined}
              tabIndex={item.key === selected ? 0 : -1}
              className={cx('trui-tabs__tab', item.key === selected && 'trui-tabs__tab--selected')}
              onClick={() => {
                if (item.disabled) return;
                setFocused(item.key);
                setSelected(item.key);
              }}
              onFocus={() => setFocused(item.key)}
            >
              {item.icon && <Icon icon={item.icon} size="s" />}
              <span>{item.label}</span>
              {item.count !== undefined && <Badge count={item.count} tone="neutral" showZero />}
            </button>
          ))}
        </div>
        {overflow.end && (
          <Button
            variant="text"
            icon={chevronRightIcon}
            aria-label={t('tabs.scrollEnd')}
            tabIndex={-1}
            className="trui-tabs__scroll"
            onClick={() => scrollBy(1)}
          />
        )}
      </div>
      {panels.map((item) => (
        <div
          key={item.key}
          id={panelId(item.key)}
          role="tabpanel"
          aria-labelledby={tabId(item.key)}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: a tab panel takes focus when it has no focusable content
          tabIndex={0}
          hidden={item.key !== selected}
          className="trui-tabs__panel"
        >
          {item.content ?? renderPanel?.(item.key)}
        </div>
      ))}
    </div>
  );
}
