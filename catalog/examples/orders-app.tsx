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

// An example of a typical business page built from the components alone,
// with static data: a list of purchase orders with a filter bar, and the
// detail page of an order with a form.

import {
  AmountField,
  Banner,
  Breadcrumbs,
  Button,
  ColumnChooser,
  DatePicker,
  EmptyState,
  FilterChips,
  Form,
  FormField,
  FormGroup,
  Icon,
  LookupField,
  type Message,
  MessagesButton,
  MultiSelect,
  Page,
  PageHeader,
  RadioGroup,
  Select,
  Table,
  type TableColumn,
  Tag,
  Text,
  TextArea,
  TextField,
  Toolbar,
} from '@tim-riep/trui';
import { useFormat, useMessageDialog, useToast, useUnsavedChanges } from '@tim-riep/trui/core';
import { addIcon } from '@tim-riep/trui/icons/add';
import { deleteIcon } from '@tim-riep/trui/icons/delete';
import { exportIcon } from '@tim-riep/trui/icons/export';
import { searchIcon } from '@tim-riep/trui/icons/search';
import { useMemo, useState } from 'react';
import { countries, makeOrders, type Order, searchSuppliers, suppliers } from '../data/sample';

const statusTone = {
  open: 'neutral',
  released: 'accent',
  delivered: 'success',
  blocked: 'error',
} as const;
const statusItems = [
  { value: 'open', label: 'Open' },
  { value: 'released', label: 'Released' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'blocked', label: 'Blocked' },
];
const statusLabel = (s: Order['status']) => statusItems.find((i) => i.value === s)!.label;

interface Filter {
  query: string;
  status: string | null;
  from: string | null;
  suppliers: readonly string[];
}

function OrderList({
  orders,
  onOpen,
  onDelete,
}: {
  orders: readonly Order[];
  onOpen: (order: Order) => void;
  onDelete: (ids: readonly string[]) => void;
}) {
  const format = useFormat();
  const [filter, setFilter] = useState<Filter>({
    query: '',
    status: null,
    from: null,
    suppliers: [],
  });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set(['city']));
  const clearFilter = () => setFilter({ query: '', status: null, from: null, suppliers: [] });
  const chips = [
    ...(filter.query.trim() ? [{ key: 'query', label: `Search: ${filter.query.trim()}` }] : []),
    ...(filter.status !== null
      ? [{ key: 'status', label: `Status: ${statusLabel(filter.status as Order['status'])}` }]
      : []),
    ...(filter.from !== null ? [{ key: 'from', label: `From ${format.date(filter.from)}` }] : []),
    ...filter.suppliers.map((name) => ({ key: `supplier:${name}`, label: name })),
  ];
  const removeChip = (key: string) => {
    if (key === 'query') setFilter({ ...filter, query: '' });
    else if (key === 'status') setFilter({ ...filter, status: null });
    else if (key === 'from') setFilter({ ...filter, from: null });
    else
      setFilter({
        ...filter,
        suppliers: filter.suppliers.filter((n) => `supplier:${n}` !== key),
      });
  };
  const supplierNames = useMemo(
    () =>
      [...new Set(orders.map((o) => o.supplier))]
        .sort()
        .map((name) => ({ value: name, label: name })),
    [orders],
  );

  const shown = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (!q || o.id.includes(q) || o.supplier.toLowerCase().includes(q)) &&
        (filter.status === null || o.status === filter.status) &&
        (filter.from === null || o.date >= filter.from) &&
        (filter.suppliers.length === 0 || filter.suppliers.includes(o.supplier)),
    );
  }, [orders, filter]);

  const columns: TableColumn<Order>[] = [
    { key: 'id', header: 'Order', width: 120, sortable: true },
    { key: 'supplier', header: 'Supplier', width: 200, sortable: true },
    { key: 'city', header: 'City', width: 110, sortable: true },
    {
      key: 'date',
      header: 'Delivery date',
      width: 130,
      sortable: true,
      renderCell: (o) => format.date(o.date),
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
      width: 110,
      sortable: true,
      renderCell: (o) => <Tag tone={statusTone[o.status]}>{statusLabel(o.status)}</Tag>,
    },
  ];

  return (
    <Page
      header={
        <PageHeader
          title="Purchase orders"
          subtitle={`${shown.length} of ${orders.length} orders`}
          actions={
            <Toolbar
              aria-label="Order actions"
              onAction={(key) => {
                if (key === 'delete') {
                  onDelete([...selected]);
                  setSelected(new Set());
                }
              }}
              items={[
                {
                  key: 'create',
                  label: 'Create',
                  icon: addIcon,
                  variant: 'primary',
                  overflow: 'never',
                },
                { key: 'delete', label: 'Delete', icon: deleteIcon, disabled: selected.size === 0 },
                {
                  key: 'export',
                  label: 'Export',
                  icon: exportIcon,
                  menu: [
                    { key: 'csv', label: 'As CSV' },
                    { key: 'xlsx', label: 'As spreadsheet' },
                  ],
                },
              ]}
            />
          }
        />
      }
    >
      <div className="example-stack">
        <search className="example-filter" aria-label="Filter orders">
          <TextField
            aria-label="Search"
            placeholder="Order or supplier"
            value={filter.query}
            onChange={(query) => setFilter({ ...filter, query })}
            startContent={<Icon icon={searchIcon} size="s" />}
          />
          <Select
            aria-label="Status"
            nullable
            placeholder="All statuses"
            items={statusItems}
            value={filter.status}
            onChange={(status) => setFilter({ ...filter, status })}
          />
          <DatePicker
            aria-label="Delivery from"
            nullable
            value={filter.from}
            onChange={(from) => setFilter({ ...filter, from })}
          />
          <MultiSelect
            aria-label="Suppliers"
            placeholder="All suppliers"
            items={supplierNames}
            value={filter.suppliers}
            onChange={(list) => setFilter({ ...filter, suppliers: list })}
          />
          <ColumnChooser
            columns={columns}
            hiddenColumns={hidden}
            onHiddenColumnsChange={setHidden}
          />
        </search>
        <FilterChips items={chips} onRemove={removeChip} onClearAll={clearFilter} />
        <Table
          aria-label="Purchase orders"
          columns={columns}
          rows={shown}
          getRowKey={(o) => o.id}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={setSelected}
          onRowPress={onOpen}
          rowActions={() => [
            { key: 'open', label: 'Open' },
            { key: 'delete', label: 'Delete', danger: true },
          ]}
          onRowAction={(key, o) => (key === 'open' ? onOpen(o) : onDelete([o.id]))}
          hiddenColumns={hidden}
          renderEmpty={() => (
            <EmptyState
              icon={searchIcon}
              title="No orders match the filter"
              description="Remove a filter or search for another order."
              actions={<Button onClick={clearFilter}>Clear filters</Button>}
            />
          )}
          height={460}
        />
      </div>
    </Page>
  );
}

interface Draft {
  supplierId: string | null;
  contact: string;
  country: string | null;
  date: string | null;
  amount: string | null;
  shipping: string | null;
  note: string | null;
}

function OrderDetail({
  order,
  onBack,
  onSave,
  onDelete,
}: {
  order: Order;
  onBack: () => void;
  onSave: (order: Order) => void;
  onDelete: (id: string) => void;
}) {
  const format = useFormat();
  const toast = useToast();
  const messages = useMessageDialog();
  const supplier = suppliers.find((s) => s.label === order.supplier);
  const [saved, setSaved] = useState<Draft>(() => ({
    supplierId: supplier?.value ?? null,
    contact: '',
    country: 'DE',
    date: order.date,
    amount: order.amount,
    shipping: 'standard',
    note: null,
  }));
  const [draft, setDraft] = useState<Draft>(saved);
  const dirty = (Object.keys(draft) as (keyof Draft)[]).some((k) => draft[k] !== saved[k]);
  const { confirmLeave } = useUnsavedChanges(dirty);
  const leave = async () => {
    if (await confirmLeave()) onBack();
  };
  const [checked, setChecked] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft({ ...draft, [key]: value });

  const problems: Message[] = [
    ...(draft.supplierId
      ? []
      : [
          {
            id: 'supplier',
            type: 'error' as const,
            title: 'Enter a supplier',
            target: 'order-supplier',
          },
        ]),
    ...(draft.date
      ? []
      : [
          {
            id: 'date',
            type: 'error' as const,
            title: 'Enter a delivery date',
            target: 'order-date',
          },
        ]),
    ...(draft.amount
      ? []
      : [
          {
            id: 'amount',
            type: 'error' as const,
            title: 'Enter the net amount',
            target: 'order-amount',
          },
        ]),
    ...(order.status === 'blocked'
      ? [
          {
            id: 'blocked',
            type: 'warning' as const,
            title: 'The supplier is blocked for new orders',
          },
        ]
      : []),
  ];
  const errors = problems.filter((p) => p.type === 'error');
  const state = (id: string) => (checked && errors.some((e) => e.id === id) ? 'error' : 'none');

  const save = () => {
    setChecked(true);
    if (errors.length > 0) return;
    onSave({ ...order, date: draft.date!, amount: draft.amount! });
    setSaved(draft);
    toast.show({ message: `Purchase order ${order.id} saved`, tone: 'success' });
  };
  const remove = async () => {
    const ok = await messages.confirm({
      title: 'Delete purchase order?',
      message: `Purchase order ${order.id} will be deleted.`,
      tone: 'warning',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) {
      onDelete(order.id);
      toast.show({ message: `Purchase order ${order.id} deleted` });
    }
  };

  return (
    <Page
      header={
        <PageHeader
          breadcrumbs={
            <Breadcrumbs
              items={[
                { key: 'list', label: 'Purchase orders', onPress: leave },
                { key: 'order', label: order.id },
              ]}
            />
          }
          title={`Purchase order ${order.id}`}
          subtitle={order.supplier}
          status={<Tag tone={statusTone[order.status]}>{statusLabel(order.status)}</Tag>}
          actions={
            <Button variant="text" icon={deleteIcon} onClick={remove}>
              Delete
            </Button>
          }
        >
          <div className="example-facts">
            <div>
              <Text size="xs" tone="secondary" as="div">
                Net amount
              </Text>
              <Text as="div" size="l" weight="semibold" numeric>
                {format.decimal(order.amount, { scale: 2, currency: order.currency })}
              </Text>
            </div>
            <div>
              <Text size="xs" tone="secondary" as="div">
                Delivery date
              </Text>
              <Text as="div">{format.date(order.date)}</Text>
            </div>
            <div>
              <Text size="xs" tone="secondary" as="div">
                City
              </Text>
              <Text as="div">{order.city}</Text>
            </div>
          </div>
        </PageHeader>
      }
      footer={
        <>
          {checked && <MessagesButton messages={problems} />}
          <span className="example-spacer" />
          <Button variant="primary" onClick={save}>
            Save
          </Button>
          <Button onClick={leave}>Cancel</Button>
        </>
      }
    >
      <div className="example-stack">
        {order.status === 'blocked' && (
          <Banner tone="warning" title="Blocked.">
            The supplier of this order is blocked for new orders.
          </Banner>
        )}
        <Form columns={2} groupAppearance="card" onSubmit={(e) => e.preventDefault()}>
          <FormGroup title="Supplier">
            <FormField label="Supplier" required inputId="order-supplier">
              <LookupField
                nullable
                fetchItems={searchSuppliers}
                value={draft.supplierId}
                {...(supplier ? { description: supplier.label } : {})}
                onChange={(v) => set('supplierId', v)}
                valueState={state('supplier')}
              />
            </FormField>
            <FormField label="Contact person">
              <TextField value={draft.contact} onChange={(v) => set('contact', v)} />
            </FormField>
            <FormField label="Country">
              <Select
                nullable
                items={countries}
                value={draft.country}
                onChange={(v) => set('country', v)}
              />
            </FormField>
          </FormGroup>
          <FormGroup title="Terms">
            <FormField label="Delivery date" required inputId="order-date">
              <DatePicker
                nullable
                value={draft.date}
                onChange={(v) => set('date', v)}
                valueState={state('date')}
              />
            </FormField>
            <FormField label="Net amount" required inputId="order-amount">
              <AmountField
                nullable
                currency={order.currency}
                value={draft.amount}
                onChange={(v) => set('amount', v)}
                valueState={state('amount')}
              />
            </FormField>
            <FormField label="Shipping">
              <RadioGroup
                orientation="horizontal"
                value={draft.shipping}
                onChange={(v) => set('shipping', v)}
                options={[
                  { value: 'standard', label: 'Standard' },
                  { value: 'express', label: 'Express' },
                ]}
              />
            </FormField>
          </FormGroup>
          <FormGroup title="Notes" span={2}>
            <FormField label="Note">
              <TextArea nullable autoGrow value={draft.note} onChange={(v) => set('note', v)} />
            </FormField>
          </FormGroup>
        </Form>
      </div>
    </Page>
  );
}

/** The purchasing application of the examples: list and detail of orders. */
export function OrdersApp() {
  const [orders, setOrders] = useState(() => makeOrders(240));
  const [openId, setOpenId] = useState<string | null>(null);
  const open = orders.find((o) => o.id === openId);
  const remove = (ids: readonly string[]) =>
    setOrders((list) => list.filter((o) => !ids.includes(o.id)));
  if (open) {
    return (
      <OrderDetail
        key={open.id}
        order={open}
        onBack={() => setOpenId(null)}
        onSave={(order) => {
          setOrders((list) => list.map((o) => (o.id === order.id ? order : o)));
          setOpenId(null);
        }}
        onDelete={(id) => {
          remove([id]);
          setOpenId(null);
        }}
      />
    );
  }
  return <OrderList orders={orders} onOpen={(o) => setOpenId(o.id)} onDelete={remove} />;
}
