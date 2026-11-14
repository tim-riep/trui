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

import { FieldContext, type FieldContextValue } from '@tim-riep/trui/core';
import {
  createElement,
  type FormHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  useId,
  useMemo,
} from 'react';
import { cx } from '../../internal/class-names';
import { Label } from '../label/Label';

/** Where labels go: above the fields, beside them, or beside them when there is room. */
export type LabelPosition = 'auto' | 'top' | 'side';

/** How groups look: plain on the background, or each on a card. */
export type FormGroupAppearance = 'plain' | 'card';

/** Props of {@link Form}. */
export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  /**
   * Largest number of columns for the groups. The form uses fewer when it is
   * narrow: one below 600 pixels, two below 1024, three below 1440. 2 by default.
   */
  columns?: 1 | 2 | 3 | 4;
  /** Where labels go; above the fields by default. */
  labelPosition?: LabelPosition;
  /** How groups look; `card` puts each group on a card. `plain` by default. */
  groupAppearance?: FormGroupAppearance;
  /**
   * Buttons of the form, e.g. save and reset. They stay in view at the bottom
   * while the form scrolls.
   */
  actions?: ReactNode;
  ref?: Ref<HTMLFormElement>;
}

/**
 * A native form that lays out groups of fields in responsive columns. It
 * submits, validates and resets like any `<form>`.
 */
export function Form({
  columns = 2,
  labelPosition = 'top',
  groupAppearance = 'plain',
  actions,
  className,
  children,
  ref,
  ...rest
}: FormProps) {
  return (
    <form
      ref={ref}
      className={cx(
        'trui-form',
        `trui-form--columns-${columns}`,
        `trui-form--labels-${labelPosition}`,
        `trui-form--groups-${groupAppearance}`,
        className,
      )}
      {...rest}
    >
      {/* The form is the container whose width sets the columns of this grid. */}
      <div className="trui-form__grid">{children}</div>
      {actions !== undefined && <div className="trui-form__actions">{actions}</div>}
    </form>
  );
}

/** Props of {@link FormGroup}. */
export interface FormGroupProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Title of the group; it names the group for assistive technology. */
  title?: ReactNode;
  /** Heading level of the title; 3 by default. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Columns of the form the group spans. */
  span?: 1 | 2 | 3 | 4;
  ref?: Ref<HTMLElement>;
}

/** A group of fields with an optional title; one cell of the columns of a form. */
export function FormGroup({
  title,
  headingLevel = 3,
  span,
  className,
  style,
  children,
  ref,
  ...rest
}: FormGroupProps) {
  const titleId = useId();
  return (
    <section
      ref={ref}
      aria-labelledby={title !== undefined ? titleId : undefined}
      className={cx('trui-form-group', className)}
      style={span ? { ...style, gridColumn: `span ${span}` } : style}
      {...rest}
    >
      {title !== undefined &&
        createElement(
          `h${headingLevel}`,
          { id: titleId, className: 'trui-form-group__title' },
          title,
        )}
      <div className="trui-form-group__fields">{children}</div>
    </section>
  );
}

/** Props of {@link FormField}. */
export interface FormFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The label of the input. */
  label: ReactNode;
  /** Marks the field and its input as required. */
  required?: boolean;
  /** Disables the input. */
  disabled?: boolean;
  /** A hint below the input, referenced as its description. */
  help?: ReactNode;
  /** Id of the input; generated if not given. */
  inputId?: string;
  /** The input: any input of the library, which takes id, required and description from the field. */
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A label with its input. The input gets the id the label points to, the
 * required flag and the hint as description, so that label and input are
 * connected for assistive technology without wiring ids by hand.
 */
export function FormField({
  label,
  required = false,
  disabled = false,
  help,
  inputId,
  className,
  children,
  ref,
  ...rest
}: FormFieldProps) {
  const generated = useId();
  const id = inputId ?? `${generated}input`;
  const labelId = `${generated}label`;
  const helpId = `${generated}help`;
  const context = useMemo<FieldContextValue>(
    () => ({
      id,
      labelId,
      describedBy: help !== undefined ? helpId : undefined,
      required,
      disabled,
    }),
    [id, labelId, helpId, help, required, disabled],
  );
  return (
    <div ref={ref} className={cx('trui-form-field', className)} {...rest}>
      <Label
        id={labelId}
        htmlFor={id}
        required={required}
        disabled={disabled}
        className="trui-form-field__label"
      >
        {label}
      </Label>
      <div className="trui-form-field__content">
        <FieldContext.Provider value={context}>{children}</FieldContext.Provider>
        {help !== undefined && (
          <div id={helpId} className="trui-form-field__help">
            {help}
          </div>
        )}
      </div>
    </div>
  );
}
