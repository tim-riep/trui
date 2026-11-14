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
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';

/** An active filter. */
export interface FilterChip {
  key: string;
  /** What the filter keeps, e.g. "Status: Open". */
  label: string;
}

/** Props of {@link FilterChips}. */
export interface FilterChipsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The active filters; nothing is shown without any. */
  items: readonly FilterChip[];
  /** Called with the key of the filter the user removes. */
  onRemove: (key: string) => void;
  /** Called by the button that removes all filters; without it, the button is not shown. */
  onClearAll?: () => void;
  /** Content after the chips, e.g. the number of results. */
  endContent?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The active filters of a list or table as chips, each with a button that
 * removes it, and a button that removes all of them.
 *
 * Keyboard: Tab reaches the remove button of each chip; Enter or Space removes it.
 */
export function FilterChips({
  items,
  onRemove,
  onClearAll,
  endContent,
  className,
  ref,
  ...rest
}: FilterChipsProps) {
  const t = useText();
  if (items.length === 0 && endContent === undefined) return null;
  return (
    <div ref={ref} className={cx('trui-filter-chips', className)} {...rest}>
      {items.length > 0 && (
        <ul className="trui-filter-chips__list" aria-label={t('filter.active')}>
          {items.map((item) => (
            <li key={item.key} className="trui-filter-chips__chip">
              <span className="trui-filter-chips__label">{item.label}</span>
              <button
                type="button"
                className="trui-filter-chips__remove"
                aria-label={t('filter.remove', { label: item.label })}
                title={t('filter.remove', { label: item.label })}
                onClick={() => onRemove(item.key)}
              >
                <Icon icon={closeIcon} size="s" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {onClearAll && items.length > 1 && (
        <Button variant="text" onClick={onClearAll}>
          {t('filter.clearAll')}
        </Button>
      )}
      {endContent !== undefined && <div className="trui-filter-chips__end">{endContent}</div>}
    </div>
  );
}
