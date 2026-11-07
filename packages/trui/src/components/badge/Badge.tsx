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

import { useLocale, useText } from '@tim-riep/trui/core';
import type { HTMLAttributes, Ref } from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link Badge}. */
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** The number shown. */
  count: number;
  /** Larger numbers show as `max+`. */
  max?: number;
  /** `accent` (default) for counts, `error` for counts that need attention, `neutral` for plain ones. */
  tone?: 'accent' | 'error' | 'neutral';
  /**
   * What the number means for assistive technology, e.g. "3 unread
   * notifications". Without it, only the number is read.
   */
  label?: string;
  /** Shows the badge also for zero; hidden by default. */
  showZero?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

/** A small count, e.g. of unread notifications or items in a tab. */
export function Badge({
  count,
  max = 99,
  tone = 'accent',
  label,
  showZero = false,
  className,
  ref,
  ...rest
}: BadgeProps) {
  const t = useText();
  const { locale } = useLocale();
  if (count === 0 && !showZero) return null;
  const text =
    count > max ? t('badge.overflow', { max }) : new Intl.NumberFormat(locale).format(count);
  return (
    <span ref={ref} className={cx('trui-badge', `trui-badge--${tone}`, className)} {...rest}>
      <span aria-hidden={label ? true : undefined}>{text}</span>
      {label && <span className="trui-visually-hidden">{label}</span>}
    </span>
  );
}
