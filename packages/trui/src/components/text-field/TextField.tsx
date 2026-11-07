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
  HiddenValue,
  useControllableState,
  useFormReset,
  type ValueState,
} from '@tim-riep/trui/core';
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
import { useValueState } from '../../internal/field/use-value-state';
import { ValueStateMessage } from '../../internal/field/ValueStateMessage';

export interface TextFieldBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'size'
    | 'prefix'
    | 'children'
    | 'className'
    | 'style'
  > {
  /** Kind of text; changes the keyboard on touch devices and the autofill. */
  type?: 'text' | 'email' | 'url' | 'tel' | 'password' | 'search';
  /** State of the value: colors the field and announces the message. */
  valueState?: ValueState;
  /** Message of the value state, shown below the field. */
  valueStateMessage?: ReactNode;
  /** Content before the text, e.g. an icon or a unit. */
  startContent?: ReactNode;
  /** Content after the text, e.g. a unit or a button. */
  endContent?: ReactNode;
  /** Class of the outermost element. */
  className?: string;
  /** Style of the outermost element. */
  style?: CSSProperties;
  /** Ref to the input element. */
  ref?: Ref<HTMLInputElement>;
}

export interface TextFieldNotNullable {
  /** Without `nullable`, clearing the field gives `""`. */
  nullable?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
}

export interface TextFieldNullable {
  /**
   * The field distinguishes "no value" from the empty string: clearing it
   * gives `null`. A `null` value is left out of native form submission.
   */
  nullable: true;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, event: ChangeEvent<HTMLInputElement>) => void;
}

/** Props of {@link TextField}. */
export type TextFieldProps = TextFieldBaseProps & (TextFieldNotNullable | TextFieldNullable);

/**
 * A single-line text input. Controlled with `value` and `onChange`, or
 * uncontrolled with `defaultValue`; inside a native form it submits its
 * value under `name` and returns to `defaultValue` on reset.
 */
export function TextField(props: TextFieldProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    type = 'text',
    valueState,
    valueStateMessage,
    startContent,
    endContent,
    className,
    style,
    name,
    form,
    disabled,
    readOnly,
    ref,
    'aria-describedby': describedBy,
    ...inputProps
  } = props;
  const initial = defaultValue !== undefined ? defaultValue : nullable ? null : '';
  const [current, setCurrent] = useControllableState<
    string | null,
    [ChangeEvent<HTMLInputElement>?]
  >(
    value,
    initial,
    onChange as ((v: string | null, e?: ChangeEvent<HTMLInputElement>) => void) | undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial);
  });
  const info = useValueState(valueState, valueStateMessage, describedBy);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setCurrent(text === '' && nullable ? null : text, event);
  };

  return (
    <div
      className={cx(
        'trui-field',
        'trui-text-field',
        info.state !== 'none' && `trui-field--${info.state}`,
        disabled && 'trui-field--disabled',
        readOnly && 'trui-field--readonly',
        className,
      )}
      style={style}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a click on the box focuses the input; the input itself is the control */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input directly */}
      <div className="trui-field__control" onClick={() => inputRef.current?.focus()}>
        {startContent !== undefined && (
          <span className="trui-field__adornment">{startContent}</span>
        )}
        <input
          ref={inputRef}
          className="trui-field__input"
          type={type}
          // With nullable, a hidden input carries the value so that null can be left out.
          name={nullable ? undefined : name}
          form={form}
          value={current ?? ''}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={info.invalid}
          aria-describedby={info.describedBy}
          onChange={handleChange}
          {...inputProps}
        />
        {endContent !== undefined && <span className="trui-field__adornment">{endContent}</span>}
      </div>
      {nullable && <HiddenValue name={name} value={current} form={form} disabled={disabled} />}
      <ValueStateMessage info={info} />
    </div>
  );
}
