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

// The core of the library: contexts, hooks and utilities shared by all
// components. It is an entry point of its own so that applications using
// module federation can share it as a singleton.

export { useControllableState } from './controllable/use-controllable-state';
export {
  addDays,
  addMonths,
  compareCanonical,
  type DateString,
  dateParts,
  daysInMonth,
  fromZoned,
  isDate,
  isTime,
  isTimestamp,
  makeDate,
  nowTimestamp,
  type TimeString,
  type TimestampString,
  timestampToDate,
  timeZoneOffset,
  today,
  toZoned,
  weekday,
} from './date/date';
export {
  type DateFieldOrder,
  dateFieldOrder,
  datePlaceholder,
  firstDayOfWeek,
  formatDate,
  formatDateForInput,
  formatTime,
  formatTimestamp,
  monthNames,
  parseLocalizedDate,
  parseLocalizedTime,
  uses12HourClock,
  weekdayNames,
} from './date/localized';
export {
  addDecimal,
  compareDecimal,
  type DecimalString,
  decimalDigits,
  isDecimal,
  negateDecimal,
  shiftDecimal,
  signDecimal,
  subtractDecimal,
  toScale,
  trimDecimal,
} from './decimal/decimal';
export {
  checkLimits,
  currencyScale,
  type DecimalFormatOptions,
  type DecimalOptions,
  type DecimalParseError,
  type DecimalParseResult,
  formatDecimal,
  formatDecimalForInput,
  type NumberSymbols,
  numberSymbols,
  parseLocalizedDecimal,
} from './decimal/localized';
export {
  FeedbackContext,
  type FeedbackState,
  type FeedbackTone,
  type MessageDialogEntry,
  type MessageDialogOptions,
  type ToastEntry,
  type ToastOptions,
  useFeedbackQueue,
  useMessageDialog,
  useToast,
} from './feedback/feedback';
export { focusFirst, isTabbable, tabbableElements } from './focus/focusable';
export { useFocusTrap } from './focus/use-focus-trap';
export { FieldContext, type FieldContextValue, useField } from './form/field-context';
export { HiddenValue, type HiddenValueProps } from './form/hidden-value';
export type { ListItem, LoadItems } from './form/list-item';
export { useFormReset } from './form/use-form-reset';
export type { ValueState } from './form/value-state';
export { type Direction, directionOf } from './i18n/direction';
export { formatText, type TextParams } from './i18n/format-text';
export { defineIcon, type IconDefinition, type IconShape } from './icons/define-icon';
export {
  type Align,
  computePosition,
  type Placement,
  type Position,
  type PositionOptions,
  type Rect,
  type Side,
} from './overlay/position';
export type {
  Density,
  LocaleState,
  Theme,
  ThemeSetting,
  ThemeState,
} from './provider/contexts';
export {
  type Formatters,
  type TextFunction,
  useDensity,
  useFormat,
  useIcon,
  useLocale,
  useOverlayContainer,
  useText,
  useTheme,
} from './provider/hooks';
export { IconProvider, type IconProviderProps } from './provider/icon-provider';
export { OverlayContainerProvider, Portal } from './provider/portal';
export {
  builtInTextPackages,
  TruiProvider,
  type TruiProviderProps,
  useSystemTheme,
} from './provider/trui-provider';
export { de } from './texts/de';
export { en, type PluralText, type TextKey, type TextPackage, type TextValue } from './texts/en';
