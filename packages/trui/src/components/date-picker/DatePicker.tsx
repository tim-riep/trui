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
  type DateString,
  datePlaceholder,
  formatDate,
  formatDateForInput,
  HiddenValue,
  parseLocalizedDate,
  today,
  useControllableState,
  useFormReset,
  useLocale,
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import {
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { calendarIcon } from '../../icons/set/calendar';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { effectiveValueState, useFieldProps } from '../../internal/field/use-field-props';
import { useParsedText } from '../../internal/field/use-parsed-text';
import { useValueState } from '../../internal/field/use-value-state';
import { Floating } from '../../internal/overlay/Floating';
import { Button } from '../button/Button';
import { Calendar } from '../calendar/Calendar';

export interface DatePickerBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'min'
    | 'max'
    | 'size'
    | 'prefix'
    | 'children'
    | 'className'
    | 'style'
  > {
  /** Earliest allowed date, `YYYY-MM-DD`. */
  min?: DateString;
  /** Latest allowed date, `YYYY-MM-DD`. */
  max?: DateString;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface DatePickerNotNullable {
  nullable?: false;
  /** The date `YYYY-MM-DD`, or `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface DatePickerNullable {
  /** An empty field has the value `null`, which is left out of native form submission. */
  nullable: true;
  /** The date `YYYY-MM-DD`, or `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

/** Props of {@link DatePicker}. */
export type DatePickerProps = DatePickerBaseProps & (DatePickerNotNullable | DatePickerNullable);

/**
 * An input for a calendar date. The value is `YYYY-MM-DD`; the field shows and
 * reads dates in the format of the locale, and accepts short forms such as
 * `7.11.` or `071126`. The calendar button opens a month to pick from.
 *
 * Keyboard: Alt+Arrow Down or F4 opens the calendar; in the calendar, arrow
 * keys move, Enter picks, Escape closes.
 */
export function DatePicker(props: DatePickerProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    min,
    max,
    valueState,
    valueStateMessage,
    className,
    style,
    name,
    form,
    readOnly,
    placeholder,
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
  const { locale, timeZone } = useLocale();
  const field = useFieldProps(props);
  const empty = nullable ? null : '';
  const initial = defaultValue !== undefined ? defaultValue : empty;
  const [current, setCurrent] = useControllableState<string | null>(
    value,
    initial,
    onChange as ((v: string | null) => void) | undefined,
  );
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const popupId = useId();
  useImperativeHandle(ref, () => inputRef.current!, []);

  const text = useParsedText({
    value: current,
    report: setCurrent,
    empty,
    format: (v) => formatDateForInput(v, locale),
    parse: (s) => {
      const date = parseLocalizedDate(s, locale, today(timeZone));
      return date === null ? { error: t('input.invalidDate') } : { value: date };
    },
    rangeError: (v) =>
      min !== undefined && v < min
        ? t('input.dateBeforeMinimum', { min: formatDate(min, locale) })
        : max !== undefined && v > max
          ? t('input.dateAfterMaximum', { max: formatDate(max, locale) })
          : null,
  });
  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial);
    text.reset();
  });
  const validity = text.error ?? text.invalid ?? '';
  useEffect(() => {
    inputRef.current?.setCustomValidity(validity);
  }, [validity]);

  const state = effectiveValueState(valueState, valueStateMessage, text.error);
  const info = useValueState(state.state, state.message, field.describedBy);
  const close = (focusInput: boolean) => {
    setOpen(false);
    if (focusInput) inputRef.current?.focus();
  };
  const interactive = !field.disabled && !readOnly;

  return (
    <FieldFrame
      kind="trui-date-picker"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={inputRef}
      controlRef={controlRef}
      endContent={
        interactive && (
          <Button
            variant="text"
            icon={calendarIcon}
            aria-label={t('calendar.open')}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popupId : undefined}
            className="trui-field__button"
            onClick={() => setOpen(!open)}
          />
        )
      }
      after={
        <>
          <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
          <Floating
            anchor={controlRef}
            open={open}
            onDismiss={() => close(false)}
            placement="bottom-start"
            id={popupId}
            role="dialog"
            aria-label={t('calendar.open')}
          >
            <Calendar
              value={current || null}
              min={min}
              max={max}
              autoFocus
              onEscape={() => close(true)}
              onSelect={(date) => {
                text.pick(date);
                close(true);
              }}
            />
          </Floating>
        </>
      }
    >
      <input
        ref={inputRef}
        id={field.id}
        className="trui-field__input"
        type="text"
        autoComplete="off"
        form={form}
        value={text.text}
        placeholder={
          placeholder ??
          datePlaceholder(locale, {
            day: t('input.placeholderDay'),
            month: t('input.placeholderMonth'),
            year: t('input.placeholderYear'),
          })
        }
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        onChange={(event) => text.onTextChange(event.target.value)}
        onBlur={(event) => {
          text.commit();
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Enter') text.commit();
          if (interactive && (event.key === 'F4' || (event.altKey && event.key === 'ArrowDown'))) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        {...rest}
      />
    </FieldFrame>
  );
}
