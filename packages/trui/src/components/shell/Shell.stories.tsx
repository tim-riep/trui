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
import { makeNotifications, suppliers } from '../../../../../catalog/data/sample';
import { cartIcon } from '../../icons/set/cart';
import { languageIcon } from '../../icons/set/language';
import { settingsIcon } from '../../icons/set/settings';
import { signOutIcon } from '../../icons/set/sign-out';
import { Button } from '../button/Button';
import { Page, PageHeader } from '../page/Page';
import { Switch } from '../switch/Switch';
import { Text } from '../text/Text';
import { Tile } from '../tile/Tile';
import { TileGroups } from '../tile-group/TileGroup';
import { SettingsDialog } from './SettingsDialog';
import { ShellHeader, ShellLayout } from './Shell';

/**
 * The frame of an application: `ShellHeader` with search, notifications,
 * area switch and user menu, and `ShellLayout` that shows the home page or
 * the opened application without routing of its own. `SettingsDialog` is the
 * frame for settings whose sections the application provides.
 *
 * **Keyboard:** a link at the start skips to the content; the header controls
 * are buttons and a search field; the notifications open in a popover.
 *
 * **Tokens:** `--trui-color-surface`, `--trui-color-background`, `--trui-color-border`.
 */
const meta = { title: 'Home/Shell', component: ShellLayout } satisfies Meta<typeof ShellLayout>;
export default meta;

function Demo() {
  const [view, setView] = useState<'home' | 'app'>('home');
  const [notifications, setNotifications] = useState(() => makeNotifications(Date.now()));
  const [settings, setSettings] = useState(false);
  return (
    <div style={{ height: 560, border: '1px solid var(--trui-color-border)' }}>
      <ShellLayout
        view={view}
        header={
          <ShellHeader
            title="Business Suite"
            {...(view === 'app' ? { onBack: () => setView('home') } : {})}
            onHome={() => setView('home')}
            search={{
              onSearch: () => undefined,
              loadSuggestions: async (q) =>
                suppliers
                  .filter((s) => s.label.toLowerCase().includes(q.toLowerCase()))
                  .slice(0, 6),
            }}
            notifications={notifications}
            notificationHandlers={{
              onMarkRead: (n) =>
                setNotifications((list) =>
                  list.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                ),
              onMarkAllRead: () =>
                setNotifications((list) => list.map((x) => ({ ...x, read: true }))),
              onDismiss: (n) => setNotifications((list) => list.filter((x) => x.id !== n.id)),
            }}
            areas={[
              { key: 'acme', label: 'Acme Corp' },
              { key: 'acme-fr', label: 'Acme France' },
            ]}
            user={{ name: 'Anna Schmidt' }}
            userMenu={[
              { key: 'settings', label: 'Settings', icon: settingsIcon },
              { key: 'language', label: 'Language', icon: languageIcon },
              { key: 'signout', label: 'Sign out', icon: signOutIcon, separatorBefore: true },
            ]}
            onUserMenuAction={(key) => key === 'settings' && setSettings(true)}
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
                      icon={cartIcon}
                      badge={4}
                      onPress={() => setView('app')}
                    />
                    <Tile title="Requisitions" icon={cartIcon} onPress={() => setView('app')} />
                  </>
                ),
              },
            ]}
          />
        }
        app={
          <Page header={<PageHeader title="Purchase orders" />}>
            <Text>The opened application.</Text>
          </Page>
        }
      />
      <SettingsDialog
        open={settings}
        onClose={() => setSettings(false)}
        footer={
          <Button variant="primary" onClick={() => setSettings(false)}>
            Save
          </Button>
        }
        sections={[
          { key: 'appearance', label: 'Appearance', content: <Switch>Dark theme</Switch> },
          {
            key: 'notifications',
            label: 'Notifications',
            content: <Switch defaultChecked>Email for approvals</Switch>,
          },
        ]}
      />
    </div>
  );
}

export const HomeAndApplication: StoryObj = { render: () => <Demo /> };
