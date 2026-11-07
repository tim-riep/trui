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
import { copyIcon } from '../../icons/set/copy';
import { deleteIcon } from '../../icons/set/delete';
import { editIcon } from '../../icons/set/edit';
import { exportIcon } from '../../icons/set/export';
import { moreVerticalIcon } from '../../icons/set/more-vertical';
import { printIcon } from '../../icons/set/print';
import { Text } from '../text/Text';
import type { MenuItem } from './Menu';
import { MenuButton } from './MenuButton';

/**
 * A list of actions that opens from a button, with icons, groups and
 * submenus. `MenuButton` combines the button and its menu; `Menu` opens from
 * any element.
 *
 * **Keyboard:** Enter, Space or Arrow Down open the menu; arrows move, typing
 * jumps, Enter runs an entry, the forward arrow opens a submenu, the back
 * arrow and Escape close it.
 *
 * **Tokens:** `--trui-color-surface-raised`, `--trui-color-surface-hover`, `--trui-row-height`.
 */
const meta = { title: 'Overlays/Menu', component: MenuButton } satisfies Meta<typeof MenuButton>;
export default meta;

const items: MenuItem[] = [
  { key: 'edit', label: 'Edit', icon: editIcon },
  { key: 'copy', label: 'Copy', icon: copyIcon },
  {
    key: 'export',
    label: 'Export',
    icon: exportIcon,
    items: [
      { key: 'csv', label: 'As CSV' },
      { key: 'xlsx', label: 'As spreadsheet' },
      { key: 'pdf', label: 'As PDF', disabled: true },
    ],
  },
  { key: 'print', label: 'Print', icon: printIcon },
  { key: 'delete', label: 'Delete', icon: deleteIcon, danger: true, separatorBefore: true },
];

function Demo() {
  const [last, setLast] = useState('none');
  return (
    <div className="catalog-row">
      <MenuButton items={items} onAction={setLast}>
        Actions
      </MenuButton>
      <MenuButton
        variant="text"
        icon={moreVerticalIcon}
        aria-label="More actions"
        items={items}
        onAction={setLast}
      />
      <Text tone="secondary">Last action: {last}</Text>
    </div>
  );
}

export const Default: StoryObj = { render: () => <Demo /> };
