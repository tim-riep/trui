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
import { makeOrders } from '../../../../../catalog/data/sample';
import { documentIcon } from '../../icons/set/document';
import { Avatar } from '../avatar/Avatar';
import { List, type ListEntry } from './List';

/**
 * A list of entries with title, description, icon or avatar, information and
 * status. Entries can lead to a detail (`onItemPress`, `navigable`) or be
 * selected; `total` and `onLoadMore` load more at the end.
 *
 * **Keyboard:** arrows move between entries, Home and End jump, typing jumps
 * to an entry; Enter chooses, Space selects.
 *
 * **Tokens:** `--trui-row-height`, `--trui-color-selected`, `--trui-color-border-subtle`.
 */
const meta = { title: 'Data/List', component: List } satisfies Meta<typeof List>;
export default meta;

const tones = {
  open: 'neutral',
  released: 'accent',
  delivered: 'success',
  blocked: 'error',
} as const;
const all: ListEntry[] = makeOrders(40).map((o) => ({
  key: o.id,
  title: o.supplier,
  textValue: o.supplier,
  description: `Order ${o.id} · ${o.city}`,
  icon: documentIcon,
  info: `${o.amount} EUR`,
  status: { label: o.status, tone: tones[o.status] },
}));

function Navigation() {
  const [count, setCount] = useState(10);
  const [chosen, setChosen] = useState('');
  return (
    <div className="catalog-stack" style={{ maxWidth: 560 }}>
      <List
        aria-label="Orders"
        items={all.slice(0, count)}
        navigable
        onItemPress={(item) => setChosen(item.key)}
        total={all.length}
        onLoadMore={() => setCount(count + 10)}
      />
      <span>Chosen: {chosen || 'none'}</span>
    </div>
  );
}

export const WithNavigation: StoryObj = { render: () => <Navigation /> };

export const MultipleSelection: StoryObj = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <List
        aria-label="Contacts"
        selectionMode="multiple"
        defaultSelectedKeys={new Set(['b'])}
        items={[
          {
            key: 'a',
            title: 'Anna Schmidt',
            description: 'Purchasing',
            avatar: <Avatar name="Anna Schmidt" decorative />,
          },
          {
            key: 'b',
            title: 'Ben Okafor',
            description: 'Logistics',
            avatar: <Avatar name="Ben Okafor" decorative />,
          },
          {
            key: 'c',
            title: 'Chiara Rossi',
            description: 'Finance',
            avatar: <Avatar name="Chiara Rossi" decorative />,
            disabled: true,
          },
        ]}
      />
    </div>
  ),
};
