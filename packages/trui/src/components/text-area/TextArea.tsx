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
  useText,
  type ValueState,
} from '@tim-riep/trui/core';
import {
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { FieldFrame } from '../../internal/field/FieldFrame';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';

export interface TextAreaBaseProps
  extends Omit<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    'value' | 'defaultValue' | 'onChange' | 'children' | 'className' | 'style'
  > {
  /** Visible lines; with `autoGrow` the minimum. */
  rows?: number;
  /** Grows with its content up to `maxRows`. */
  autoGrow?: boolean;
  /** Largest number of lines with `autoGrow`; then it scrolls. */
  maxRows?: number;
  /** Shows how many characters are left of `maxLength`. */
  showCount?: boolean;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLTextAreaElement>;
}

export interface TextAreaNotNullable {
  nullable?: false;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface TextAreaNullable {
  /** Clearing gives `null` instead of `""`; `null` is left out of native form submission. */
  nullable: true;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, event: ChangeEvent<HTMLTextAreaElement>) => void;
}

/** Props of {@link TextArea}. */
export type TextAreaProps = TextAreaBaseProps & (TextAreaNotNullable | TextAreaNullable);

/** A text input with several lines, e.g. for notes. */
export function TextArea(props: TextAreaProps) {
  const {
    nullable = false,
    value,
    defaultValue,
    onChange,
    rows = 3,
    autoGrow = false,
    maxRows = 12,
    showCount = false,
    valueState,
    valueStateMessage,
    className,
    style,
    name,
    form,
    readOnly,
    maxLength,
    ref,
    id: _id,
    required: _required,
    disabled: _disabled,
    'aria-describedby': _describedBy,
    ...rest
  } = props;
  const t = useText();
  const field = useFieldProps(props);
  const countId = useId();
  const initial = defaultValue !== undefined ? defaultValue : nullable ? null : '';
  const [current, setCurrent] = useControllableState<
    string | null,
    [ChangeEvent<HTMLTextAreaElement>?]
  >(
    value,
    initial,
    onChange as ((v: string | null, e?: ChangeEvent<HTMLTextAreaElement>) => void) | undefined,
  );
  const areaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(ref, () => areaRef.current!, []);
  useFormReset(areaRef, () => {
    if (value === undefined) setCurrent(initial);
  });
  const counting = showCount && maxLength !== undefined;
  const info = useValueState(
    valueState,
    valueStateMessage,
    [field.describedBy, counting ? countId : undefined].filter(Boolean).join(' ') || undefined,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: measures again whenever the text changes
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!autoGrow || !el) return;
    const style = getComputedStyle(el);
    const line = Number.parseFloat(style.lineHeight) || 20;
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    el.style.height = 'auto';
    const height = Math.min(
      Math.max(el.scrollHeight, rows * line + padding),
      maxRows * line + padding,
    );
    el.style.height = `${height}px`;
  }, [autoGrow, current, rows, maxRows]);

  const text = current ?? '';
  return (
    <FieldFrame
      kind="trui-text-area"
      info={info}
      disabled={field.disabled}
      readOnly={readOnly}
      className={className}
      style={style}
      focusTarget={areaRef}
      after={
        <>
          {nullable && (
            <HiddenValue name={name} value={current} form={form} disabled={field.disabled} />
          )}
          {counting && (
            <div id={countId} className="trui-text-area__count" aria-live="polite">
              {t('input.charactersLeft', { count: Math.max(maxLength - text.length, 0) })}
            </div>
          )}
        </>
      }
    >
      <textarea
        ref={areaRef}
        id={field.id}
        className="trui-field__input trui-text-area__input"
        name={nullable ? undefined : name}
        form={form}
        rows={rows}
        value={text}
        maxLength={maxLength}
        required={field.required}
        disabled={field.disabled}
        readOnly={readOnly}
        aria-invalid={info.invalid}
        aria-describedby={info.describedBy}
        onChange={(event) =>
          setCurrent(event.target.value === '' && nullable ? null : event.target.value, event)
        }
        {...rest}
      />
    </FieldFrame>
  );
}
