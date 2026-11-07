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

import type { TextValue } from '../texts/en';

/** Parameters of a text; `count` also selects the plural form. */
export type TextParams = Readonly<Record<string, string | number>>;

/**
 * Builds the text for `locale` from a text value: selects the plural form by
 * `params.count` and replaces `{name}` placeholders. Numbers are formatted
 * for the locale. Unknown placeholders stay as they are.
 */
export function formatText(value: TextValue, locale: string, params: TextParams = {}): string {
  let template: string;
  if (typeof value === 'string') {
    template = value;
  } else {
    const count = params.count;
    const n = typeof count === 'number' ? count : Number(count ?? Number.NaN);
    const exact = n === 0 && value.zero !== undefined ? 'zero' : null;
    const form = exact ?? (Number.isNaN(n) ? 'other' : new Intl.PluralRules(locale).select(n));
    template = value[form] ?? value.other;
  }
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, name: string) => {
    const p = params[name];
    if (p === undefined) return match;
    return typeof p === 'number' ? new Intl.NumberFormat(locale).format(p) : p;
  });
}
