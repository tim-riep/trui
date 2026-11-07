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

import type { ListItem } from '@tim-riep/trui/core';
import { type ReactNode, useEffect, useRef } from 'react';
import { Icon } from '../../components/icon/Icon';
import { checkIcon } from '../../icons/set/check';
import { cx } from '../class-names';
import { optionId } from './navigation';

export interface ListboxProps {
  id: string;
  items: readonly ListItem[];
  /** Values that are selected. */
  selected: ReadonlySet<string>;
  /** Index of the option that the keyboard is on, or -1. */
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  onSelect: (item: ListItem) => void;
  multiple?: boolean;
  /** Shown instead of the options, e.g. while loading or without matches. */
  status?: ReactNode;
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;
}

/**
 * The options of a selection. Focus stays on the input or button that owns
 * the list; it points to the active option with `aria-activedescendant`.
 */
export function Listbox({
  id,
  items,
  selected,
  activeIndex,
  onActiveIndexChange,
  onSelect,
  multiple = false,
  status,
  ...aria
}: ListboxProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeIndex < 0) return;
    document.getElementById(optionId(id, activeIndex))?.scrollIntoView({ block: 'nearest' });
  }, [id, activeIndex]);
  return (
    <>
      {status !== undefined && (
        <div className="trui-listbox__status" role="status">
          {status}
        </div>
      )}
      <div
        ref={ref}
        id={id}
        role="listbox"
        className="trui-listbox"
        aria-multiselectable={multiple || undefined}
        tabIndex={-1}
        hidden={items.length === 0}
        {...aria}
      >
        {items.map((item, index) => {
          const isSelected = selected.has(item.value);
          return (
            // biome-ignore lint/a11y/useKeyWithClickEvents: the owning input handles the keyboard
            // biome-ignore lint/a11y/useFocusableInteractive: options are reached through aria-activedescendant
            <div
              key={item.value}
              id={optionId(id, index)}
              role="option"
              aria-selected={isSelected}
              aria-disabled={item.disabled || undefined}
              className={cx(
                'trui-listbox__option',
                index === activeIndex && 'trui-listbox__option--active',
                isSelected && 'trui-listbox__option--selected',
              )}
              onMouseDown={(e) => e.preventDefault()}
              onMouseMove={() =>
                index !== activeIndex && !item.disabled && onActiveIndexChange(index)
              }
              onClick={() => !item.disabled && onSelect(item)}
            >
              {multiple && (
                <span className="trui-listbox__check" aria-hidden="true">
                  {isSelected && <Icon icon={checkIcon} size="s" />}
                </span>
              )}
              {item.icon && <Icon icon={item.icon} size="s" />}
              <span className="trui-listbox__text">
                <span className="trui-listbox__label">{item.label}</span>
                {item.description && (
                  <span className="trui-listbox__description">{item.description}</span>
                )}
              </span>
              {!multiple && isSelected && (
                <Icon icon={checkIcon} size="s" className="trui-listbox__selected-icon" />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
