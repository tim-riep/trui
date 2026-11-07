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

import type { Ref } from 'react';

/** Props of {@link HiddenValue}. */
export interface HiddenValueProps {
  /** Name under which the value is submitted. Without a name nothing is rendered. */
  name: string | undefined;
  /**
   * The canonical value. `null` submits nothing: the field is missing from
   * the form data. `""` submits an empty entry. An array submits one entry
   * per element.
   */
  value: string | null | readonly string[];
  /** Associates the field with a form by its id. */
  form?: string | undefined;
  disabled?: boolean | undefined;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Hidden inputs that carry the canonical value of a field into native form
 * submission, for fields whose visible text differs from their value.
 */
export function HiddenValue({ name, value, form, disabled, ref }: HiddenValueProps) {
  if (!name) return null;
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((v, i) => (
          <input
            // biome-ignore lint/suspicious/noArrayIndexKey: values may repeat and the list is replaced as a whole
            key={`${i}:${v}`}
            type="hidden"
            name={name}
            value={v}
            form={form}
            disabled={disabled}
          />
        ))}
      </>
    );
  }
  return (
    <input
      ref={ref}
      type="hidden"
      name={name}
      value={value === null ? '' : (value as string)}
      form={form}
      disabled={disabled || value === null}
    />
  );
}
