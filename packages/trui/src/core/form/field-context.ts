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

import { createContext, useContext } from 'react';

/** What a form field tells the input inside it. */
export interface FieldContextValue {
  /** Id for the input, which the label of the field points to. */
  id: string;
  /** Id of the label, for inputs that are labelled by reference (groups). */
  labelId: string;
  /** Ids of help texts of the field, for `aria-describedby`. */
  describedBy: string | undefined;
  required: boolean;
  disabled: boolean;
}

/** Set by a form field for the input it contains. */
export const FieldContext = createContext<FieldContextValue | null>(null);
FieldContext.displayName = 'TruiFieldContext';

/** The form field around an input, if any. */
export function useField(): FieldContextValue | null {
  return useContext(FieldContext);
}
