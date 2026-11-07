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

import { useField, type ValueState } from '@tim-riep/trui/core';
import { type ReactNode, useId } from 'react';

/** Id, required and disabled of an input, taking defaults from the form field around it. */
export function useFieldProps(props: {
  id?: string | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
  'aria-describedby'?: string | undefined;
}) {
  const field = useField();
  const generated = useId();
  const describedBy =
    [field?.describedBy, props['aria-describedby']].filter(Boolean).join(' ') || undefined;
  return {
    id: props.id ?? field?.id ?? generated,
    labelId: field?.labelId,
    required: props.required ?? field?.required ?? false,
    disabled: props.disabled ?? field?.disabled ?? false,
    describedBy,
  };
}

/**
 * The value state to show: the one given by the application, or an error the
 * input found itself (e.g. text that is not a number).
 */
export function effectiveValueState(
  state: ValueState | undefined,
  message: ReactNode,
  internalError: string | null,
): { state: ValueState | undefined; message: ReactNode } {
  if (internalError !== null && (state === undefined || state === 'none')) {
    return { state: 'error', message: internalError };
  }
  if (internalError !== null && state === 'error')
    return { state, message: message ?? internalError };
  return { state, message };
}
