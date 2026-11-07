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
  type ReactNode,
  type Ref,
  useId,
  useRef,
} from 'react';
import { cx } from '../../internal/class-names';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { ValueStateMessage } from '../../internal/field/ValueStateMessage';

/** An option of a {@link RadioGroup}. */
export interface RadioOption {
  value: string;
  label: ReactNode;
  /** A second line below the label. */
  description?: ReactNode;
  disabled?: boolean;
}

/** Props of {@link RadioGroup}. */
export interface RadioGroupProps {
  options: readonly RadioOption[];
  /** The selected value; `null` while no option is selected. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Name of the radio buttons in a native form; generated if not given. */
  name?: string;
  form?: string;
  /** Visible label of the group; inside a form field the label of the field is used. */
  label?: ReactNode;
  orientation?: 'vertical' | 'horizontal';
  required?: boolean;
  disabled?: boolean;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  id?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A choice of one of a few options, all visible. Native radio buttons with a
 * common name: they submit the selected value and take part in form reset.
 *
 * Keyboard: Tab moves into the group to the selected option; arrow keys
 * select the next or previous option.
 *
 * Without a selection the value is `null`; the user cannot clear a selection.
 */
export function RadioGroup(props: RadioGroupProps) {
  const {
    options,
    value,
    defaultValue = null,
    onChange,
    name,
    form,
    label,
    orientation = 'vertical',
    valueState,
    valueStateMessage,
    className,
    style,
    ref,
  } = props;
  const field = useFieldProps(props);
  const generatedName = useId();
  const labelId = useId();
  const [current, setCurrent] = useControllableState<
    string | null,
    [ChangeEvent<HTMLInputElement>?]
  >(
    value,
    defaultValue,
    onChange as ((v: string | null, e?: ChangeEvent<HTMLInputElement>) => void) | undefined,
  );
  const groupRef = useRef<HTMLDivElement>(null);
  useFormReset(groupRef, () => {
    if (value === undefined) setCurrent(defaultValue);
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  const labelledBy = label !== undefined ? labelId : field.labelId;
  return (
    <div
      ref={(el) => {
        groupRef.current = el;
        if (typeof ref === 'function') ref(el);
        else if (ref) ref.current = el;
      }}
      id={field.id}
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={props['aria-label']}
      aria-describedby={info.describedBy}
      aria-required={field.required || undefined}
      aria-invalid={info.invalid}
      aria-orientation={orientation}
      className={cx(
        'trui-radio-group',
        `trui-radio-group--${orientation}`,
        info.state !== 'none' && `trui-radio-group--${info.state}`,
        className,
      )}
      style={style}
    >
      {label !== undefined && (
        <div id={labelId} className="trui-radio-group__label">
          {label}
        </div>
      )}
      <div className="trui-radio-group__options">
        {options.map((option) => {
          const disabled = field.disabled || option.disabled;
          return (
            <label
              key={option.value}
              className={cx('trui-radio', disabled && 'trui-radio--disabled')}
            >
              <input
                type="radio"
                className="trui-radio__input"
                name={name ?? generatedName}
                form={form}
                value={option.value}
                checked={current === option.value}
                required={field.required}
                disabled={disabled}
                onChange={(event) => event.target.checked && setCurrent(option.value, event)}
              />
              <span className="trui-radio__text">
                {option.label}
                {option.description !== undefined && (
                  <span className="trui-radio__description">{option.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      <ValueStateMessage info={info} />
    </div>
  );
}
