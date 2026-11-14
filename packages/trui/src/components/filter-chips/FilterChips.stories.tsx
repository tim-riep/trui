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
import { type FilterChip, FilterChips } from './FilterChips';

/**
 * The active filters of a list or table. Each chip removes its filter; with
 * more than one filter, a button removes all of them. Name the filter in the
 * label, e.g. "Status: Open", so that the remove button says what it removes.
 *
 * **Keyboard:** Tab reaches the remove button of each chip; Enter or Space removes it.
 *
 * **Tokens:** `--trui-color-accent-subtle`, `--trui-color-accent-text`,
 * `--trui-radius-round`, `--trui-control-height-s`.
 */
const meta = {
  title: 'Data/Filter chips',
  component: FilterChips,
  args: { items: [], onRemove: () => undefined },
} satisfies Meta<typeof FilterChips>;

export default meta;
type Story = StoryObj<typeof meta>;

const initial: FilterChip[] = [
  { key: 'status', label: 'Status: Open' },
  { key: 'supplier', label: 'Supplier: Acme Corp' },
  { key: 'from', label: 'From Nov 1, 2026' },
];

function Demo() {
  const [items, setItems] = useState(initial);
  return (
    <FilterChips
      items={items}
      onRemove={(key) => setItems(items.filter((i) => i.key !== key))}
      onClearAll={() => setItems([])}
      endContent={`${items.length === 0 ? 240 : 17} orders`}
    />
  );
}

export const Default: Story = { render: () => <Demo /> };
