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
  type LoadItems,
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
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { Listbox } from '../../internal/listbox/Listbox';
import { useItemSource } from '../../internal/listbox/use-item-source';
import { useListPopup } from '../../internal/listbox/use-list-popup';
import { Floating } from '../../internal/overlay/Floating';
import { Button } from '../button/Button';
import { Spinner } from '../spinner/Spinner';

export interface ComboBoxBaseProps
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
  /** Fixed options, filtered by what the user types. */
  items?: readonly ListItem[];
  /**
   * Loads the options for what the user types, e.g. from a server. A request
   * is aborted through its signal when the text changes.
   */
  loadItems?: LoadItems;
  /** Milliseconds to wait after typing before `loadItems` is called; 250 by default. */
  debounce?: number;
  /** Accepts text that matches no option as value. Off by default: the value is always one of the options. */
  allowCustomValue?: boolean;
  /** Label of the initial value when the options are loaded and not yet known. */
  valueLabel?: string;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface ComboBoxNotNullable {
  nullable?: false;
  /** The value of the selected option (or the typed text with `allowCustomValue`); `""` when empty. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, item: ListItem | null) => void;
}

export interface ComboBoxNullable {
  /** Clearing the field gives `null`. */
  nullable: true;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, item: ListItem | null) => void;
}

/** Props of {@link ComboBox}. */
export type ComboBoxProps = ComboBoxBaseProps & (ComboBoxNotNullable | ComboBoxNullable);

/**
 * A text input that suggests options while the user types, from a fixed list
 * or loaded asynchronously. Without `allowCustomValue`, leaving the field
 * with text that matches no option restores the selected option.
 *
 * Keyboard: typing filters and opens the list; Arrow Down and Up move, Enter
 * picks, Escape closes the list (a second Escape clears the text).
 */
export function ComboBox(props: ComboBoxProps) {
  const {
    items,
    loadItems,
    debounce = 250,
    allowCustomValue = false,
    valueLabel,
    nullable = false,
    value,
    defaultValue,
    onChange,
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
  const [current, setCurrent] = useControllableState<string | null, [ListItem | null]>(
    value,
    initial,
    onChange as ((v: string | null, item: ListItem | null) => void) | undefined,
  );
  /** The text while the user types; null while the field shows the label of the value. */
  const [query, setQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  const interactive = !field.disabled && !readOnly;
  const [listOpen, setListOpen] = useState(false);
  const source = useItemSource({
    items,
    loadItems,
    query: query ?? '',
    active: listOpen,
    debounce,
  });

  const labelOf = (v: string | null) =>
    v === null || v === ''
      ? ''
      : (source.labelOf(v) ?? (v === initial || v === value ? valueLabel : undefined) ?? v);

  const choose = (item: ListItem) => {
    source.remember(item);
    setQuery(null);
    setCurrent(item.value, item);
  };
  const popup = useListPopup({
    items: source.items,
    disabled: !interactive,
    onSelect: choose,
    onOpenChange: setListOpen,
    initialIndex: () => source.items.findIndex((i) => i.value === current),
  });

  /** Ends typing: takes a matching option or the custom text, else restores the value. */
  const commit = () => {
    if (query === null) return;
    const text = query.trim();
    if (text === '') {
      setQuery(null);
      setCurrent(empty, null);
      return;
    }
    const match = source.items.find(
      (i) => i.label.toLocaleLowerCase(locale) === text.toLocaleLowerCase(locale),
    );
    if (match) choose(match);
    else if (allowCustomValue) {
      setQuery(null);
      setCurrent(text, null);
    } else setQuery(null);
  };

  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial, null);
    setQuery(null);
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  const selected = useMemo(() => new Set(current ? [current] : []), [current]);
  const status = source.loading ? (
    <Spinner size="s" label={t('common.loading')} />
  ) : source.items.length === 0 ? (
    t('select.noResults')
  ) : undefined;

  return (
    <FieldFrame
      kind="trui-combo-box"
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
            icon={chevronDownIcon}
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
            anchor={controlRef}
            open={popup.open}
            onDismiss={() => popup.setOpen(false)}
            matchWidth
          >
            <Listbox
              id={popup.listboxId}
              items={source.loading ? [] : source.items}
              selected={selected}
              activeIndex={source.loading ? -1 : popup.activeIndex}
              onActiveIndexChange={popup.setActiveIndex}
              onSelect={popup.select}
              status={status}
              aria-labelledby={field.labelId}
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
        value={query ?? labelOf(current)}
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        aria-autocomplete="list"
        {...popup.ownerProps}
        onChange={(event) => {
          setQuery(event.target.value);
          if (interactive) popup.setOpen(true);
        }}
        onBlur={(event) => {
          commit();
          popup.setOpen(false);
          onBlur?.(event);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === 'Escape' && !popup.open && query !== null) {
            event.preventDefault();
            setQuery(null);
            return;
          }
          popup.onKeyDown(event);
          if (event.key === 'Enter' && !event.defaultPrevented) commit();
        }}
        {...rest}
      />
    </FieldFrame>
  );
}
