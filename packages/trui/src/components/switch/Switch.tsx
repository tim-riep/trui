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

import { useControllableState, useFormReset } from '@tim-riep/trui/core';
import {
  type ChangeEvent,
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useRef,
} from 'react';
import { cx } from '../../internal/class-names';
import { useFieldProps } from '../../internal/field/use-field-props';

/** Props of {@link Switch}. */
export interface SwitchProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'checked' | 'defaultChecked' | 'onChange' | 'children' | 'className' | 'style' | 'role'
  > {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean, event: ChangeEvent<HTMLInputElement>) => void;
  /** Text next to the switch; clicking it toggles the switch. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

/**
 * A switch for a setting that takes effect at once. A native checkbox with the
 * role `switch`: it submits under `name` when on.
 *
 * Keyboard: Space toggles it.
 */
export function Switch(props: SwitchProps) {
  const {
    checked,
    defaultChecked = false,
    onChange,
    children,
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
  return (
    <label
      className={cx('trui-switch', field.disabled && 'trui-switch--disabled', className)}
      style={style}
    >
      <input
        ref={inputRef}
        id={field.id}
        type="checkbox"
        role="switch"
        aria-checked={current}
        className="trui-switch__input"
        checked={current}
        required={field.required}
        disabled={field.disabled}
        aria-describedby={field.describedBy}
        onChange={(event) => setCurrent(event.target.checked, event)}
        {...rest}
      />
      <span className="trui-switch__track" aria-hidden="true">
        <span className="trui-switch__thumb" />
      </span>
      {children !== undefined && <span className="trui-switch__text">{children}</span>}
    </label>
  );
}
