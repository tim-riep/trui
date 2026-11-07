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
  addDecimal,
  checkLimits,
  compareDecimal,
  type DecimalString,
  formatDecimal,
  HiddenValue,
  parseLocalizedDecimal,
  subtractDecimal,
  useControllableState,
  useFormReset,
  useLocale,
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import {
  type CSSProperties,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { effectiveValueState, useFieldProps } from '../../internal/field/use-field-props';
import { useParsedText } from '../../internal/field/use-parsed-text';
import { useValueState } from '../../internal/field/use-value-state';

export interface NumberFieldBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'min'
    | 'max'
    | 'step'
    | 'size'
    | 'prefix'
    | 'children'
    | 'className'
    | 'style'
  > {
  /**
   * Digits after the decimal separator. The value always has exactly this
   * many; more digits in the input are an error, never rounded.
   */
  scale?: number;
  /** Largest number of digits before the decimal separator. */
  integerDigits?: number;
  /** Smallest allowed value, as canonical decimal. */
  min?: DecimalString;
  /** Largest allowed value, as canonical decimal. */
  max?: DecimalString;
  /** Arrow up and down change the value by this amount, as canonical decimal. */
  step?: DecimalString;
  /** Group separators in the display when the field is not being edited. On by default. */
  grouping?: boolean;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface NumberFieldNotNullable {
  /** Without `nullable`, an empty field has the value `""`. */
  nullable?: false;
  /** The value as canonical decimal (`"1234.50"`), or `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface NumberFieldNullable {
  /** An empty field has the value `null`, which is left out of native form submission. */
  nullable: true;
  /** The value as canonical decimal (`"1234.50"`), or `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

/** Props of {@link NumberField}. */
export type NumberFieldProps = NumberFieldBaseProps &
  (NumberFieldNotNullable | NumberFieldNullable);

/**
 * An input for exact decimal numbers. The value is a string in canonical form
 * (`"1234.50"`), never a JavaScript number, so there are no rounding errors.
 * Input and display follow the locale: in German `1.234,5` gives `"1234.50"`
 * with `scale` 2. Text that is not a number keeps the last valid value; the
 * error shows when the user leaves the field or presses Enter, and the field
 * fails native form validation meanwhile.
 *
 * Keyboard: with `step`, arrow up and down change the value.
 */
export function NumberField(props: NumberFieldProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    scale,
    integerDigits,
    min,
    max,
    step,
    grouping = true,
    valueState,
    valueStateMessage,
    startContent,
    endContent,
    className,
    style,
    name,
    form,
    readOnly,
    onBlur,
    onKeyDown,
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const t = useText();
  const { locale } = useLocale();
  const field = useFieldProps(props);
  const empty = nullable ? null : '';
  const initial = defaultValue !== undefined ? defaultValue : empty;
  const [current, setCurrent] = useControllableState<string | null>(
    value,
    initial,
    onChange as ((v: string | null) => void) | undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const limits = {
    ...(scale !== undefined ? { scale } : {}),
    ...(integerDigits !== undefined ? { integerDigits } : {}),
  };

  const text = useParsedText({
    value: current,
    report: setCurrent,
    empty,
    format: (v) =>
      formatDecimal(v, locale, { grouping, ...(scale !== undefined ? { scale } : {}) }),
    parse: (s) => {
      const result = parseLocalizedDecimal(s, locale, limits);
      if (result.ok) return { value: result.value };
      if (result.error === 'tooManyFractionDigits') {
        return { error: t('input.tooManyFractionDigits', { digits: scale ?? 0 }) };
      }
      if (result.error === 'tooManyIntegerDigits') {
        return { error: t('input.tooManyIntegerDigits', { digits: integerDigits ?? 0 }) };
      }
      return { error: t('input.invalidNumber') };
    },
    rangeError: (v) => {
      if (min !== undefined && compareDecimal(v, min) < 0) {
        return t('input.belowMinimum', { min: formatDecimal(min, locale) });
      }
      if (max !== undefined && compareDecimal(v, max) > 0) {
        return t('input.aboveMaximum', { max: formatDecimal(max, locale) });
      }
      return null;
    },
  });

  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial);
    text.reset();
  });
  const validity = text.error ?? text.invalid ?? '';
  useEffect(() => {
    inputRef.current?.setCustomValidity(validity);
  }, [validity]);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === 'Enter') text.commit();
    if (step === undefined || readOnly || (event.key !== 'ArrowUp' && event.key !== 'ArrowDown'))
      return;
    event.preventDefault();
    const base = current === null || current === '' || text.invalid ? (min ?? '0') : current;
    let next = event.key === 'ArrowUp' ? addDecimal(base, step) : subtractDecimal(base, step);
    if (min !== undefined && compareDecimal(next, min) < 0) next = min;
    if (max !== undefined && compareDecimal(next, max) > 0) next = max;
    const limited = checkLimits(next, limits);
    if (limited.ok) text.pick(limited.value);
  };

  const state = effectiveValueState(valueState, valueStateMessage, text.error);
  const info = useValueState(state.state, state.message, field.describedBy);

  return (
    <FieldFrame
      kind="trui-number-field"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={inputRef}
      startContent={startContent}
      endContent={endContent}
      after={<HiddenValue name={name} value={current} form={form} disabled={field.disabled} />}
    >
      <input
        ref={inputRef}
        id={field.id}
        className="trui-field__input trui-number-field__input"
        type="text"
        inputMode="decimal"
        autoComplete="off"
        form={form}
        value={text.text}
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        onBlur={(event) => {
          text.commit();
          onBlur?.(event);
        }}
        onChange={(event) => text.onTextChange(event.target.value)}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    </FieldFrame>
  );
}
