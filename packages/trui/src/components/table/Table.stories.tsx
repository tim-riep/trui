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
import { useFormat } from '@tim-riep/trui/core';
import { useMemo, useState } from 'react';
import { makeOrders, type Order } from '../../../../../catalog/data/sample';
import { NumberField } from '../number-field/NumberField';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { Table } from './Table';
import type { TableColumn, TablePageRequest, TableSort } from './table-data';

/**
 * A table of data. Rows come as array (sorted in the table) or are loaded
 * page by page; only visible rows are rendered, so ten thousand rows scroll
 * smoothly. Columns can be sorted and resized, rows selected, chosen and
 * given actions; cells can hold inputs for editing.
 *
 * **Keyboard:** Tab reaches one cell; arrows move between cells, Home and End
 * along the row, Ctrl+Home and Ctrl+End to the first and last row, Page Up
 * and Page Down by a screen. Enter sorts in a header, chooses a row or moves
 * into the controls of a cell (also F2); Escape returns to the cell; Space
 * selects; Alt+Arrow Left and Right resize a column in its header.
 *
 * **Tokens:** `--trui-row-height`, `--trui-color-surface-subtle` for the header,
 * `--trui-color-selected`, `--trui-color-border-subtle`.
 */
const meta = { title: 'Data/Table', component: Table } satisfies Meta<typeof Table>;
export default meta;

const tones = {
  open: 'neutral',
  released: 'accent',
  delivered: 'success',
  blocked: 'error',
} as const;

function useColumns(): TableColumn<Order>[] {
  const format = useFormat();
  return useMemo(
    () => [
      { key: 'id', header: 'Order', width: 120, sortable: true },
      { key: 'supplier', header: 'Supplier', width: 200, sortable: true },
      { key: 'city', header: 'City', width: 120, sortable: true },
      {
        key: 'date',
        header: 'Date',
        width: 120,
        sortable: true,
        renderCell: (o) => format.date(o.date, 'medium'),
      },
      {
        key: 'amount',
        header: 'Net amount',
        width: 140,
        align: 'end',
        sortable: true,
        renderCell: (o) => format.decimal(o.amount, { scale: 2, currency: o.currency }),
      },
      {
        key: 'status',
        header: 'Status',
        width: 120,
        sortable: true,
        renderCell: (o) => <Tag tone={tones[o.status]}>{o.status}</Tag>,
      },
    ],
    [format],
  );
}

function Large() {
  const rows = useMemo(() => makeOrders(10_000), []);
  const columns = useColumns();
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [pressed, setPressed] = useState('');
  return (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      <Table
        aria-label="Purchase orders"
        columns={columns}
        rows={rows}
        getRowKey={(o) => o.id}
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
        onRowPress={(o) => setPressed(o.id)}
        rowActions={() => [
          { key: 'edit', label: 'Edit' },
          { key: 'delete', label: 'Delete', danger: true },
        ]}
        onRowAction={(key, o) => setPressed(`${key} ${o.id}`)}
        height={420}
      />
      <Text tone="secondary">
        {selected.size} selected · last chosen: {pressed || 'none'}
      </Text>
    </div>
  );
}

export const TenThousandRows: StoryObj = { render: () => <Large /> };

function Loaded() {
  const all = useMemo(() => makeOrders(2_000), []);
  const columns = useColumns();
  const loadPage = useMemo(
    () =>
      ({ offset, limit, sort, signal }: TablePageRequest) =>
        new Promise<{ rows: Order[]; total: number }>((resolve, reject) => {
          const timer = setTimeout(() => {
            const sorted = sort
              ? [...all].sort((a, b) => {
                  const x = String(a[sort.column as keyof Order]);
                  const y = String(b[sort.column as keyof Order]);
                  return (
                    (sort.direction === 'ascending' ? 1 : -1) *
                    x.localeCompare(y, undefined, { numeric: true })
                  );
                })
              : all;
            resolve({ rows: sorted.slice(offset, offset + limit), total: sorted.length });
          }, 400);
          signal.addEventListener('abort', () => {
            clearTimeout(timer);
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    [all],
  );
  return (
    <Table
      aria-label="Loaded orders"
      columns={columns}
      loadPage={loadPage}
      getRowKey={(o) => o.id}
      height={360}
    />
  );
}

/** Rows loaded page by page as they scroll into view, sorted by the loader. */
export const LoadedPageByPage: StoryObj = { render: () => <Loaded /> };

function Editable() {
  const [rows, setRows] = useState(() => makeOrders(8));
  const [sort, setSort] = useState<TableSort | null>(null);
  const columns: TableColumn<Order>[] = [
    { key: 'id', header: 'Order', width: 120 },
    { key: 'supplier', header: 'Supplier', width: 200 },
    {
      key: 'quantity',
      header: 'Quantity',
      width: 140,
      align: 'end',
      sortable: true,
      renderCell: (o) => (
        <NumberField
          aria-label={`Quantity of order ${o.id}`}
          value={o.quantity}
          scale={0}
          tabIndex={-1}
          onChange={(quantity) =>
            setRows((before) => before.map((r) => (r.id === o.id ? { ...r, quantity } : r)))
          }
        />
      ),
    },
  ];
  return (
    <Table
      aria-label="Editable orders"
      columns={columns}
      rows={rows}
      getRowKey={(o) => o.id}
      sort={sort}
      onSortChange={setSort}
      height={320}
    />
  );
}

/** Cells with inputs: Enter or F2 moves into the input, Escape back to the cell. */
export const EditableCells: StoryObj = { render: () => <Editable /> };

export const Empty: StoryObj = {
  render: () => {
    const columns = useColumns();
    return (
      <Table
        aria-label="No orders"
        columns={columns}
        rows={[]}
        getRowKey={(o) => o.id}
        height={200}
      />
    );
  },
};
