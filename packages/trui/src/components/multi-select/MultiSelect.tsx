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
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import {
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { Listbox } from '../../internal/listbox/Listbox';
import { useItemSource } from '../../internal/listbox/use-item-source';
import { useListPopup } from '../../internal/listbox/use-list-popup';
import { Floating } from '../../internal/overlay/Floating';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';

export interface MultiSelectBaseProps
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
  /** Loads the options for what the user types; aborted when the text changes. */
  loadItems?: LoadItems;
  /** Milliseconds to wait after typing before `loadItems` is called; 250 by default. */
  debounce?: number;
  /** Labels of the initial values when the options are loaded and not yet known. */
  valueLabels?: Readonly<Record<string, string>>;
  /** Tokens shown while the field has no focus; the rest is summed up as "+n". 3 by default. */
  maxVisibleTokens?: number;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface MultiSelectNotNullable {
  nullable?: false;
  /** The selected values; `[]` when none is selected. */
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
}

export interface MultiSelectNullable {
  /** Removing the last value gives `null` instead of `[]`. */
  nullable: true;
  value?: readonly string[] | null;
  defaultValue?: readonly string[] | null;
  onChange?: (value: string[] | null) => void;
}

/** Props of {@link MultiSelect}. */
export type MultiSelectProps = MultiSelectBaseProps &
  (MultiSelectNotNullable | MultiSelectNullable);

/**
 * A choice of several values, shown as tokens in the field. Typing filters the
 * options or loads them; the list stays open to pick more. In a native form,
 * each value is submitted as an entry under `name`.
 *
 * Keyboard: typing and Arrow Down open the list; Enter picks or removes the
 * active option; Backspace in the empty input removes the last token; Escape
 * closes the list.
 */
export function MultiSelect(props: MultiSelectProps) {
  const {
    items,
    loadItems,
    debounce = 250,
    valueLabels,
    maxVisibleTokens = 3,
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
    onKeyDown,
    onFocus,
    onBlur,
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const t = useText();
  const field = useFieldProps(props);
  const empty = nullable ? null : [];
  const initial = defaultValue !== undefined ? defaultValue : empty;
  const [current, setCurrent] = useControllableState<readonly string[] | null>(
    value,
    initial,
    onChange as ((v: readonly string[] | null) => void) | undefined,
  );
  const values = current ?? [];
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const summaryId = useId();
  useImperativeHandle(ref, () => inputRef.current!, []);
  const interactive = !field.disabled && !readOnly;
  const [listOpen, setListOpen] = useState(false);
  const source = useItemSource({ items, loadItems, query, active: listOpen, debounce });
  const labelOf = (v: string) => source.labelOf(v) ?? valueLabels?.[v] ?? v;

  const commit = (next: string[]) => setCurrent(next.length === 0 && nullable ? null : next);
  const toggle = (item: ListItem) => {
    source.remember(item);
    commit(
      values.includes(item.value)
        ? values.filter((v) => v !== item.value)
        : [...values, item.value],
    );
    setQuery('');
  };
  const remove = (v: string) => {
    commit(values.filter((x) => x !== v));
    inputRef.current?.focus();
  };
  const popup = useListPopup({
    items: source.items,
    disabled: !interactive,
    stayOpen: true,
    onSelect: toggle,
    onOpenChange: setListOpen,
  });
  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial);
    setQuery('');
  });
  const info = useValueState(
    valueState,
    valueStateMessage,
    [field.describedBy, summaryId].filter(Boolean).join(' '),
  );
  const selected = useMemo(() => new Set(values), [values]);
  const visible = focused ? values : values.slice(0, maxVisibleTokens);
  const hidden = values.length - visible.length;
  const status = source.loading ? (
    <Spinner size="s" label={t('common.loading')} />
  ) : source.items.length === 0 ? (
    t('select.noResults')
  ) : undefined;

  return (
    <FieldFrame
      kind="trui-multi-select"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={inputRef}
      controlRef={controlRef}
      after={
        <>
          <HiddenValue name={name} value={values} form={form} disabled={field.disabled} />
          <span id={summaryId} className="trui-visually-hidden">
            {t('select.selectedValues', { count: values.length })}
          </span>
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
              multiple
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
      <div className="trui-multi-select__tokens">
        {visible.map((v) => (
          <span key={v} className={cx('trui-token', !interactive && 'trui-token--static')}>
            <span className="trui-token__text">{labelOf(v)}</span>
            {interactive && (
              <button
                type="button"
                tabIndex={-1}
                className="trui-token__remove"
                aria-label={t('select.removeValue', { label: labelOf(v) })}
                onClick={() => remove(v)}
              >
                <Icon icon={closeIcon} size="s" />
              </button>
            )}
          </span>
        ))}
        {hidden > 0 && (
          <span className="trui-token trui-token--more">
            {t('select.moreValues', { count: hidden })}
          </span>
        )}
        <input
          ref={inputRef}
          id={field.id}
          className="trui-field__input trui-multi-select__input"
          type="text"
          autoComplete="off"
          form={form}
          value={query}
          required={field.required && values.length === 0}
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
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            setQuery('');
            popup.setOpen(false);
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            if (event.key === 'Backspace' && query === '' && values.length > 0 && interactive) {
              event.preventDefault();
              commit(values.slice(0, -1));
              return;
            }
            popup.onKeyDown(event);
          }}
          {...rest}
        />
      </div>
    </FieldFrame>
  );
}
