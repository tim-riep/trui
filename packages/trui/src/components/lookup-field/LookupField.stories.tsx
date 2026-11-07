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
import { searchSuppliers } from '../../../../../catalog/data/sample';
import { FileInput } from '../file-input/FileInput';
import { LookupField } from './LookupField';

/**
 * A field with a value help: the button or F4 opens a dialog to search and pick
 * a value. The dialog knows no backend; `fetchItems` delivers the results page
 * by page. The value can also be typed directly.
 *
 * **Keyboard:** F4 or Alt+Arrow Down opens the dialog; Escape closes it.
 *
 * **Tokens:** as TextField and Dialog.
 */
const meta = {
  title: 'Inputs/LookupField',
  component: LookupField,
  args: {
    'aria-label': 'Supplier',
    fetchItems: searchSuppliers,
    defaultValue: 'S1000',
    description: 'Acme Corp',
  },
} satisfies Meta<typeof LookupField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** Selects files; the component lists them and uploads nothing itself. */
export const Files: Story = {
  render: () => (
    <div className="catalog-stack">
      <FileInput aria-label="Attachments" multiple accept=".pdf,.png" />
    </div>
  ),
};
