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
import { TruiProvider } from '@tim-riep/trui/core';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../styles.css';
import { AppHeader } from './app-header/AppHeader';
import { Breadcrumbs } from './breadcrumbs/Breadcrumbs';
import { Card } from './card/Card';
import { Page, PageHeader } from './page/Page';
import { Panel } from './panel/Panel';
import { SideNavigation } from './side-navigation/SideNavigation';
import { SplitLayout } from './split-layout/SplitLayout';
import { Tabs } from './tabs/Tabs';
import { Toolbar, type ToolbarItem } from './toolbar/Toolbar';

const tabs = [
  { key: 'a', label: 'Items', content: 'Items content' },
  { key: 'b', label: 'Delivery', content: 'Delivery content' },
  { key: 'c', label: 'History', disabled: true },
  { key: 'd', label: 'Invoices', count: 2, content: 'Invoices content' },
];

const toolbarItems: ToolbarItem[] = [
  { key: 'create', label: 'Create', overflow: 'never' },
  { key: 'edit', label: 'Edit' },
  { key: 'copy', label: 'Copy' },
  { key: 'delete', label: 'Delete' },
  { key: 'print', label: 'Print', overflow: 'always' },
];

function Split() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ width: 400, height: 300 }}>
      <SplitLayout
        listLabel="Orders"
        detailLabel="Order"
        showDetail={selected !== null}
        onBack={() => setSelected(null)}
        list={
          <button type="button" onClick={() => setSelected('4711')}>
            Order 4711
          </button>
        }
        detail={<p>Detail {selected}</p>}
      />
    </div>
  );
}

describe('Tabs', () => {
  it('selects with the arrow keys, skips disabled tabs and wraps', async () => {
    const onChange = vi.fn();
    render(<Tabs aria-label="Sections" items={tabs} onSelectionChange={onChange} />);
    expect(screen.getByRole('tabpanel', { name: 'Items' }).textContent).toBe('Items content');
    screen.getByRole('tab', { name: 'Items' }).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('d');
    expect(screen.getByRole('tab', { name: /Invoices/ }).getAttribute('aria-selected')).toBe(
      'true',
    );
    await userEvent.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('a');
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tabpanel').textContent).toBe('Invoices content');
  });

  it('waits for Enter with manual activation and mirrors keys in right-to-left layout', async () => {
    render(
      <TruiProvider locale="ar">
        <Tabs aria-label="Sections" items={tabs} activation="manual" />
      </TruiProvider>,
    );
    screen.getByRole('tab', { name: 'Items' }).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement?.textContent).toBe('Delivery');
    expect(screen.getByRole('tabpanel').textContent).toBe('Items content');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('tabpanel').textContent).toBe('Delivery content');
  });
});

describe('Panel and Card', () => {
  it('collapses a panel with its title button', async () => {
    render(<Panel title="Notes">Deliver to gate 4</Panel>);
    const toggle = screen.getByRole('button', { name: 'Notes' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(toggle);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('Deliver to gate 4').closest('[hidden]')).toBeTruthy();
    expect(screen.getByRole('region', { name: 'Notes' })).toBeTruthy();
  });

  it('makes a card a link through its title', () => {
    render(
      <Card title="Acme Corp" href="#acme">
        12 open orders
      </Card>,
    );
    expect(screen.getByRole('link', { name: 'Acme Corp' }).getAttribute('href')).toBe('#acme');
    expect(screen.getByRole('article', { name: 'Acme Corp' })).toBeTruthy();
  });
});

describe('Toolbar', () => {
  it('moves actions into the overflow menu when narrow and keeps their order', async () => {
    const onAction = vi.fn();
    render(
      <div style={{ width: 200 }}>
        <Toolbar aria-label="Actions" items={toolbarItems} onAction={onAction} />
      </div>,
    );
    const toolbar = screen.getByRole('toolbar', { name: 'Actions' });
    await vi.waitFor(() =>
      expect(within(toolbar).getByRole('button', { name: 'More' })).toBeTruthy(),
    );
    const visible = within(toolbar)
      .getAllByRole('button')
      .map((b) => b.textContent)
      .filter((label) => label !== '');
    await userEvent.click(within(toolbar).getByRole('button', { name: 'More' }));
    const menu = screen.getByRole('menu');
    const hidden = within(menu)
      .getAllByRole('menuitem')
      .map((m) => m.textContent);
    // Visible actions and those in the menu together keep the order of the items.
    expect([...visible.filter((label) => label !== 'More'), ...hidden]).toEqual([
      'Create',
      'Edit',
      'Copy',
      'Delete',
      'Print',
    ]);
    expect(hidden.length).toBeGreaterThan(1);
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Print' }));
    expect(onAction).toHaveBeenCalledWith('print');
  });

  it('shows all actions with room and moves focus with the arrow keys', async () => {
    render(
      <div style={{ width: 900 }}>
        <Toolbar aria-label="Actions" items={toolbarItems.slice(0, 4)} onAction={() => undefined} />
      </div>,
    );
    const toolbar = screen.getByRole('toolbar');
    await vi.waitFor(() => expect(within(toolbar).getAllByRole('button')).toHaveLength(4));
    within(toolbar).getByRole('button', { name: 'Create' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Edit');
    await userEvent.keyboard('{End}');
    expect(document.activeElement?.textContent).toBe('Delete');
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('Create');
  });
});

describe('Page and PageHeader', () => {
  it('collapses the facts when they scroll away and brings them back', async () => {
    render(
      <div style={{ height: 300 }}>
        <Page header={<PageHeader title="Order 4711">Net amount 100 EUR</PageHeader>}>
          <div style={{ height: 2000 }}>content</div>
        </Page>
      </div>,
    );
    const toggle = screen.getByRole('button', { name: 'Collapse header' });
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const scroller = document.querySelector<HTMLElement>('.trui-page__scroller')!;
    scroller.scrollTop = 400;
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Expand header' })).toBeTruthy(),
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Order 4711' }).getBoundingClientRect().top,
    ).toBeGreaterThanOrEqual(scroller.getBoundingClientRect().top);
    await userEvent.click(screen.getByRole('button', { name: 'Expand header' }));
    await vi.waitFor(() => expect(scroller.scrollTop).toBe(0));
  });

  it('keeps the facts visible when pinned', async () => {
    render(
      <div style={{ height: 300 }}>
        <Page header={<PageHeader title="Order 4711">Net amount 100 EUR</PageHeader>}>
          <div style={{ height: 2000 }}>content</div>
        </Page>
      </div>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Pin header' }));
    document.querySelector<HTMLElement>('.trui-page__scroller')!.scrollTop = 400;
    await new Promise((r) => setTimeout(r, 100));
    const facts = screen.getByText('Net amount 100 EUR').getBoundingClientRect();
    const scroller = document
      .querySelector<HTMLElement>('.trui-page__scroller')!
      .getBoundingClientRect();
    expect(facts.top).toBeGreaterThan(scroller.top);
    expect(screen.queryByRole('button', { name: /header/ })?.getAttribute('aria-pressed')).toBe(
      'true',
    );
  });

  it('marks the current step of the breadcrumbs', () => {
    render(
      <Breadcrumbs
        items={[
          { key: 'home', label: 'Home', href: '#home' },
          { key: 'order', label: 'Order 4711' },
        ]}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toBeTruthy();
    expect(within(nav).getByText('Order 4711').getAttribute('aria-current')).toBe('page');
  });
});

describe('SplitLayout', () => {
  it('shows one pane at a time when narrow, with a way back', async () => {
    render(<Split />);
    const list = document.querySelector<HTMLElement>('.trui-split__list')!;
    const detail = document.querySelector<HTMLElement>('.trui-split__detail')!;
    expect(list.checkVisibility()).toBe(true);
    expect(detail.checkVisibility()).toBe(false);
    await userEvent.click(screen.getByText('Order 4711'));
    expect(list.checkVisibility()).toBe(false);
    expect(screen.getByRole('region', { name: 'Order' }).textContent).toContain('Detail 4711');
    await userEvent.click(screen.getByRole('button', { name: 'Back to the list' }));
    expect(screen.getByRole('region', { name: 'Orders' }).checkVisibility()).toBe(true);
  });
});

describe('SideNavigation and AppHeader', () => {
  const items = [
    { key: 'home', label: 'Home', href: '#home' },
    {
      key: 'purchasing',
      label: 'Purchasing',
      items: [
        { key: 'orders', label: 'Orders' },
        { key: 'requests', label: 'Requests' },
      ],
    },
  ];

  it('marks the current page, opens groups and reports the choice', async () => {
    const onSelect = vi.fn();
    render(<SideNavigation items={items} selectedKey="orders" onSelect={onSelect} />);
    const nav = screen.getByRole('navigation', { name: 'Navigation' });
    expect(within(nav).getByRole('button', { name: 'Orders' }).getAttribute('aria-current')).toBe(
      'page',
    );
    const group = within(nav).getByRole('button', { name: 'Purchasing' });
    expect(group.getAttribute('aria-expanded')).toBe('true');
    await userEvent.click(group);
    expect(within(nav).queryByRole('button', { name: 'Orders' })).toBeNull();
    await userEvent.click(within(nav).getByRole('link', { name: 'Home' }));
    expect(onSelect).toHaveBeenCalledWith('home', items[0], expect.anything());
  });

  it('opens groups as a menu when collapsed', async () => {
    const onSelect = vi.fn();
    render(
      <SideNavigation
        items={items}
        collapsed
        onSelect={onSelect}
        onCollapsedChange={() => undefined}
      />,
    );
    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Purchasing' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Requests' }));
    expect(onSelect).toHaveBeenCalledWith(
      'requests',
      expect.objectContaining({ label: 'Requests' }),
      null,
    );
  });

  it('names the user menu button after the user', async () => {
    const onUserMenuAction = vi.fn();
    render(
      <AppHeader
        title="Purchasing"
        user={{ name: 'Anna Schmidt' }}
        userMenu={[{ key: 'signout', label: 'Sign out' }]}
        onUserMenuAction={onUserMenuAction}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Anna Schmidt' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onUserMenuAction).toHaveBeenCalledWith('signout');
  });
});
