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

import type { IconDefinition } from '@tim-riep/trui/core';
import type { HTMLAttributes, Ref } from 'react';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Meaning of a tag, shown by its color. */
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'information';

/** Props of {@link Tag}. */
export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Icon before the text, as definition or registered name. */
  icon?: IconDefinition | string;
  ref?: Ref<HTMLSpanElement>;
}

/**
 * A short label for a status or category, e.g. "Released" or "Overdue". The
 * text carries the meaning; the color only supports it.
 */
export function Tag({ tone = 'neutral', icon, className, children, ref, ...rest }: TagProps) {
  return (
    <span ref={ref} className={cx('trui-tag', `trui-tag--${tone}`, className)} {...rest}>
      {icon &&
        (typeof icon === 'string' ? <Icon name={icon} size="s" /> : <Icon icon={icon} size="s" />)}
      <span className="trui-tag__text">{children}</span>
    </span>
  );
}
