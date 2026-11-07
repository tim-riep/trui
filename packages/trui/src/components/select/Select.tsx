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
  type ListItem,
  useControllableState,
  useFormReset,
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { Listbox } from '../../internal/listbox/Listbox';
import { useListPopup } from '../../internal/listbox/use-list-popup';
import { Floating } from '../../internal/overlay/Floating';
import { Icon } from '../icon/Icon';

export interface SelectBaseProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    | 'value'
    | 'defaultValue'
    | 'onChange'
    | 'type'
    | 'children'
    | 'className'
    | 'style'
    | 'name'
    | 'form'
  > {
  /** The options. */
  items: readonly ListItem[];
  /** Text while nothing is selected. */
  placeholder?: string;
  name?: string;
  form?: string;
  required?: boolean;
  readOnly?: boolean;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLButtonElement>;
}

export interface SelectNotNullable {
  nullable?: false;
  /** The value of the selected option. A value without option shows the placeholder. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, item: ListItem) => void;
}

export interface SelectNullable {
  /** Adds an option for "no selection", which gives `null`. */
  nullable: true;
  /** The value of the selected option, or `null` for none. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, item: ListItem | null) => void;
}

/** Props of {@link Select}. */
export type SelectProps = SelectBaseProps & (SelectNotNullable | SelectNullable);

const noneValue = '\u0000none';

/**
 * A choice of one option from a list that opens below the field.
 *
 * Keyboard: Enter, Space or the arrow keys open the list; arrows, Home and
 * End move; typing letters jumps to an option; Enter picks; Escape closes.
 */
export function Select(props: SelectProps) {
  const {
    items,
    nullable = false,
    value,
    defaultValue,
    onChange,
    placeholder,
    name,
    form,
    readOnly,
    valueState,
    valueStateMessage,
    className,
    style,
    onKeyDown,
    onClick,
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const t = useText();
  const field = useFieldProps(props);
  const initial = defaultValue !== undefined ? defaultValue : nullable ? null : '';
  const [current, setCurrent] = useControllableState<string | null, [ListItem | null]>(
    value,
    initial,
    onChange as ((v: string | null, item: ListItem | null) => void) | undefined,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => buttonRef.current!, []);
  useFormReset(buttonRef, () => {
    if (value === undefined) setCurrent(initial, null);
  });

  const options = useMemo<ListItem[]>(
    () =>
      nullable ? [{ value: noneValue, label: t('select.noSelection') }, ...items] : [...items],
    [nullable, items, t],
  );
  const selectedItem = items.find((i) => i.value === current) ?? null;
  const interactive = !field.disabled && !readOnly;
  const popup = useListPopup({
    items: options,
    typeahead: true,
    disabled: !interactive,
    onSelect: (item) => {
      if (item.value === noneValue) setCurrent(null, null);
      else setCurrent(item.value, item);
    },
    initialIndex: () =>
      options.findIndex((o) => (current === null ? o.value === noneValue : o.value === current)),
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  const selected = useMemo(
    () => new Set(current === null ? (nullable ? [noneValue] : []) : [current]),
    [current, nullable],
  );

  return (
    <FieldFrame
      kind="trui-select"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={buttonRef}
      controlRef={controlRef}
      after={
        <>
          <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
          {field.required && (
            // Carries `required` into native form validation, which buttons do not take part in.
            <input
              className="trui-visually-hidden"
              tabIndex={-1}
              aria-hidden="true"
              required
              form={form}
              value={selectedItem ? 'x' : ''}
              onChange={() => undefined}
              onFocus={() => buttonRef.current?.focus()}
            />
          )}
          <Floating
            anchor={controlRef}
            open={popup.open}
            onDismiss={() => popup.setOpen(false)}
            matchWidth
          >
            <Listbox
              id={popup.listboxId}
              items={options}
              selected={selected}
              activeIndex={popup.activeIndex}
              onActiveIndexChange={popup.setActiveIndex}
              onSelect={(item) => {
                popup.select(item);
                buttonRef.current?.focus();
              }}
              aria-labelledby={field.labelId}
            />
          </Floating>
        </>
      }
    >
      <button
        ref={buttonRef}
        id={field.id}
        type="button"
        role="combobox"
        aria-expanded={popup.open}
        aria-controls={popup.listboxId}
        aria-haspopup="listbox"
        aria-activedescendant={popup.ownerProps['aria-activedescendant']}
        className="trui-select__button"
        disabled={field.disabled}
        aria-required={field.required || undefined}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        onClick={(event) => {
          onClick?.(event);
          if (interactive) popup.setOpen(!popup.open);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (!popup.open && interactive && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            popup.setOpen(true);
            return;
          }
          popup.onKeyDown(event);
        }}
        {...rest}
      >
        <span className={selectedItem ? 'trui-select__value' : 'trui-select__placeholder'}>
          {selectedItem?.label ?? placeholder ?? t('select.placeholder')}
        </span>
        <Icon icon={chevronDownIcon} size="s" className="trui-select__chevron" />
      </button>
    </FieldFrame>
  );
}
