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
import { addIcon } from '../../icons/set/add';
import { editIcon } from '../../icons/set/edit';
import { Avatar } from '../avatar/Avatar';
import { Button } from '../button/Button';
import { Card } from '../card/Card';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { Panel } from './Panel';

/**
 * `Panel` is a titled section that can be collapsed; `Card` a box about one
 * thing, which can be a link or button as a whole.
 *
 * **Keyboard:** the title of a panel is a button (Enter or Space toggles it);
 * a clickable card is reached through its title.
 *
 * **Tokens:** `--trui-color-surface`, `--trui-radius-l`, `--trui-shadow-s`, `--trui-shadow-m`.
 */
const meta = { title: 'Layout/Panel and Card', component: Panel } satisfies Meta<typeof Panel>;
export default meta;

export const Panels: StoryObj = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 640 }}>
      <Panel
        title="Delivery address"
        headerContent={<Button variant="text" icon={editIcon} aria-label="Edit address" />}
      >
        <Text as="p">Acme Corp, Harbor Street 12, 20457 Hamburg</Text>
      </Panel>
      <Panel title="Notes" defaultExpanded={false}>
        <Text as="p">Deliver to gate 4.</Text>
      </Panel>
      <Panel title="Terms" collapsible={false}>
        <Text as="p">Payable within 30 days.</Text>
      </Panel>
    </div>
  ),
};

export const Cards: StoryObj = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 16,
      }}
    >
      <Card
        title="Acme Corp"
        subtitle="Supplier S1000 · Hamburg"
        avatar={<Avatar name="Acme Corp" shape="square" decorative />}
        href="#supplier"
        footer={<Tag tone="success">Active</Tag>}
      >
        <Text tone="secondary">12 open orders</Text>
      </Card>
      <Card
        title="Brightline Supplies"
        subtitle="Supplier S1001 · Lyon"
        onPress={() => undefined}
        footer={<Tag tone="warning">Blocked</Tag>}
      >
        <Text tone="secondary">Blocked for new orders</Text>
      </Card>
      <Card
        title="New supplier"
        actions={<Button variant="text" icon={addIcon} aria-label="Add supplier" />}
      >
        <Text tone="secondary">A card without action on itself.</Text>
      </Card>
    </div>
  ),
};
