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

import { useCallback, useRef, useState } from 'react';

/**
 * State that a parent may control. The state is controlled when `value` is
 * not `undefined`; `null` is a controlled value like any other. Changing
 * from controlled to uncontrolled or back keeps working but is not intended.
 *
 * `onChange` is called with the new value and the extra arguments whenever
 * the component wants to change it, controlled or not, unless the value is
 * unchanged.
 */
export function useControllableState<T, A extends unknown[] = []>(
  value: T | undefined,
  defaultValue: T | (() => T),
  onChange?: (value: T, ...args: A) => void,
): [T, (next: T, ...args: A) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? value : internal;
  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const set = useCallback(
    (next: T, ...args: A) => {
      if (Object.is(next, currentRef.current)) return;
      if (!controlled) setInternal(() => next);
      currentRef.current = next;
      onChangeRef.current?.(next, ...args);
    },
    [controlled],
  );
  return [current, set];
}
