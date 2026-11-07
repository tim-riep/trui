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
import { Breadcrumbs } from '../breadcrumbs/Breadcrumbs';
import { Button } from '../button/Button';
import { Panel } from '../panel/Panel';
import { Tag } from '../tag/Tag';
import { Text } from '../text/Text';
import { Toolbar } from '../toolbar/Toolbar';
import { Page, PageHeader } from './Page';

/**
 * A page with a header that keeps its title row at the top while the facts
 * below it scroll away. The toggle button brings them back; the pin keeps the
 * whole header visible. The footer stays at the bottom.
 *
 * **Keyboard:** the toggle and pin buttons are regular buttons; the page
 * content scrolls with the usual keys.
 *
 * **Tokens:** `--trui-color-surface`, `--trui-color-background`, `--trui-shadow-s`,
 * `--trui-font-size-xl`.
 */
const meta = { title: 'Layout/Page', component: Page } satisfies Meta<typeof Page>;
export default meta;

const facts = (
  <div className="catalog-row" style={{ gap: 32 }}>
    <div>
      <Text size="xs" tone="secondary" as="div">
        Supplier
      </Text>
      <Text as="div">Acme Corp</Text>
    </div>
    <div>
      <Text size="xs" tone="secondary" as="div">
        Net amount
      </Text>
      <Text as="div" size="l" weight="semibold" numeric>
        18,990.50 EUR
      </Text>
    </div>
    <div>
      <Text size="xs" tone="secondary" as="div">
        Delivery date
      </Text>
      <Text as="div">Nov 20, 2026</Text>
    </div>
  </div>
);

export const ObjectPage: StoryObj = {
  render: () => (
    <div style={{ height: 520, border: '1px solid var(--trui-color-border)' }}>
      <Page
        header={
          <PageHeader
            breadcrumbs={
              <Breadcrumbs
                items={[
                  { key: 'home', label: 'Home', href: '#home' },
                  { key: 'orders', label: 'Purchase orders', href: '#orders' },
                  { key: 'order', label: '4500012345' },
                ]}
              />
            }
            title="Purchase order 4500012345"
            subtitle="Created by Anna Schmidt on Nov 7, 2026"
            status={<Tag tone="success">Released</Tag>}
            actions={
              <Toolbar
                aria-label="Actions"
                onAction={() => undefined}
                items={[
                  { key: 'edit', label: 'Edit', variant: 'primary' },
                  { key: 'copy', label: 'Copy' },
                  { key: 'delete', label: 'Delete', overflow: 'always' },
                ]}
              />
            }
          >
            {facts}
          </PageHeader>
        }
        footer={
          <>
            <Button variant="primary">Save</Button>
            <Button>Cancel</Button>
          </>
        }
      >
        <div className="catalog-stack" style={{ maxWidth: 'none' }}>
          {['Items', 'Delivery', 'Invoices', 'Notes'].map((title) => (
            <Panel key={title} title={title}>
              <Text as="p">
                Content of the section {title.toLowerCase()}. Scroll the page to see the header
                collapse: the facts scroll away while the title row stays.
              </Text>
              <div style={{ height: 160 }} />
            </Panel>
          ))}
        </div>
      </Page>
    </div>
  ),
};
