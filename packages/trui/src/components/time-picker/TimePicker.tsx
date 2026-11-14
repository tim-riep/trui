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
  formatTime,
  HiddenValue,
  type ListItem,
  parseLocalizedTime,
  type TimeString,
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
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { clockIcon } from '../../icons/set/clock';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { effectiveValueState, useFieldProps } from '../../internal/field/use-field-props';
import { useParsedText } from '../../internal/field/use-parsed-text';
import { useValueState } from '../../internal/field/use-value-state';
import { Listbox } from '../../internal/listbox/Listbox';
import { useListPopup } from '../../internal/listbox/use-list-popup';
import { Floating } from '../../internal/overlay/Floating';
import { Button } from '../button/Button';

export interface TimePickerBaseProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'step'
    | 'size'
    | 'prefix'
    | 'children'
    | 'className'
    | 'style'
  > {
  /** Minutes between the times offered in the list; 30 by default. */
  minuteStep?: number;
  /** Shows and reads seconds. */
  showSeconds?: boolean;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface TimePickerNotNullable {
  nullable?: false;
  /** The time `HH:MM:SS`, or `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export interface TimePickerNullable {
  /** An empty field has the value `null`, which is left out of native form submission. */
  nullable: true;
  /** The time `HH:MM:SS`, or `null` when empty. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
}

/** Props of {@link TimePicker}. */
export type TimePickerProps = TimePickerBaseProps & (TimePickerNotNullable | TimePickerNullable);

/**
 * An input for a time of day. The value is `HH:MM:SS`; the field shows and
 * reads times as the locale does (`14:30`, `2:30 PM`) and accepts short forms
 * such as `1430`. A list offers times in steps of `minuteStep`.
 *
 * Keyboard: Arrow Down opens the list; arrows move, Enter picks, Escape closes.
 */
export function TimePicker(props: TimePickerProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    minuteStep = 30,
    showSeconds = false,
    valueState,
    valueStateMessage,
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
  const controlRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);

  const items = useMemo<ListItem[]>(() => {
    const result: ListItem[] = [];
    for (let m = 0; m < 24 * 60; m += Math.max(1, minuteStep)) {
      const v: TimeString = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}:00`;
      result.push({ value: v, label: formatTime(v, locale) });
    }
    return result;
  }, [minuteStep, locale]);

  const text = useParsedText({
    value: current,
    report: setCurrent,
    empty,
    format: (v) => formatTime(v, locale, showSeconds),
    parse: (s) => {
      const time = parseLocalizedTime(s, locale);
      return time === null
        ? { error: t('input.invalidTime') }
        : { value: showSeconds ? time : `${time.slice(0, 5)}:00` };
    },
  });
  const interactive = !field.disabled && !readOnly;
  const popup = useListPopup({
    items,
    disabled: !interactive,
    onSelect: (item) => text.pick(item.value),
    initialIndex: () => {
      if (!current) return -1;
      const index = items.findIndex((i) => i.value >= current);
      return index < 0 ? items.length - 1 : index;
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

  const state = effectiveValueState(valueState, valueStateMessage, text.error);
  const info = useValueState(state.state, state.message, field.describedBy);
  const selected = useMemo(() => new Set(current ? [current] : []), [current]);

  return (
    <FieldFrame
      kind="trui-time-picker"
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
            icon={clockIcon}
            aria-label={t('select.showOptions')}
            tabIndex={-1}
            className="trui-field__button"
            onClick={() => {
              popup.setOpen(!popup.open);
              inputRef.current?.focus();
            }}
          />
        )
      }
      after={
        <>
          <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
          <Floating
            sheet
            anchor={controlRef}
            open={popup.open}
            onDismiss={() => popup.setOpen(false)}
            matchWidth
          >
            <Listbox
              id={popup.listboxId}
              items={items}
              selected={selected}
              activeIndex={popup.activeIndex}
              onActiveIndexChange={popup.setActiveIndex}
              onSelect={popup.select}
              aria-label={t('input.time')}
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
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        aria-autocomplete="none"
        {...popup.ownerProps}
        onChange={(event) => text.onTextChange(event.target.value)}
        onBlur={(event) => {
          text.commit();
          popup.setOpen(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          popup.onKeyDown(event);
          if (event.key === 'Enter' && !event.defaultPrevented) text.commit();
        }}
        {...rest}
      />
    </FieldFrame>
  );
}
