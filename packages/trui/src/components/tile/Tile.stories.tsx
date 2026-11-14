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
import { cartIcon } from '../../icons/set/cart';
import { chartBarIcon } from '../../icons/set/chart-bar';
import { documentIcon } from '../../icons/set/document';
import { invoiceIcon } from '../../icons/set/invoice';
import { truckIcon } from '../../icons/set/truck';
import { TileGroup } from '../tile-group/TileGroup';
import { ContentTile, MetricTile, Tile } from './Tile';

/**
 * Tiles of a home page. `Tile` opens an application and shows a title,
 * subtitle, icon, footer and a count; `MetricTile` shows a key figure as
 * exact decimal with unit, scaling, trend, a trend text, a line of earlier
 * values and rating; `ContentTile` holds
 * free content. Tiles take one or two cells and can be loading, failed or
 * disabled.
 *
 * **Keyboard:** Tab reaches each tile, Enter opens it; inside a group, arrow
 * keys move to the neighboring tile.
 *
 * **Tokens:** `--trui-tile-size`, `--trui-color-surface`, `--trui-shadow-s`,
 * `--trui-shadow-m`, the status colors for ratings.
 */
const meta = {
  title: 'Home/Tile',
  component: Tile,
  args: { title: 'Purchase orders' },
} satisfies Meta<typeof Tile>;
export default meta;

export const Kinds: StoryObj = {
  render: () => (
    <TileGroup title="Purchasing">
      <Tile
        title="Purchase orders"
        subtitle="Create and manage"
        icon={cartIcon}
        badge={4}
        footer="4 to approve"
        href="#orders"
      />
      <Tile
        title="Supplier invoices"
        subtitle="Check and post"
        icon={invoiceIcon}
        onPress={() => undefined}
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
        onPress={() => undefined}
      />
      <MetricTile
        title="Overdue deliveries"
        value="17"
        trend="down"
        trendLabel="3 fewer than last week"
        tone="critical"
        onPress={() => undefined}
      />
      <Tile
        title="Spend analysis"
        subtitle="By supplier and category"
        icon={chartBarIcon}
        size="2x1"
        href="#spend"
      />
      <Tile title="Shipments" icon={truckIcon} state="loading" href="#shipments" />
      <Tile title="Contracts" icon={documentIcon} state="failed" href="#contracts" />
      <Tile
        title="Archive"
        subtitle="Not available"
        icon={documentIcon}
        state="disabled"
        onPress={() => undefined}
      />
      <ContentTile title="Recent orders" size="2x1">
        <ol style={{ margin: 0, paddingInlineStart: 18 }}>
          <li>4500012345 · Acme Corp</li>
          <li>4500012346 · Brightline Supplies</li>
          <li>4500012347 · Calder Logistics</li>
        </ol>
      </ContentTile>
    </TileGroup>
  ),
};
