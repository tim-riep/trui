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

import {
  addDays,
  addMonths,
  type DateString,
  dateParts,
  firstDayOfWeek,
  formatDate,
  makeDate,
  monthNames,
  today,
  useLocale,
  useText,
  weekday,
  weekdayNames,
} from '@tim-riep/trui/core';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { chevronLeftIcon } from '../../icons/set/chevron-left';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';

/** Props of {@link Calendar}. */
export interface CalendarProps {
  /** The selected date, or null. */
  value: DateString | null;
  /** Called with the date the user picks. */
  onSelect: (date: DateString) => void;
  /** Earliest date that can be picked. */
  min?: DateString | undefined;
  /** Latest date that can be picked. */
  max?: DateString | undefined;
  /** Moves focus to the focused day when shown. */
  autoFocus?: boolean;
  /** Called on Escape, e.g. to close the popup the calendar is in. */
  onEscape?: () => void;
  /** Shows a button below the month that picks today. */
  showToday?: boolean;
  className?: string;
}

/**
 * A month of days to pick a date from.
 *
 * Keyboard: arrow keys move by day and week, Home and End to the start and
 * end of the week, Page Up and Page Down by month (with Shift by year),
 * Enter or Space picks the focused day.
 */
export function Calendar({
  value,
  onSelect,
  min,
  max,
  autoFocus = false,
  onEscape,
  showToday = false,
  className,
}: CalendarProps) {
  const t = useText();
  const { locale, timeZone } = useLocale();
  const now = today(timeZone);
  const [focused, setFocused] = useState<DateString>(value ?? now);
  const gridRef = useRef<HTMLTableElement>(null);
  const titleId = useId();
  const moved = useRef(autoFocus);

  // biome-ignore lint/correctness/useExhaustiveDependencies: moves focus whenever the focused day changes
  useEffect(() => {
    if (!moved.current) return;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
  }, [focused]);

  const { year, month } = dateParts(focused);
  const first = makeDate(year, month, 1)!;
  const weekStart = firstDayOfWeek(locale);
  const offset = (weekday(first) - weekStart + 7) % 7;
  const start = addDays(first, -offset);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const names = weekdayNames(locale, 'short');
  const headers = Array.from({ length: 7 }, (_, i) => names[(weekStart - 1 + i) % 7]!);
  const outOfRange = (d: DateString) =>
    (min !== undefined && d < min) || (max !== undefined && d > max);

  const move = (to: DateString) => {
    moved.current = true;
    setFocused(to);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const dirSign = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1;
    const startOfWeek = (weekday(focused) - weekStart + 7) % 7;
    const targetOf = (key: string): DateString | null => {
      switch (key) {
        case 'ArrowLeft':
          return addDays(focused, -dirSign);
        case 'ArrowRight':
          return addDays(focused, dirSign);
        case 'ArrowUp':
          return addDays(focused, -7);
        case 'ArrowDown':
          return addDays(focused, 7);
        case 'Home':
          return addDays(focused, -startOfWeek);
        case 'End':
          return addDays(focused, 6 - startOfWeek);
        case 'PageUp':
          return addMonths(focused, event.shiftKey ? -12 : -1);
        case 'PageDown':
          return addMonths(focused, event.shiftKey ? 12 : 1);
        default:
          return null;
      }
    };
    if (event.key === 'Escape' && onEscape) {
      event.preventDefault();
      event.stopPropagation();
      onEscape();
      return;
    }
    const target = targetOf(event.key);
    if (!target) return;
    event.preventDefault();
    move(target);
  };

  const title = `${monthNames(locale)[month - 1]} ${new Intl.NumberFormat(locale, { useGrouping: false }).format(year)}`;
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7));

  return (
    <div className={cx('trui-calendar', className)}>
      <div className="trui-calendar__header">
        <Button
          variant="text"
          icon={chevronLeftIcon}
          aria-label={t('calendar.previousMonth')}
          onClick={() => move(addMonths(focused, -1))}
        />
        <div id={titleId} className="trui-calendar__title" aria-live="polite">
          {title}
        </div>
        <Button
          variant="text"
          icon={chevronRightIcon}
          aria-label={t('calendar.nextMonth')}
          onClick={() => move(addMonths(focused, 1))}
        />
      </div>
      <table
        ref={gridRef}
        // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a table as grid is the pattern for date pickers
        role="grid"
        className="trui-calendar__grid"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
      >
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col" abbr={h}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week) => (
            <tr key={week[0]}>
              {week.map((day) => {
                const parts = dateParts(day);
                const disabled = outOfRange(day);
                return (
                  // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: cells of the date grid; the button inside takes focus
                  // biome-ignore lint/a11y/useFocusableInteractive: the button inside the cell takes focus
                  <td key={day} role="gridcell" aria-selected={day === value}>
                    <button
                      type="button"
                      tabIndex={day === focused ? 0 : -1}
                      className={cx(
                        'trui-calendar__day',
                        parts.month !== month && 'trui-calendar__day--outside',
                        day === value && 'trui-calendar__day--selected',
                        day === now && 'trui-calendar__day--today',
                      )}
                      aria-label={formatDate(day, locale, 'full')}
                      aria-current={day === now ? 'date' : undefined}
                      aria-disabled={disabled || undefined}
                      data-date={day}
                      onClick={() => {
                        moved.current = true;
                        setFocused(day);
                        if (!disabled) onSelect(day);
                      }}
                    >
                      {new Intl.NumberFormat(locale).format(parts.day)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {showToday && (
        <div className="trui-calendar__footer">
          <Button
            variant="text"
            disabled={outOfRange(now)}
            onClick={() => {
              setFocused(now);
              onSelect(now);
            }}
          >
            {t('calendar.today')}
          </Button>
        </div>
      )}
    </div>
  );
}
