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

import type { ListItem } from '@tim-riep/trui/core';

/** Index of the next enabled item from `from` in `direction`, or `from` if there is none. */
export function nextEnabled(
  items: readonly ListItem[],
  from: number,
  direction: 1 | -1,
  wrap = false,
): number {
  const n = items.length;
  if (n === 0) return -1;
  let i = from;
  for (let step = 0; step < n; step++) {
    i += direction;
    if (i < 0 || i >= n) {
      if (!wrap) return from;
      i = (i + n) % n;
    }
    if (!items[i]!.disabled) return i;
  }
  return from;
}

/** Index of the first or last enabled item. */
export function edgeEnabled(items: readonly ListItem[], last: boolean): number {
  return last ? nextEnabled(items, items.length, -1) : nextEnabled(items, -1, 1);
}

/**
 * Index of the next enabled item whose label starts with `text`, starting
 * after `from`, for jumping by typing.
 */
export function findByText(
  items: readonly ListItem[],
  text: string,
  from: number,
  locale: string,
): number {
  const query = text.toLocaleLowerCase(locale);
  const n = items.length;
  for (let step = 1; step <= n; step++) {
    const i = (from + step + n) % n;
    const item = items[i]!;
    if (!item.disabled && item.label.toLocaleLowerCase(locale).startsWith(query)) return i;
  }
  return -1;
}

/** Items whose label or description contains `query`, ignoring case. */
export function filterItems(items: readonly ListItem[], query: string, locale: string): ListItem[] {
  const q = query.trim().toLocaleLowerCase(locale);
  if (!q) return [...items];
  return items.filter(
    (item) =>
      item.label.toLocaleLowerCase(locale).includes(q) ||
      (item.description?.toLocaleLowerCase(locale).includes(q) ?? false),
  );
}

/** The id of the option element of item `index` in listbox `listboxId`. */
export function optionId(listboxId: string, index: number): string {
  return `${listboxId}-option-${index}`;
}
