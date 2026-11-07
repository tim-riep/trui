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

import { type RefObject, useEffect, useRef } from 'react';

/**
 * Calls `onReset` when the native form that contains `ref` is reset, so that
 * uncontrolled fields return to their default value.
 */
export function useFormReset(ref: RefObject<HTMLElement | null>, onReset: () => void): void {
  const callback = useRef(onReset);
  callback.current = onReset;
  useEffect(() => {
    const form = ref.current?.closest('form');
    if (!form) return;
    const handler = () => callback.current();
    form.addEventListener('reset', handler);
    return () => form.removeEventListener('reset', handler);
  }, [ref]);
}
