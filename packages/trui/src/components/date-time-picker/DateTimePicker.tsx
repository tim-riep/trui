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
  FieldContext,
  fromZoned,
  HiddenValue,
  isTimestamp,
  toZoned,
  useControllableState,
  useFormReset,
  useLocale,
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { cx } from '../../internal/class-names';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { ValueStateMessage } from '../../internal/field/ValueStateMessage';
import { DatePicker } from '../date-picker/DatePicker';
import { TimePicker } from '../time-picker/TimePicker';

export interface DateTimePickerBaseProps {
  id?: string;
  name?: string;
  form?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  /** Minutes between the times offered in the list. */
  minuteStep?: number;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
  style?: CSSProperties;
}

export interface DateTimePickerNotNullable {
  nullable?: false;
  /** The point in time `YYYY-MM-DDTHH:MM:SS.ffffffZ` in UTC, or `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface DateTimePickerNullable {
  /** An empty field has the value `null`, which is left out of native form submission. */
  nullable: true;
  /** The point in time `YYYY-MM-DDTHH:MM:SS.ffffffZ` in UTC, or `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

function splitTimestamp(value: string | null, timeZone: string) {
  return value && isTimestamp(value) ? toZoned(value, timeZone) : null;
}

/** Props of {@link DateTimePicker}. */
export type DateTimePickerProps = DateTimePickerBaseProps &
  (DateTimePickerNotNullable | DateTimePickerNullable);

/**
 * An input for a point in time: a date and a time in the time zone of the
 * provider. The value is a UTC timestamp; it changes once both parts are
 * filled in, and becomes empty when both are cleared.
 */
export function DateTimePicker(props: DateTimePickerProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    name,
    form,
    readOnly,
    minuteStep,
    valueState,
    valueStateMessage,
    className,
    style,
  } = props;
  const t = useText();
  const { timeZone } = useLocale();
  const field = useFieldProps(props);
  const empty = nullable ? null : '';
  const initial = defaultValue !== undefined ? defaultValue : empty;
  const [current, setCurrent] = useControllableState<string | null>(
    value,
    initial,
    onChange as ((v: string | null) => void) | undefined,
  );
  const split = (v: string | null) => splitTimestamp(v, timeZone);
  const [date, setDate] = useState<string | null>(() => split(current)?.date ?? null);
  const [time, setTime] = useState<string | null>(() => split(current)?.time ?? null);
  const groupRef = useRef<HTMLFieldSetElement>(null);

  // Show a value set from outside, unless it is the one just built from the parts.
  const built = useRef(current);
  useEffect(() => {
    if (current === built.current) return;
    built.current = current;
    const parts = splitTimestamp(current, timeZone);
    setDate(parts?.date ?? null);
    setTime(parts?.time ?? null);
  }, [current, timeZone]);

  const update = (nextDate: string | null, nextTime: string | null) => {
    setDate(nextDate);
    setTime(nextTime);
    let next: string | null | undefined;
    if (nextDate && nextTime)
      next = fromZoned(nextDate, nextTime, timeZone, split(current)?.micros ?? '000000');
    else if (!nextDate && !nextTime) next = empty;
    if (next !== undefined) {
      built.current = next;
      setCurrent(next);
    }
  };

  useFormReset(groupRef, () => {
    if (value === undefined) setCurrent(initial);
    const parts = split(initial);
    built.current = initial;
    setDate(parts?.date ?? null);
    setTime(parts?.time ?? null);
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  const labelledBy = props['aria-labelledby'] ?? field.labelId;

  return (
    <div className={cx('trui-date-time-picker', className)} style={style}>
      <fieldset
        ref={groupRef}
        id={field.id}
        aria-label={props['aria-label']}
        aria-labelledby={labelledBy}
        aria-describedby={info.describedBy}
        className="trui-date-time-picker__parts"
      >
        {/* The parts are inputs of their own, not of the form field around. */}
        <FieldContext.Provider value={null}>
          <DatePicker
            nullable
            value={date}
            onChange={(d) => update(d, time)}
            aria-label={t('input.date')}
            required={field.required}
            disabled={field.disabled}
            readOnly={readOnly}
            valueState={info.state === 'none' ? 'none' : info.state}
            className="trui-date-time-picker__date"
          />
          <TimePicker
            nullable
            value={time}
            onChange={(v) => update(date, v)}
            aria-label={t('input.time')}
            required={field.required}
            disabled={field.disabled}
            readOnly={readOnly}
            valueState={info.state === 'none' ? 'none' : info.state}
            className="trui-date-time-picker__time"
            {...(minuteStep !== undefined ? { minuteStep } : {})}
          />
        </FieldContext.Provider>
      </fieldset>
      <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
      <ValueStateMessage info={info} />
    </div>
  );
}
