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
import { useState } from 'react';
import { ColumnChooser } from './ColumnChooser';

/**
 * Lets the user show and hide columns, e.g. of a table: pass the same
 * `hiddenColumns` to the table. The last shown column cannot be hidden.
 *
 * **Keyboard:** Enter or Space opens the list; Tab moves between the columns,
 * Space toggles one, Escape closes the list and returns to the button.
 */
const meta = {
  title: 'Data/Column chooser',
  component: ColumnChooser,
  args: { columns: [], hiddenColumns: new Set(), onHiddenColumnsChange: () => undefined },
} satisfies Meta<typeof ColumnChooser>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  { key: 'order', header: 'Order' },
  { key: 'supplier', header: 'Supplier' },
  { key: 'city', header: 'City' },
  { key: 'date', header: 'Delivery date' },
  { key: 'amount', header: 'Net amount' },
];

function Demo() {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set(['city']));
  return (
    <div className="catalog-row">
      <ColumnChooser columns={columns} hiddenColumns={hidden} onHiddenColumnsChange={setHidden} />
      <span>
        Shown:{' '}
        {columns
          .filter((c) => !hidden.has(c.key))
          .map((c) => c.header)
          .join(', ')}
      </span>
    </div>
  );
}

export const Default: Story = { render: () => <Demo /> };
