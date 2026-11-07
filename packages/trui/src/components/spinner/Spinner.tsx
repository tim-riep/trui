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
import { type HTMLAttributes, type Ref, useEffect, useState } from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link Spinner}. */
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  size?: 's' | 'm' | 'l';
  /** Text for assistive technology; "Loading…" in the current language by default. */
  label?: string;
  /**
   * Waits this many milliseconds before showing anything, so that short
   * loading does not flicker.
   */
  delay?: number;
  ref?: Ref<HTMLSpanElement>;
}

/** Shows that something is loading or running, without a known duration. */
export function Spinner({ size = 'm', label, delay = 0, className, ref, ...rest }: SpinnerProps) {
  const t = useText();
  const [visible, setVisible] = useState(delay <= 0);
  useEffect(() => {
    if (delay <= 0) return;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  if (!visible) return null;
  return (
    <span
      ref={ref}
      role="status"
      className={cx('trui-spinner', `trui-spinner--${size}`, className)}
      {...rest}
    >
      <span className="trui-spinner__circle" aria-hidden="true" />
      <span className="trui-visually-hidden">{label ?? t('common.loading')}</span>
    </span>
  );
}
