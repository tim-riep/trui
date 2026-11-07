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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { countries, loadCountries } from '../../../../../catalog/data/sample';
import { ComboBox } from '../combo-box/ComboBox';
import { MultiSelect } from '../multi-select/MultiSelect';
import { Select } from './Select';

/**
 * Choices from a list. `Select` picks one option; `ComboBox` suggests options
 * while typing, from fixed items or loaded with `loadItems`; `MultiSelect`
 * picks several and shows them as tokens.
 *
 * **Keyboard:** arrows open and move through the list, Home and End jump,
 * Enter picks, Escape closes; in Select, typing letters jumps to an option;
 * in MultiSelect, Backspace removes the last token.
 *
 * **Tokens:** as TextField, `--trui-color-surface-raised` and `--trui-shadow-m`
 * for the list, `--trui-color-selected` for selected options.
 */
const meta = {
  title: 'Inputs/Select',
  component: Select,
  args: { 'aria-label': 'Country', items: countries, defaultValue: 'DE' },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Nullable: Story = {
  args: { nullable: true, defaultValue: null, placeholder: 'No country' },
};

export const ComboBoxes: Story = {
  render: () => (
    <div className="catalog-stack">
      <ComboBox aria-label="Country" items={countries} defaultValue="FR" />
      <ComboBox
        aria-label="Country, loaded"
        loadItems={loadCountries}
        placeholder="Type to search"
      />
      <ComboBox aria-label="Free text" items={countries} allowCustomValue placeholder="Any text" />
    </div>
  ),
};

export const MultiSelects: Story = {
  render: () => (
    <div className="catalog-stack">
      <MultiSelect
        aria-label="Countries"
        items={countries}
        defaultValue={['DE', 'FR', 'IT', 'ES', 'NL']}
      />
      <MultiSelect aria-label="Countries, loaded" loadItems={loadCountries} />
    </div>
  ),
};
