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
  'input.belowMinimum': 'Geben Sie einen Wert ab {min} ein',
  'input.aboveMaximum': 'Geben Sie einen Wert bis {max} ein',
  'input.dateBeforeMinimum': 'Geben Sie ein Datum ab dem {min} ein',
  'input.dateAfterMaximum': 'Geben Sie ein Datum bis zum {max} ein',
  'input.placeholderDay': 'TT',
  'input.placeholderMonth': 'MM',
  'input.placeholderYear': 'JJJJ',
  'input.time': 'Uhrzeit',
  'input.date': 'Datum',
  'input.increase': 'Erhöhen',
  'input.decrease': 'Verringern',
  'select.placeholder': 'Auswählen',
  'select.noSelection': '(keine Auswahl)',
  'select.noResults': 'Keine Treffer',
  'select.showOptions': 'Optionen anzeigen',
  'select.removeValue': '{label} entfernen',
  'select.moreValues': '+{count}',
  'select.selectedValues': { one: '{count} Wert ausgewählt', other: '{count} Werte ausgewählt' },
  'calendar.open': 'Kalender öffnen',
  'calendar.previousMonth': 'Vorheriger Monat',
  'calendar.nextMonth': 'Nächster Monat',
  'calendar.today': 'Heute',
  'calendar.week': 'KW',
  'file.browse': 'Durchsuchen …',
  'file.remove': '{name} entfernen',
  'file.none': 'Keine Datei ausgewählt',
  'file.count': { one: '{count} Datei', other: '{count} Dateien' },
  'lookup.open': 'Wertehilfe öffnen',
  'lookup.title': 'Wert auswählen',
  'lookup.search': 'Suchen',
  'lookup.loadMore': 'Mehr laden',
  'lookup.results': { one: '{count} Treffer', other: '{count} Treffer' },
  'input.characterCount': { one: '{count} Zeichen', other: '{count} Zeichen' },
  'input.charactersLeft': { one: 'Noch {count} Zeichen', other: 'Noch {count} Zeichen' },
  'badge.overflow': '{max}+',
  'progress.value': '{value} Prozent',
  'link.external': 'öffnet in einem neuen Fenster',
  'toast.region': 'Benachrichtigungen',
  'toast.dismiss': 'Ausblenden',
  'banner.close': 'Meldung schließen',
  'messages.title': 'Meldungen',
  'messages.all': 'Alle',
  'messages.none': 'Keine Meldungen',
  'messages.button': { one: '{count} Meldung', other: '{count} Meldungen' },
  'menu.submenu': 'Untermenü',
  'list.itemCount': { one: '{count} Eintrag', other: '{count} Einträge' },
};
