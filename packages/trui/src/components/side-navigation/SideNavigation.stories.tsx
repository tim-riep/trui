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
import { calendarIcon } from '../../icons/set/calendar';
import { documentIcon } from '../../icons/set/document';
import { folderIcon } from '../../icons/set/folder';
import { homeIcon } from '../../icons/set/home';
import { menuIcon } from '../../icons/set/menu';
import { personIcon } from '../../icons/set/person';
import { settingsIcon } from '../../icons/set/settings';
import { AppHeader } from '../app-header/AppHeader';
import { Button } from '../button/Button';
import { type NavigationItem, SideNavigation } from './SideNavigation';

/**
 * Navigation between the pages of an application in up to two levels.
 * Collapsed, it shows only icons; groups then open as a menu. `AppHeader` is
 * the header of an application that runs without the shell.
 *
 * **Keyboard:** Tab moves through the entries; Enter follows an entry or
 * toggles a group.
 *
 * **Tokens:** `--trui-color-accent-subtle` for the current page, `--trui-row-height`.
 */
const meta = { title: 'Layout/SideNavigation', component: SideNavigation } satisfies Meta<
  typeof SideNavigation
>;
export default meta;

const items: NavigationItem[] = [
  { key: 'home', label: 'Home', icon: homeIcon },
  {
    key: 'purchasing',
    label: 'Purchasing',
    icon: documentIcon,
    items: [
      { key: 'orders', label: 'Purchase orders', badge: 3 },
      { key: 'requisitions', label: 'Requisitions' },
    ],
  },
  { key: 'suppliers', label: 'Suppliers', icon: personIcon },
  { key: 'documents', label: 'Documents', icon: folderIcon },
  { key: 'calendar', label: 'Calendar', icon: calendarIcon, disabled: true },
];

function Demo() {
  const [selected, setSelected] = useState('orders');
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div
      style={{
        height: 460,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid var(--trui-color-border)',
      }}
    >
      <AppHeader
        title="Purchasing"
        start={
          <Button
            variant="text"
            icon={menuIcon}
            aria-label="Toggle navigation"
            onClick={() => setCollapsed(!collapsed)}
          />
        }
        user={{ name: 'Anna Schmidt' }}
        userMenu={[
          { key: 'settings', label: 'Settings', icon: settingsIcon },
          { key: 'signout', label: 'Sign out', separatorBefore: true },
        ]}
      />
      <div style={{ flex: 1, minHeight: 0 }}>
        <SideNavigation
          items={items}
          footerItems={[{ key: 'settings', label: 'Settings', icon: settingsIcon }]}
          selectedKey={selected}
          onSelect={(key) => setSelected(key)}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
        />
      </div>
    </div>
  );
}

export const Default: StoryObj = { render: () => <Demo /> };
