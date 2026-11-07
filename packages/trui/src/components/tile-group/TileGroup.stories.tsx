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
import { invoiceIcon } from '../../icons/set/invoice';
import { truckIcon } from '../../icons/set/truck';
import { warehouseIcon } from '../../icons/set/warehouse';
import { MetricTile, Tile } from '../tile/Tile';
import { TileGroups } from './TileGroup';

/**
 * Several groups of tiles with a bar to jump to a group; the bar marks the
 * group in view. Groups are given as data, so their order and content can
 * come from configuration later on.
 *
 * **Keyboard:** the jump bar is a list of links; within a group, arrow keys
 * move between tiles.
 *
 * **Tokens:** `--trui-tile-size`, `--trui-color-accent-subtle` for the current group.
 */
const meta = { title: 'Home/TileGroups', component: TileGroups } satisfies Meta<typeof TileGroups>;
export default meta;

const group = (prefix: string, icon: typeof cartIcon) => (
  <>
    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
      <Tile
        key={i}
        title={`${prefix} ${i}`}
        subtitle="Application"
        icon={icon}
        href={`#${prefix}-${i}`}
      />
    ))}
    <MetricTile
      title={`${prefix} volume`}
      value="48210.5"
      unit="EUR"
      trend="flat"
      href={`#${prefix}-volume`}
    />
  </>
);

export const Default: StoryObj = {
  render: () => (
    <div style={{ height: 520, overflow: 'auto' }}>
      <TileGroups
        groups={[
          { id: 'purchasing', title: 'Purchasing', tiles: group('Purchasing', cartIcon) },
          { id: 'finance', title: 'Finance', tiles: group('Finance', invoiceIcon) },
          { id: 'warehouse', title: 'Warehouse', tiles: group('Warehouse', warehouseIcon) },
          { id: 'shipping', title: 'Shipping', tiles: group('Shipping', truckIcon) },
        ]}
      />
    </div>
  ),
};
