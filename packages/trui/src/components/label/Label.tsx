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

import type { LabelHTMLAttributes, Ref } from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link Label}. */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Shows the required marker. It is hidden from assistive technology; the
   * field itself states that it is required.
   */
  required?: boolean;
  /** Adds a colon after the text, for labels beside their field. */
  showColon?: boolean;
  /** Shows the label as belonging to a disabled field. */
  disabled?: boolean;
  /** Cuts the label to one line with an ellipsis instead of wrapping. */
  truncate?: boolean;
  ref?: Ref<HTMLLabelElement>;
}

/** The label of a field. Connect it with `htmlFor` to the id of the field. */
export function Label({
  required = false,
  showColon = false,
  disabled = false,
  truncate = false,
  className,
  children,
  ref,
  ...rest
}: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: the caller connects the label through htmlFor
    <label
      ref={ref}
      className={cx(
        'trui-label',
        disabled && 'trui-label--disabled',
        truncate && 'trui-label--truncate',
        className,
      )}
      {...rest}
    >
      <span className="trui-label__text">
        {children}
        {showColon && ':'}
      </span>
      {required && (
        <span className="trui-label__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
