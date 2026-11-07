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
import { type Notification, NotificationPanel } from './notification-panel/NotificationPanel';
import { SettingsDialog } from './shell/SettingsDialog';
import { ShellHeader, ShellLayout } from './shell/Shell';
import { ContentTile, MetricTile, Tile } from './tile/Tile';
import { TileGroup, TileGroups } from './tile-group/TileGroup';

const now = Date.UTC(2026, 10, 8, 10, 0, 0);
const notifications: Notification[] = [
  {
    id: '1',
    title: 'Approve order',
    timestamp: '2026-11-08T09:48:00.000000Z',
    priority: 'high',
    read: false,
    actions: [{ key: 'approve', label: 'Approve' }],
  },
  {
    id: '2',
    title: 'Delivery arrived',
    timestamp: '2026-11-07T12:00:00.000000Z',
    priority: 'medium',
    read: false,
  },
  {
    id: '3',
    title: 'Report ready',
    timestamp: '2026-11-01T08:00:00.000000Z',
    priority: 'low',
    read: true,
  },
];

function ShellDemo() {
  const [view, setView] = useState<'home' | 'app'>('home');
  return (
    <div style={{ height: 400 }}>
      <ShellLayout
        view={view}
        header={<ShellHeader title="Suite" onHome={() => setView('home')} />}
        home={<Tile title="Orders" onPress={() => setView('app')} />}
        app={<input aria-label="Order note" />}
      />
    </div>
  );
}

describe('Tiles', () => {
  it('are links, buttons or plain boxes and show their states', () => {
    render(
      <>
        <Tile title="Orders" subtitle="Manage" href="#orders" badge={3} />
        <Tile title="Invoices" onPress={() => undefined} />
        <Tile title="Archive" state="disabled" onPress={() => undefined} />
        <Tile title="Shipments" state="loading" href="#s" />
        <Tile title="Contracts" state="failed" href="#c" />
        <ContentTile title="Recent">
          <span>content</span>
        </ContentTile>
      </>,
    );
    expect(screen.getByRole('link', { name: /Orders/ }).getAttribute('href')).toBe('#orders');
    expect(screen.getByRole('button', { name: 'Invoices' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Archive' }).getAttribute('aria-disabled')).toBe(
      'true',
    );
    expect(screen.getByRole('link', { name: 'Shipments, Loading' }).getAttribute('aria-busy')).toBe(
      'true',
    );
    expect(screen.getByRole('link', { name: /Contracts.*Could not be loaded/ })).toBeTruthy();
    expect(screen.getByText('content')).toBeTruthy();
  });

  it('do not open while disabled', async () => {
    const onPress = vi.fn();
    render(<Tile title="Archive" state="disabled" onPress={onPress} />);
    await userEvent.click(screen.getByRole('button'), { force: true });
    expect(onPress).not.toHaveBeenCalled();
  });

  it.each([
    ['en', '1250480.75', 'auto', '1.3', 'M EUR'],
    ['de', '1250480.75', 'auto', '1,3', 'Mio. EUR'],
    ['en', '17', 'auto', '17', ''],
    ['de', '48210.5', 'thousand', '48,2', 'Tsd. EUR'],
    ['en', '-9800000000000.00', 'auto', '-9,800.0', 'B EUR'],
    ['en', '99999999999999999.99', 'none', '99,999,999,999,999,999.99', 'EUR'],
  ])('shows figures exactly scaled in %s: %s', (locale, value, scale, shown, unit) => {
    render(
      <TruiProvider locale={locale}>
        <MetricTile
          title="Volume"
          value={value}
          scale={scale as 'auto'}
          {...(value === '17' ? {} : { unit: 'EUR' })}
        />
      </TruiProvider>,
    );
    expect(document.querySelector('.trui-metric-tile__value')?.textContent).toBe(shown);
    expect(document.querySelector('.trui-metric-tile__unit')?.textContent ?? '').toBe(unit);
  });

  it('describes trend and rating for assistive technology', () => {
    render(
      <MetricTile
        title="Overdue"
        value="17"
        trend="down"
        tone="critical"
        onPress={() => undefined}
      />,
    );
    expect(screen.getByRole('button').textContent).toContain('falling, critical');
  });
});

describe('Tile groups', () => {
  it('move between tiles with the arrow keys', async () => {
    render(
      <div style={{ width: 600 }}>
        <TileGroup title="Purchasing">
          {['A', 'B', 'C', 'D', 'E'].map((t) => (
            <Tile key={t} title={t} href={`#${t}`} />
          ))}
        </TileGroup>
      </div>,
    );
    const a = screen.getByRole('link', { name: 'A' });
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement?.textContent).toBe('B');
    await userEvent.keyboard('{End}');
    expect(document.activeElement?.textContent).toBe('E');
    await userEvent.keyboard('{ArrowUp}');
    expect(['A', 'B']).toContain(document.activeElement?.textContent);
    expect(screen.getByRole('region', { name: 'Purchasing' })).toBeTruthy();
  });

  it('jump to a group from the bar', async () => {
    render(
      <div style={{ height: 300, overflow: 'auto' }}>
        <TileGroups
          groups={['One', 'Two', 'Three'].map((title) => ({
            id: title.toLowerCase(),
            title,
            tiles: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((n) => (
              <Tile key={n} title={`${title} ${n}`} href="#x" />
            )),
          }))}
        />
      </div>,
    );
    const bar = screen.getByRole('navigation', { name: 'Groups' });
    await userEvent.click(within(bar).getByRole('link', { name: 'Three' }));
    expect(document.activeElement?.textContent).toBe('Three');
    expect(within(bar).getByRole('link', { name: 'Three' }).getAttribute('aria-current')).toBe(
      'location',
    );
  });
});

describe('NotificationPanel', () => {
  it('groups by date and priority, marks read and runs actions', async () => {
    const onAction = vi.fn();
    const onMarkRead = vi.fn();
    render(
      <TruiProvider timeZone="Europe/Berlin">
        <NotificationPanel
          notifications={notifications}
          now={now}
          onAction={onAction}
          onMarkRead={onMarkRead}
        />
      </TruiProvider>,
    );
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'Today',
      'Yesterday',
      'Earlier',
    ]);
    expect(screen.getByText('12 minutes ago')).toBeTruthy();
    expect(within(screen.getByRole('region', { name: 'Today' })).getByText('unread')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onAction).toHaveBeenCalledWith('approve', notifications[0]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Mark as read' })[0]!);
    expect(onMarkRead).toHaveBeenCalledWith(notifications[0]);
    await userEvent.click(screen.getByRole('button', { name: 'By priority' }));
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'High priority',
      'Medium priority',
      'Low priority',
    ]);
  });
});

describe('Shell', () => {
  it('shows the unread count and opens the notifications', async () => {
    render(<ShellHeader title="Suite" notifications={notifications} />);
    const bell = screen.getByRole('button', { name: 'Notifications, 2 unread' });
    await userEvent.click(bell);
    expect(await screen.findByRole('dialog', { name: 'Notifications' })).toBeTruthy();
  });

  it('searches with Enter and switches areas', async () => {
    const onSearch = vi.fn();
    const onAreaChange = vi.fn();
    render(
      <ShellHeader
        title="Suite"
        search={{ onSearch }}
        areas={[
          { key: 'a', label: 'Acme' },
          { key: 'b', label: 'Beta' },
        ]}
        onAreaChange={onAreaChange}
        user={{ name: 'Anna Schmidt' }}
        userMenu={[{ key: 'signout', label: 'Sign out' }]}
      />,
    );
    await userEvent.type(screen.getByRole('combobox', { name: 'Search' }), 'acme{Enter}');
    expect(onSearch).toHaveBeenCalledWith('acme');
    await userEvent.click(screen.getByRole('button', { name: 'Switch area' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Beta' }));
    expect(onAreaChange).toHaveBeenCalledWith('b');
    expect(screen.getByRole('button', { name: 'User menu of Anna Schmidt' })).toBeTruthy();
  });

  it('switches between home page and application and keeps the application', async () => {
    render(<ShellDemo />);
    expect(screen.getByRole('main')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Skip to content' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Orders' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Order note' }), 'urgent');
    await userEvent.click(screen.getByRole('button', { name: 'Home' }));
    expect(screen.queryByRole('textbox', { name: 'Order note' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Orders' }));
    expect(screen.getByRole<HTMLInputElement>('textbox', { name: 'Order note' }).value).toBe(
      'urgent',
    );
  });

  it('switches sections of the settings dialog', async () => {
    render(
      <SettingsDialog
        open
        onClose={() => undefined}
        sections={[
          { key: 'a', label: 'Appearance', content: <p>Theme options</p> },
          { key: 'b', label: 'Notifications', content: <p>Email options</p> },
        ]}
      />,
    );
    const dialog = await screen.findByRole('dialog', { name: 'Settings' });
    expect(within(dialog).getByText('Theme options')).toBeTruthy();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Notifications' }));
    expect(within(dialog).getByRole('region', { name: 'Notifications' }).textContent).toContain(
      'Email options',
    );
  });
});
