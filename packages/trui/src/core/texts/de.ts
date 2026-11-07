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

import type { TextPackage } from './en';

/** The German texts of the library. */
export const de: TextPackage = {
  'common.cancel': 'Abbrechen',
  'common.close': 'Schließen',
  'common.ok': 'OK',
  'common.save': 'Sichern',
  'common.delete': 'Löschen',
  'common.edit': 'Bearbeiten',
  'common.search': 'Suchen',
  'common.clear': 'Leeren',
  'common.more': 'Mehr',
  'common.loading': 'Wird geladen …',
  'common.noData': 'Keine Daten',
  'common.required': 'Pflichtfeld',
  'common.optional': 'Optional',
  'valueState.error': 'Fehler',
  'valueState.warning': 'Warnung',
  'valueState.success': 'Erfolg',
  'valueState.information': 'Information',
  'input.invalidNumber': 'Geben Sie eine gültige Zahl ein',
  'input.tooManyIntegerDigits': 'Geben Sie höchstens {digits} Stellen vor dem Komma ein',
  'input.tooManyFractionDigits': 'Geben Sie höchstens {digits} Stellen nach dem Komma ein',
  'input.invalidDate': 'Geben Sie ein gültiges Datum ein',
  'input.invalidTime': 'Geben Sie eine gültige Uhrzeit ein',
  'input.characterCount': { one: '{count} Zeichen', other: '{count} Zeichen' },
  'input.charactersLeft': { one: 'Noch {count} Zeichen', other: 'Noch {count} Zeichen' },
  'badge.overflow': '{max}+',
  'progress.value': '{value} Prozent',
  'link.external': 'öffnet in einem neuen Fenster',
  'list.itemCount': { one: '{count} Eintrag', other: '{count} Einträge' },
};
