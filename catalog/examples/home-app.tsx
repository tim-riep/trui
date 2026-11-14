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

// An example of a home page in the shell with several tile groups, key
// figure tiles, notifications and a user menu, with static data. A click on
// the purchase orders tile opens the example business page in the same shell.

import {
  Button,
  type Command,
  CommandPalette,
  ContentTile,
  MetricTile,
  type NavigationItem,
  Select,
  SettingsDialog,
  ShellHeader,
  ShellLayout,
  SideNavigation,
  Switch,
  Tile,
  TileGroups,
} from '@tim-riep/trui';
import { bankIcon } from '@tim-riep/trui/icons/bank';
import { boxIcon } from '@tim-riep/trui/icons/box';
import { cartIcon } from '@tim-riep/trui/icons/cart';
import { chartBarIcon } from '@tim-riep/trui/icons/chart-bar';
import { contractIcon } from '@tim-riep/trui/icons/contract';
import { invoiceIcon } from '@tim-riep/trui/icons/invoice';
import { languageIcon } from '@tim-riep/trui/icons/language';
import { paymentIcon } from '@tim-riep/trui/icons/payment';
import { peopleIcon } from '@tim-riep/trui/icons/people';
import { purchaseOrderIcon } from '@tim-riep/trui/icons/purchase-order';
import { settingsIcon } from '@tim-riep/trui/icons/settings';
import { signOutIcon } from '@tim-riep/trui/icons/sign-out';
import { supplierIcon } from '@tim-riep/trui/icons/supplier';
import { truckIcon } from '@tim-riep/trui/icons/truck';
import { warehouseIcon } from '@tim-riep/trui/icons/warehouse';
import { useState } from 'react';
import { makeNotifications, suppliers } from '../data/sample';
import { OrdersApp } from './orders-app';

const commands: Command[] = [
  {
    key: 'orders',
    label: 'Purchase orders',
    description: 'Create and manage',
    icon: cartIcon,
    group: 'Applications',
    keywords: ['po', 'buy'],
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    description: 'Master data',
    icon: supplierIcon,
    group: 'Applications',
  },
  {
    key: 'invoices',
    label: 'Supplier invoices',
    description: 'Check and post',
    icon: invoiceIcon,
    group: 'Applications',
  },
  {
    key: 'payments',
    label: 'Payments',
    description: 'Payment runs',
    icon: paymentIcon,
    group: 'Applications',
  },
  {
    key: 'stock',
    label: 'Stock',
    icon: warehouseIcon,
    group: 'Applications',
    keywords: ['inventory'],
  },
  {
    key: 'create-order',
    label: 'Create purchase order',
    icon: purchaseOrderIcon,
    group: 'Actions',
    shortcut: 'Alt+N',
  },
  { key: 'settings', label: 'Settings', icon: settingsIcon, group: 'Actions' },
];

const navigation: NavigationItem[] = [
  { key: 'orders', label: 'Purchase orders', icon: purchaseOrderIcon },
  { key: 'suppliers', label: 'Suppliers', icon: supplierIcon },
  { key: 'contracts', label: 'Contracts', icon: contractIcon },
];

/** The home page of the examples in the shell. */
export function HomeApp({ now = Date.now() }: { now?: number }) {
  const [view, setView] = useState<'home' | 'app'>('home');
  const [notifications, setNotifications] = useState(() => makeNotifications(now));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const openOrders = () => setView('app');

  return (
    <>
      <ShellLayout
        view={view}
        header={
          <ShellHeader
            title="Business Suite"
            {...(view === 'app' ? { onBack: () => setView('home') } : {})}
            onHome={() => setView('home')}
            search={{
              placeholder: 'Search suppliers and orders (Ctrl+K for commands)',
              onSearch: () => openOrders(),
              loadSuggestions: async (q) =>
                suppliers
                  .filter((s) => s.label.toLowerCase().includes(q.toLowerCase()))
                  .slice(0, 6),
              onSuggestionSelect: () => openOrders(),
            }}
            notifications={notifications}
            notificationHandlers={{
              now,
              onAction: () => openOrders(),
              onMarkRead: (n) =>
                setNotifications((list) =>
                  list.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                ),
              onMarkAllRead: () =>
                setNotifications((list) => list.map((x) => ({ ...x, read: true }))),
              onDismiss: (n) => setNotifications((list) => list.filter((x) => x.id !== n.id)),
            }}
            areas={[
              { key: 'acme', label: 'Acme Corp, Hamburg' },
              { key: 'acme-fr', label: 'Acme France, Lyon' },
            ]}
            user={{ name: 'Anna Schmidt' }}
            userMenu={[
              { key: 'settings', label: 'Settings', icon: settingsIcon },
              { key: 'language', label: 'Language', icon: languageIcon },
              { key: 'signout', label: 'Sign out', icon: signOutIcon, separatorBefore: true },
            ]}
            onUserMenuAction={(key) => key === 'settings' && setSettingsOpen(true)}
          />
        }
        navigation={
          <SideNavigation
            items={navigation}
            selectedKey="orders"
            collapsed={navCollapsed}
            onCollapsedChange={setNavCollapsed}
          />
        }
        home={
          <TileGroups
            groups={[
              {
                id: 'purchasing',
                title: 'Purchasing',
                tiles: (
                  <>
                    <Tile
                      title="Purchase orders"
                      subtitle="Create and manage"
                      icon={cartIcon}
                      badge={4}
                      footer="4 to approve"
                      onPress={openOrders}
                    />
                    <Tile
                      title="Suppliers"
                      subtitle="Master data"
                      icon={supplierIcon}
                      onPress={openOrders}
                    />
                    <MetricTile
                      title="Open order value"
                      subtitle="This month"
                      value="1250480.75"
                      unit="EUR"
                      trend="up"
                      trendLabel="+12 % on last month"
                      history={['910000', '980000', '1040000', '1010000', '1120000', '1250480.75']}
                      tone="good"
                      footer="Updated 5 minutes ago"
                      onPress={openOrders}
                    />
                    <MetricTile
                      title="Overdue deliveries"
                      value="17"
                      trend="down"
                      trendLabel="3 fewer than last week"
                      tone="critical"
                      onPress={openOrders}
                    />
                    <Tile
                      title="Contracts"
                      icon={contractIcon}
                      state="loading"
                      onPress={openOrders}
                    />
                  </>
                ),
              },
              {
                id: 'finance',
                title: 'Finance',
                tiles: (
                  <>
                    <Tile
                      title="Supplier invoices"
                      subtitle="Check and post"
                      icon={invoiceIcon}
                      badge={12}
                      onPress={openOrders}
                    />
                    <Tile
                      title="Payments"
                      subtitle="Payment runs"
                      icon={paymentIcon}
                      onPress={openOrders}
                    />
                    <MetricTile
                      title="Cash position"
                      value="8410200.00"
                      unit="EUR"
                      trend="flat"
                      history={['8200000', '8650000', '8100000', '8500000', '8380000', '8410200']}
                      onPress={openOrders}
                    />
                    <Tile
                      title="Bank statements"
                      icon={bankIcon}
                      state="failed"
                      onPress={openOrders}
                    />
                    <Tile
                      title="Spend analysis"
                      subtitle="By supplier and category"
                      icon={chartBarIcon}
                      size="2x1"
                      onPress={openOrders}
                    />
                  </>
                ),
              },
              {
                id: 'logistics',
                title: 'Warehouse and shipping',
                tiles: (
                  <>
                    <Tile title="Goods receipt" icon={boxIcon} onPress={openOrders} />
                    <Tile title="Stock" icon={warehouseIcon} onPress={openOrders} />
                    <Tile title="Shipments" icon={truckIcon} badge={3} onPress={openOrders} />
                    <MetricTile
                      title="Stock value"
                      value="2390000"
                      unit="EUR"
                      tone="neutral"
                      trend="up"
                      onPress={openOrders}
                    />
                    <ContentTile title="Arrivals today" size="2x1">
                      <ol className="example-tile-list">
                        <li>08:30 · Acme Corp · 12 pallets</li>
                        <li>11:00 · Calder Logistics · 4 pallets</li>
                        <li>14:15 · Evergreen Paper · 20 pallets</li>
                      </ol>
                    </ContentTile>
                  </>
                ),
              },
              {
                id: 'people',
                title: 'Organization',
                tiles: (
                  <>
                    <Tile
                      title="Employees"
                      icon={peopleIcon}
                      state="disabled"
                      subtitle="No access"
                    />
                  </>
                ),
              },
            ]}
          />
        }
        app={<OrdersApp />}
      />
      <CommandPalette
        commands={commands}
        onCommand={(key) => (key === 'settings' ? setSettingsOpen(true) : openOrders())}
      />
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        footer={
          <>
            <Button variant="primary" onClick={() => setSettingsOpen(false)}>
              Save
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>Cancel</Button>
          </>
        }
        sections={[
          {
            key: 'appearance',
            label: 'Appearance',
            content: (
              <div className="example-stack">
                <Switch>Dark theme</Switch>
                <Switch>Comfortable density</Switch>
              </div>
            ),
          },
          {
            key: 'language',
            label: 'Language and region',
            content: (
              <Select
                aria-label="Language"
                defaultValue="en"
                items={[
                  { value: 'en', label: 'English' },
                  { value: 'de', label: 'German' },
                ]}
              />
            ),
          },
        ]}
      />
    </>
  );
}
