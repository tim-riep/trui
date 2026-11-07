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
import { type CSSProperties, type HTMLAttributes, type ReactNode, type Ref, useId } from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link ProgressBar}. */
export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Progress between 0 and `max`; without it the bar shows activity of unknown duration. */
  value?: number;
  /** The value of completion; 100 by default. */
  max?: number;
  /** Visible label above the bar, which also names it for assistive technology. */
  label?: ReactNode;
  /** Shows the progress in percent next to the label. */
  showValue?: boolean;
  /** Color by meaning; `accent` by default. */
  tone?: 'accent' | 'success' | 'warning' | 'error';
  ref?: Ref<HTMLDivElement>;
}

/** Progress of an operation, known (with `value`) or unknown. */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = false,
  tone = 'accent',
  className,
  style,
  ref,
  ...rest
}: ProgressBarProps) {
  const t = useText();
  const { locale } = useLocale();
  const labelId = useId();
  const ratio = value === undefined ? undefined : Math.min(Math.max(value / max, 0), 1);
  const percent =
    ratio === undefined
      ? ''
      : new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(ratio);
  return (
    <div className={cx('trui-progress', `trui-progress--${tone}`, className)} style={style}>
      {(label !== undefined || (showValue && ratio !== undefined)) && (
        <div className="trui-progress__header">
          <span id={labelId}>{label}</span>
          {showValue && ratio !== undefined && <span aria-hidden="true">{percent}</span>}
        </div>
      )}
      <div
        ref={ref}
        role="progressbar"
        className={cx(
          'trui-progress__track',
          ratio === undefined && 'trui-progress__track--indeterminate',
        )}
        aria-labelledby={label !== undefined ? labelId : undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={ratio === undefined ? undefined : Math.round(ratio * 100)}
        aria-valuetext={
          ratio === undefined ? undefined : t('progress.value', { value: Math.round(ratio * 100) })
        }
        {...rest}
      >
        <div
          className="trui-progress__fill"
          style={
            ratio === undefined ? undefined : ({ '--trui-progress-ratio': ratio } as CSSProperties)
          }
        />
      </div>
    </div>
  );
}
