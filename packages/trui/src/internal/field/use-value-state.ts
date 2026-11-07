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

import type { ValueState } from '@tim-riep/trui/core';
import { type ReactNode, useId } from 'react';

/** What an input needs to show and announce its value state. */
export interface ValueStateInfo {
  state: ValueState;
  message: ReactNode;
  /** Id of the message element. */
  messageId: string;
  /** `aria-describedby` of the input: the message and ids given by the caller. */
  describedBy: string | undefined;
  /** `aria-invalid` of the input. */
  invalid: true | undefined;
}

/** Derives the ARIA attributes of an input from its value state. */
export function useValueState(
  state: ValueState | undefined,
  message: ReactNode,
  describedBy: string | undefined,
): ValueStateInfo {
  const messageId = useId();
  const s = state ?? 'none';
  const hasMessage =
    s !== 'none' &&
    message !== undefined &&
    message !== null &&
    message !== false &&
    message !== '';
  const ids = [describedBy, hasMessage ? messageId : undefined].filter(Boolean).join(' ');
  return {
    state: s,
    message: hasMessage ? message : null,
    messageId,
    describedBy: ids || undefined,
    invalid: s === 'error' ? true : undefined,
  };
}
