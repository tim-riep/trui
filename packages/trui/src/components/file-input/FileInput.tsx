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
} from 'react';
import { attachmentIcon } from '../../icons/set/attachment';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { useFieldProps } from '../../internal/field/use-field-props';
import { useValueState } from '../../internal/field/use-value-state';
import { ValueStateMessage } from '../../internal/field/ValueStateMessage';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';

/** Props of {@link FileInput}. */
export interface FileInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'value' | 'defaultValue' | 'onChange' | 'children' | 'className' | 'style'
  > {
  /** The selected files. */
  value?: readonly File[];
  onChange?: (files: File[]) => void;
  /** Allows several files; a new selection adds to the list. */
  multiple?: boolean;
  /** Text of the button; "Browse…" by default. */
  buttonText?: ReactNode;
  valueState?: ValueState;
  valueStateMessage?: ReactNode;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Selects files to upload. It lists the selected files with their size and a
 * button to remove each. A native file input: the files are submitted with a
 * native form under `name`. The component uploads nothing itself.
 */
export function FileInput(props: FileInputProps) {
  const {
    value,
    onChange,
    multiple = false,
    buttonText,
    valueState,
    valueStateMessage,
    className,
    style,
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
  const [files, setFiles] = useControllableState<readonly File[]>(
    value,
    [],
    onChange as ((v: readonly File[]) => void) | undefined,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonId = useId();
  useImperativeHandle(ref, () => inputRef.current!, []);
  useFormReset(inputRef, () => {
    if (value === undefined) setFiles([]);
  });
  const info = useValueState(valueState, valueStateMessage, field.describedBy);

  // The native input always holds the files of the list, so that forms submit them.
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const transfer = new DataTransfer();
    for (const file of files) transfer.items.add(file);
    input.files = transfer.files;
  }, [files]);

  const size = (bytes: number) => {
    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte'] as const;
    let n = bytes;
    let unit = 0;
    while (n >= 1024 && unit < units.length - 1) {
      n /= 1024;
      unit++;
    }
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: units[unit],
      unitDisplay: 'short',
      maximumFractionDigits: unit === 0 ? 0 : 1,
    }).format(n);
  };

  return (
    <div
      className={cx('trui-file-input', field.disabled && 'trui-file-input--disabled', className)}
      style={style}
    >
      <div className="trui-file-input__row">
        <input
          ref={inputRef}
          id={field.id}
          type="file"
          className="trui-visually-hidden"
          multiple={multiple}
          required={field.required}
          disabled={field.disabled}
          aria-invalid={info.invalid}
          aria-describedby={info.describedBy}
          onChange={(event) => {
            const picked = Array.from(event.target.files ?? []);
            setFiles(multiple ? [...files, ...picked] : picked);
          }}
          {...rest}
        />
        <Button
          icon={attachmentIcon}
          id={buttonId}
          disabled={field.disabled}
          aria-labelledby={field.labelId ? `${field.labelId} ${buttonId}` : undefined}
          onClick={() => inputRef.current?.click()}
        >
          {buttonText ?? t('file.browse')}
        </Button>
        <span className="trui-file-input__summary" aria-live="polite">
          {files.length === 0 ? t('file.none') : t('file.count', { count: files.length })}
        </span>
      </div>
      {files.length > 0 && (
        <ul className="trui-file-input__list">
          {files.map((file, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: files may have the same name; the list is replaced as a whole
            <li key={`${index}:${file.name}`} className="trui-file-input__file">
              <Icon icon={attachmentIcon} size="s" />
              <span className="trui-file-input__name">{file.name}</span>
              <span className="trui-file-input__size">{size(file.size)}</span>
              {!field.disabled && (
                <Button
                  variant="text"
                  icon={closeIcon}
                  aria-label={t('file.remove', { name: file.name })}
                  onClick={() => setFiles(files.filter((_, i) => i !== index))}
                />
              )}
            </li>
          ))}
        </ul>
      )}
      <ValueStateMessage info={info} />
    </div>
  );
}
