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
  type CSSProperties,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { searchIcon } from '../../icons/set/search';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { Button } from '../button/Button';
import { type FetchLookupItems, LookupDialog } from './LookupDialog';

export interface LookupFieldBaseProps
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
  /** Delivers the results of the value help page by page. */
  fetchItems: FetchLookupItems;
  /** Text shown next to the value, e.g. the name for a key; updated when a value is picked. */
  description?: string;
  /** Title of the dialog. */
  dialogTitle?: string;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

export interface LookupFieldNotNullable {
  nullable?: false;
  /** The value, e.g. a key; `""` when empty. */
  value?: string;
  defaultValue?: string;
  /** Called with the value; `item` is the picked result, or null when the value was typed. */
  onChange?: (value: string, item: ListItem | null) => void;
}

export interface LookupFieldNullable {
  /** Clearing the field gives `null`. */
  nullable: true;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, item: ListItem | null) => void;
}

/** Props of {@link LookupField}. */
export type LookupFieldProps = LookupFieldBaseProps &
  (LookupFieldNotNullable | LookupFieldNullable);

/**
 * An input for a value, e.g. a key, with a value help: the button or F4 opens
 * a dialog to search and pick it. The value can also be typed directly; the
 * application checks it. The label of a picked value shows next to it.
 *
 * Keyboard: F4 or Alt+Arrow Down opens the value help.
 */
export function LookupField(props: LookupFieldProps) {
  const {
    fetchItems,
    description,
    dialogTitle,
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
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const t = useText();
  const field = useFieldProps(props);
  const empty = nullable ? null : '';
  const initial = defaultValue !== undefined ? defaultValue : empty;
  const [current, setCurrent] = useControllableState<string | null, [ListItem | null]>(
    value,
    initial,
    onChange as ((v: string | null, item: ListItem | null) => void) | undefined,
  );
  const [picked, setPicked] = useState<ListItem | null>(null);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current!, []);
  useFormReset(inputRef, () => {
    if (value === undefined) setCurrent(initial, null);
    setPicked(null);
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);
  const interactive = !field.disabled && !readOnly;
  const shownDescription =
    picked && picked.value === current ? (picked.description ?? picked.label) : description;

  return (
    <FieldFrame
      kind="trui-lookup-field"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={inputRef}
      endContent={
        <>
          {shownDescription && (
            <span className="trui-lookup-field__description">{shownDescription}</span>
          )}
          {interactive && (
            <Button
              variant="text"
              icon={searchIcon}
              aria-label={t('lookup.open')}
              aria-haspopup="dialog"
              className="trui-field__button"
              onClick={() => setOpen(true)}
            />
          )}
        </>
      }
      after={
        <>
          <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
          <LookupDialog
            open={open}
            onClose={() => setOpen(false)}
            fetchItems={fetchItems}
            {...(dialogTitle !== undefined ? { title: dialogTitle } : {})}
            onConfirm={([item]) => {
              setOpen(false);
              if (!item) return;
              setPicked(item);
              setCurrent(item.value, item);
            }}
          />
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
        value={current ?? ''}
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        aria-haspopup="dialog"
        onChange={(event) => {
          const text = event.target.value;
          setCurrent(text === '' && nullable ? null : text, null);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || !interactive) return;
          if (event.key === 'F4' || (event.altKey && event.key === 'ArrowDown')) {
            event.preventDefault();
            setOpen(true);
          }
        }}
        {...rest}
      />
    </FieldFrame>
  );
}
