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

import type { IconDefinition } from '../icons/define-icon';

/** An entry of a selection: a value with its label. */
export interface ListItem {
  /** The value that is selected and submitted. */
  value: string;
  /** The text shown for the value. */
  label: string;
  /** A second line or column, e.g. a key or a city. */
  description?: string;
  icon?: IconDefinition;
  disabled?: boolean;
}

/** Loads the entries matching a search text; aborted when the text changes. */
export type LoadItems = (query: string, signal: AbortSignal) => Promise<readonly ListItem[]>;
