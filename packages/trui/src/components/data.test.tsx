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

import { render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../styles.css';
import { List } from './list/List';
import { NumberField } from './number-field/NumberField';
import { Table } from './table/Table';
import { compareValues, type TableColumn, type TablePageRequest } from './table/table-data';

interface Row {
  id: string;
  name: string;
  amount: string;
  qty?: string;
}

const rows: Row[] = [
  { id: 'a', name: 'Beta', amount: '10.00' },
  { id: 'b', name: 'alpha', amount: '9.99' },
  { id: 'c', name: 'Gamma', amount: '100.50' },
  { id: 'd', name: 'Delta', amount: '-1.00' },
];
const columns: TableColumn<Row>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'amount', header: 'Amount', align: 'end', sortable: true },
];
const cellText = (row: number, col: number) =>
  document.querySelector(`[data-cell="${row}:${col}"]`)?.textContent ?? null;

function EditTable() {
  const [data, setData] = useState<Row[]>([{ id: 'a', name: 'Beta', amount: '1.00', qty: '3' }]);
  return (
    <Table
      aria-label="Edit"
      rows={data}
      getRowKey={(r) => r.id}
      height={200}
      columns={[
        { key: 'name', header: 'Name' },
        {
          key: 'qty',
          header: 'Quantity',
          renderCell: (r) => (
            <NumberField
              aria-label="Quantity"
              tabIndex={-1}
              value={r.qty ?? ''}
              onChange={(qty) => setData((d) => d.map((x) => (x.id === r.id ? { ...x, qty } : x)))}
            />
          ),
        },
      ]}
    />
  );
}

describe('compareValues', () => {
  it('compares decimals exactly and text in the order of the locale', () => {
    const collator = new Intl.Collator('de', { numeric: true, sensitivity: 'base' });
    expect(compareValues('9.99', '10.00', collator)).toBeLessThan(0);
    expect(compareValues('0.30', '0.3', collator)).toBe(0);
    expect(compareValues('Äpfel', 'Birnen', collator)).toBeLessThan(0);
    expect(compareValues('Order 9', 'Order 10', collator)).toBeLessThan(0);
    expect(compareValues(null, 'a', collator)).toBeGreaterThan(0);
  });
});

describe('Table', () => {
  it('sorts by header click and Enter, ascending, descending and off', async () => {
    const onSortChange = vi.fn();
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onSortChange={onSortChange}
        height={300}
      />,
    );
    const amount = screen.getByRole('columnheader', { name: 'Amount' });
    expect(amount.getAttribute('aria-sort')).toBe('none');
    await userEvent.click(amount);
    expect(amount.getAttribute('aria-sort')).toBe('ascending');
    expect([0, 1, 2, 3].map((r) => cellText(r, 1))).toEqual(['-1.00', '9.99', '10.00', '100.50']);
    amount.focus();
    await userEvent.keyboard('{Enter}');
    expect(amount.getAttribute('aria-sort')).toBe('descending');
    expect(cellText(0, 1)).toBe('100.50');
    await userEvent.keyboard('{Enter}');
    expect(onSortChange).toHaveBeenLastCalledWith(null);
    expect(cellText(0, 0)).toBe('Beta');
  });

  it('moves between cells with the keyboard and chooses rows', async () => {
    const onRowPress = vi.fn();
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onRowPress={onRowPress}
        height={300}
      />,
    );
    const grid = screen.getByRole('grid', { name: 'Orders' });
    expect(within(grid).getAllByRole('columnheader')[0]!.tabIndex).toBe(0);
    within(grid).getAllByRole('columnheader')[0]!.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await expect.poll(() => document.activeElement?.getAttribute('data-cell')).toBe('0:1');
    await userEvent.keyboard('{Control>}{End}{/Control}');
    await expect.poll(() => document.activeElement?.getAttribute('data-cell')).toBe('3:1');
    await userEvent.keyboard('{Home}');
    await expect.poll(() => document.activeElement?.getAttribute('data-cell')).toBe('3:0');
    await userEvent.keyboard('{Enter}');
    expect(onRowPress).toHaveBeenCalledWith(rows[3]);
  });

  it('selects rows with checkboxes, Shift for ranges, Space and the header checkbox', async () => {
    const onSelectionChange = vi.fn();
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
        height={300}
      />,
    );
    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-multiselectable')).toBe('true');
    const boxes = within(grid).getAllByRole('checkbox', { name: 'Select row' });
    await userEvent.click(boxes[0]!);
    await userEvent.keyboard('{Shift>}');
    await userEvent.click(boxes[2]!);
    await userEvent.keyboard('{/Shift}');
    expect([...onSelectionChange.mock.lastCall![0]].sort()).toEqual(['a', 'b', 'c']);
    expect(
      within(grid)
        .getAllByRole('row')
        .filter((r) => r.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(3);
    const header = within(grid).getByRole('checkbox', {
      name: 'Select all rows',
    }) as HTMLInputElement;
    expect(header.indeterminate).toBe(true);
    await userEvent.click(header);
    expect(onSelectionChange.mock.lastCall![0].size).toBe(4);
    document.querySelector<HTMLElement>('[data-cell="1:1"]')!.focus();
    await userEvent.keyboard(' ');
    expect(onSelectionChange.mock.lastCall![0].has('b')).toBe(false);
  });

  it('renders only the visible rows of a large table and scrolls to rows reached by keyboard', async () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
      amount: `${i}.00`,
    }));
    render(
      <Table
        aria-label="Many"
        columns={columns}
        rows={many}
        getRowKey={(r) => r.id}
        height={300}
      />,
    );
    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-rowcount')).toBe('5001');
    expect(document.querySelectorAll('tbody tr.trui-table__row').length).toBeLessThan(40);
    document.querySelector<HTMLElement>('[data-cell="0:0"]')!.focus();
    await userEvent.keyboard('{Control>}{End}{/Control}');
    await vi.waitFor(() => expect(document.activeElement?.textContent).toBe('Row 4999'));
    expect(document.activeElement?.closest('tr')?.getAttribute('aria-rowindex')).toBe('5001');
  });

  it('loads pages as needed and starts over when the sorting changes', async () => {
    const all = Array.from({ length: 120 }, (_, i) => ({
      id: String(i),
      name: `Row ${i}`,
      amount: '1.00',
    }));
    const requests: TablePageRequest[] = [];
    const loadPage = vi.fn(async (request: TablePageRequest) => {
      requests.push(request);
      const sorted = request.sort?.direction === 'descending' ? [...all].reverse() : all;
      return {
        rows: sorted.slice(request.offset, request.offset + request.limit),
        total: all.length,
      };
    });
    render(
      <Table
        aria-label="Loaded"
        columns={columns}
        loadPage={loadPage}
        pageSize={20}
        getRowKey={(r) => r.id}
        height={300}
      />,
    );
    expect(screen.getByRole('grid').getAttribute('aria-busy')).toBe('true');
    await vi.waitFor(() => expect(cellText(0, 0)).toBe('Row 0'));
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('121');
    expect(requests.every((r) => r.offset < 60)).toBe(true);
    const name = screen.getByRole('columnheader', { name: 'Name' });
    await userEvent.click(name);
    await userEvent.click(name);
    await vi.waitFor(() => expect(cellText(0, 0)).toBe('Row 119'));
    expect(requests.filter((r) => r.sort === null).every((r) => r.signal.aborted)).toBe(true);
  });

  it('shows an empty state', () => {
    render(
      <Table
        aria-label="None"
        columns={columns}
        rows={[]}
        getRowKey={(r) => r.id}
        renderEmpty={() => 'No orders yet'}
        height={200}
      />,
    );
    expect(screen.getByText('No orders yet')).toBeTruthy();
  });

  it('offers row actions in a menu', async () => {
    const onRowAction = vi.fn();
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        rowActions={() => [{ key: 'delete', label: 'Delete' }]}
        onRowAction={onRowAction}
        height={300}
      />,
    );
    await userEvent.click(screen.getAllByRole('button', { name: 'Actions' })[1]!);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    expect(onRowAction).toHaveBeenCalledWith('delete', rows[1]);
  });

  it('resizes columns by keyboard', async () => {
    const onColumnResize = vi.fn();
    render(
      <Table
        aria-label="Orders"
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        onColumnResize={onColumnResize}
        height={300}
      />,
    );
    screen.getByRole('columnheader', { name: 'Name' }).focus();
    await userEvent.keyboard('{Alt>}{ArrowRight}{ArrowRight}{/Alt}');
    expect(onColumnResize).toHaveBeenLastCalledWith('name', 192);
  });

  it('moves into the controls of a cell with Enter and back with Escape', async () => {
    render(<EditTable />);
    const cell = document.querySelector<HTMLElement>('[data-cell="0:1"]')!;
    cell.focus();
    await userEvent.keyboard('{Enter}');
    const input = within(cell).getByRole('textbox');
    expect(document.activeElement).toBe(input);
    await userEvent.clear(input);
    await userEvent.type(input, '12');
    await userEvent.keyboard('{Escape}');
    expect(document.activeElement).toBe(cell);
    expect(input).toHaveProperty('value', '12');
  });
});

describe('List', () => {
  const items = [
    { key: 'a', title: 'Acme Corp', description: 'Hamburg', info: '12 orders' },
    { key: 'b', title: 'Brightline', description: 'Lyon' },
    { key: 'c', title: 'Calder', description: 'Milan', disabled: true },
  ];

  it('chooses entries with click and Enter and moves with the keyboard', async () => {
    const onItemPress = vi.fn();
    render(<List aria-label="Suppliers" items={items} onItemPress={onItemPress} navigable />);
    const list = screen.getByRole('list', { name: 'Suppliers' });
    const entries = within(list).getAllByRole('listitem');
    entries[0]!.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(entries[1]);
    await userEvent.keyboard('{Enter}');
    expect(onItemPress).toHaveBeenLastCalledWith(items[1]);
    await userEvent.keyboard('a');
    expect(document.activeElement).toBe(entries[0]);
  });

  it('selects several entries and skips disabled ones', async () => {
    const onSelectionChange = vi.fn();
    render(
      <List
        aria-label="Suppliers"
        items={items}
        selectionMode="multiple"
        onSelectionChange={onSelectionChange}
      />,
    );
    const listbox = screen.getByRole('listbox');
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    const options = within(listbox).getAllByRole('option');
    await userEvent.click(options[0]!);
    options[1]!.focus();
    await userEvent.keyboard(' ');
    await userEvent.click(options[2]!, { force: true });
    expect([...onSelectionChange.mock.lastCall![0]]).toEqual(['a', 'b']);
    expect(options[0]!.getAttribute('aria-selected')).toBe('true');
  });

  it('loads more entries', async () => {
    const onLoadMore = vi.fn();
    render(<List aria-label="Suppliers" items={items} total={10} onLoadMore={onLoadMore} />);
    await userEvent.click(screen.getByRole('button', { name: /Load more/ }));
    expect(onLoadMore).toHaveBeenCalled();
    expect(screen.getByText(/3 of 10/)).toBeTruthy();
  });
});
