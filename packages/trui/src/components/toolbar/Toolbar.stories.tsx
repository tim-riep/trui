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
import { addIcon } from '../../icons/set/add';
import { deleteIcon } from '../../icons/set/delete';
import { editIcon } from '../../icons/set/edit';
import { exportIcon } from '../../icons/set/export';
import { filterIcon } from '../../icons/set/filter';
import { printIcon } from '../../icons/set/print';
import { refreshIcon } from '../../icons/set/refresh';
import { sortIcon } from '../../icons/set/sort';
import { Text } from '../text/Text';
import { Title } from '../title/Title';
import { Toolbar, type ToolbarItem } from './Toolbar';

/**
 * A row of actions. When the toolbar gets narrow, actions move from the end
 * into the overflow menu; `overflow: 'never'` keeps one visible,
 * `overflow: 'always'` shows one only in the menu.
 *
 * **Keyboard:** Tab reaches each action; Arrow Left and Right, Home and End
 * move between them.
 *
 * **Tokens:** `--trui-space-xs`, `--trui-control-height`.
 */
const meta = { title: 'Layout/Toolbar', component: Toolbar } satisfies Meta<typeof Toolbar>;
export default meta;

const items: ToolbarItem[] = [
  { key: 'create', label: 'Create', icon: addIcon, variant: 'primary', overflow: 'never' },
  { key: 'edit', label: 'Edit', icon: editIcon },
  { key: 'delete', label: 'Delete', icon: deleteIcon },
  { key: 'sort', label: 'Sort', icon: sortIcon, iconOnly: true },
  { key: 'filter', label: 'Filter', icon: filterIcon, iconOnly: true },
  {
    key: 'export',
    label: 'Export',
    icon: exportIcon,
    menu: [
      { key: 'csv', label: 'As CSV' },
      { key: 'pdf', label: 'As PDF' },
    ],
  },
  { key: 'print', label: 'Print', icon: printIcon, overflow: 'always' },
  { key: 'refresh', label: 'Refresh', icon: refreshIcon, iconOnly: true },
];

function Demo() {
  const [last, setLast] = useState('none');
  return (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      {[900, 520, 320].map((width) => (
        <div
          key={width}
          style={{ width, padding: 4, border: '1px dashed var(--trui-color-border)' }}
        >
          <Toolbar
            aria-label={`Order actions, ${width} pixels`}
            start={
              <Title level={3} size="s">
                Orders (24)
              </Title>
            }
            items={items}
            onAction={setLast}
          />
        </div>
      ))}
      <Text tone="secondary">Last action: {last}</Text>
    </div>
  );
}

export const Overflow: StoryObj = { render: () => <Demo /> };
