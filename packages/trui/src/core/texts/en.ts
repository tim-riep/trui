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

/**
 * The English texts of the library. Every other text package has the same
 * keys. A text is a string with `{name}` placeholders, or plural forms
 * selected by the parameter `count`.
 */
export const en = {
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.ok': 'OK',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.search': 'Search',
  'common.clear': 'Clear',
  'common.more': 'More',
  'common.loading': 'Loading…',
  'common.noData': 'No data',
  'common.required': 'Required',
  'common.optional': 'Optional',
  'valueState.error': 'Error',
  'valueState.warning': 'Warning',
  'valueState.success': 'Success',
  'valueState.information': 'Information',
  'input.invalidNumber': 'Enter a valid number',
  'input.tooManyIntegerDigits': 'Enter at most {digits} digits before the decimal separator',
  'input.tooManyFractionDigits': 'Enter at most {digits} digits after the decimal separator',
  'input.invalidDate': 'Enter a valid date',
  'input.invalidTime': 'Enter a valid time',
  'input.belowMinimum': 'Enter a value of at least {min}',
  'input.aboveMaximum': 'Enter a value of at most {max}',
  'input.dateBeforeMinimum': 'Enter a date on or after {min}',
  'input.dateAfterMaximum': 'Enter a date on or before {max}',
  'input.placeholderDay': 'DD',
  'input.placeholderMonth': 'MM',
  'input.placeholderYear': 'YYYY',
  'input.time': 'Time',
  'input.date': 'Date',
  'input.increase': 'Increase',
  'input.decrease': 'Decrease',
  'select.placeholder': 'Select',
  'select.noSelection': '(none)',
  'select.noResults': 'No matches',
  'select.showOptions': 'Show options',
  'select.removeValue': 'Remove {label}',
  'select.moreValues': '+{count}',
  'select.selectedValues': { one: '{count} value selected', other: '{count} values selected' },
  'calendar.open': 'Open calendar',
  'calendar.previousMonth': 'Previous month',
  'calendar.nextMonth': 'Next month',
  'calendar.today': 'Today',
  'calendar.week': 'Week',
  'file.browse': 'Browse…',
  'file.remove': 'Remove {name}',
  'file.none': 'No file selected',
  'file.count': { one: '{count} file', other: '{count} files' },
  'lookup.open': 'Open value help',
  'lookup.title': 'Select a value',
  'lookup.search': 'Search',
  'lookup.loadMore': 'Load more',
  'lookup.results': { one: '{count} result', other: '{count} results' },
  'input.characterCount': { one: '{count} character', other: '{count} characters' },
  'input.charactersLeft': { one: '{count} character left', other: '{count} characters left' },
  'badge.overflow': '{max}+',
  'progress.value': '{value} percent',
  'link.external': 'opens in a new window',
  'toast.region': 'Notifications',
  'toast.dismiss': 'Dismiss',
  'banner.close': 'Close message',
  'messages.title': 'Messages',
  'messages.all': 'All',
  'messages.none': 'No messages',
  'messages.button': { one: '{count} message', other: '{count} messages' },
  'menu.submenu': 'Submenu',
  'breadcrumbs.label': 'Breadcrumb',
  'pageHeader.expand': 'Expand header',
  'pageHeader.collapse': 'Collapse header',
  'pageHeader.pin': 'Pin header',
  'splitLayout.back': 'Back to the list',
  'splitLayout.showList': 'Show list',
  'splitLayout.hideList': 'Hide list',
  'sideNavigation.label': 'Navigation',
  'sideNavigation.expand': 'Expand navigation',
  'sideNavigation.collapse': 'Collapse navigation',
  'tabs.scrollStart': 'Earlier tabs',
  'tabs.scrollEnd': 'Later tabs',
  'table.selectAll': 'Select all rows',
  'table.selectRow': 'Select row',
  'table.rowActions': 'Actions',
  'table.resizeColumn': 'Resize column {column}',
  'table.loadingRow': 'Loading',
  'table.rowCount': { one: '{count} row', other: '{count} rows' },
  'list.loadMore': 'Load more',
  'list.shown': '{shown} of {total}',
  'list.itemCount': { one: '{count} item', other: '{count} items' },
} as const satisfies Record<string, TextValue>;

/** Plural forms of a text, selected with `Intl.PluralRules`. */
export interface PluralText {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/** A text of a text package. */
export type TextValue = string | PluralText;

/** The keys of the texts of the library. */
export type TextKey = keyof typeof en;

/** A complete text package: a text for every key. */
export type TextPackage = { readonly [K in TextKey]: TextValue };
