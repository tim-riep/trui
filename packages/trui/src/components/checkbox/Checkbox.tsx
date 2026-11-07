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

import { useControllableState, useFormReset, type ValueState } from '@tim-riep/trui/core';
import {
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { checkIcon } from '../../icons/set/check';
import { minusIcon } from '../../icons/set/minus';
import { cx } from '../../internal/class-names';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { ValueStateMessage } from '../../internal/field/ValueStateMessage';
import { Icon } from '../icon/Icon';

/** Props of {@link Checkbox}. */
export interface CheckboxProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children' | 'className' | 'style'
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Shows a dash for "partly checked", e.g. for a group of which some are checked. */
  indeterminate?: boolean;
  /** Text next to the box; clicking it toggles the box. */
  children?: ReactNode;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

/**
 * A box to turn an option on or off. A native checkbox: it submits `value`
 * (default "on") under `name` when checked and takes part in form reset.
 *
 * Keyboard: Space toggles it.
 */
export function Checkbox(props: CheckboxProps) {
  const {
    checked,
    defaultChecked = false,
    onChange,
    indeterminate = false,
    children,
    valueState,
    valueStateMessage,
    className,
    style,
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const field = useFieldProps(props);
  const [current, setCurrent] = useControllableState<boolean, [ChangeEvent<HTMLInputElement>?]>(
    checked,
    defaultChecked,
    onChange as ((v: boolean, e?: ChangeEvent<HTMLInputElement>) => void) | undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useFormReset(inputRef, () => {
    if (checked === undefined) setCurrent(defaultChecked);
  });
  useLayoutEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  return (
    <div
      className={cx(
        'trui-checkbox',
        info.state !== 'none' && `trui-checkbox--${info.state}`,
        field.disabled && 'trui-checkbox--disabled',
        className,
      )}
      style={style}
    >
      <label className="trui-checkbox__label">
        <span className="trui-checkbox__box">
          <input
            ref={inputRef}
            id={field.id}
            type="checkbox"
            className="trui-checkbox__input"
            checked={current}
            required={field.required}
            disabled={field.disabled}
            aria-invalid={info.invalid}
            aria-describedby={info.describedBy}
            onChange={(event) => setCurrent(event.target.checked, event)}
            {...rest}
          />
          <Icon
            icon={indeterminate ? minusIcon : checkIcon}
            size="s"
            className="trui-checkbox__mark"
          />
        </span>
        {children !== undefined && <span className="trui-checkbox__text">{children}</span>}
      </label>
      <ValueStateMessage info={info} />
    </div>
  );
}
