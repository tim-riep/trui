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

import { currencyScale } from '@tim-riep/trui/core';
import { NumberField, type NumberFieldProps } from '../number-field/NumberField';

/** Props of {@link AmountField}: those of a number field plus the currency. */
export type AmountFieldProps = NumberFieldProps & {
  /** ISO 4217 code of the currency, shown after the amount. */
  currency: string;
};

/**
 * An input for an amount of money in one currency, as exact decimal. The
 * number of fraction digits comes from the currency (2 for EUR, 0 for JPY)
 * unless `scale` is given. The currency itself is not part of the value.
 */
export function AmountField({ currency, scale, endContent, ...rest }: AmountFieldProps) {
  return (
    <NumberField
      {...(rest as NumberFieldProps)}
      scale={scale ?? currencyScale(currency)}
      endContent={endContent ?? <span className="trui-amount-field__currency">{currency}</span>}
      className={rest.className ? `trui-amount-field ${rest.className}` : 'trui-amount-field'}
    />
  );
}
