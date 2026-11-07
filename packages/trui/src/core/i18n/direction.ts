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

/** Writing direction of a language. */
export type Direction = 'ltr' | 'rtl';

/** The writing direction of `locale`, from `Intl.Locale` text info where available. */
export function directionOf(locale: string): Direction {
  const l = new Intl.Locale(locale) as Intl.Locale & {
    getTextInfo?: () => { direction: Direction };
    textInfo?: { direction: Direction };
  };
  const info = l.getTextInfo?.() ?? l.textInfo;
  if (info) return info.direction;
  const script = l.maximize().script;
  return script && ['Arab', 'Hebr', 'Thaa', 'Syrc', 'Nkoo', 'Adlm', 'Rohg'].includes(script)
    ? 'rtl'
    : 'ltr';
}
