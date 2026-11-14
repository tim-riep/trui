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
import { cartIcon } from '../../icons/set/cart';
import { invoiceIcon } from '../../icons/set/invoice';
import { purchaseOrderIcon } from '../../icons/set/purchase-order';
import { settingsIcon } from '../../icons/set/settings';
import { supplierIcon } from '../../icons/set/supplier';
import { Button } from '../button/Button';
import { type Command, CommandPalette } from './CommandPalette';

/**
 * A search for commands and places of an application. Ctrl+K, or Command+K on
 * Apple devices, opens it anywhere on the page; typing filters by label,
 * description and keywords, and commands are listed under their group.
 * Render it once, e.g. next to the shell layout.
 *
 * **Keyboard:** Ctrl+K or Command+K opens it; Arrow Up and Arrow Down move,
 * Enter runs the command, Escape closes the palette and returns focus.
 *
 * **Tokens:** `--trui-color-accent-subtle`, `--trui-radius-xl`, `--trui-shadow-l`.
 */
const meta = {
  title: 'Shell/Command palette',
  component: CommandPalette,
  args: { commands: [], onCommand: () => undefined },
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

const commands: Command[] = [
  {
    key: 'orders',
    label: 'Purchase orders',
    description: 'Create and manage',
    icon: cartIcon,
    group: 'Applications',
  },
  {
    key: 'suppliers',
    label: 'Suppliers',
    description: 'Master data',
    icon: supplierIcon,
    group: 'Applications',
  },
  {
    key: 'invoices',
    label: 'Supplier invoices',
    description: 'Check and post',
    icon: invoiceIcon,
    group: 'Applications',
  },
  {
    key: 'create',
    label: 'Create purchase order',
    icon: purchaseOrderIcon,
    group: 'Actions',
    shortcut: 'Alt+N',
  },
  { key: 'settings', label: 'Settings', icon: settingsIcon, group: 'Actions', disabled: true },
];

function Demo({ initiallyOpen }: { initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [last, setLast] = useState('none');
  return (
    <div className="catalog-row">
      <Button onClick={() => setOpen(true)}>Open commands (Ctrl+K)</Button>
      <span>Last command: {last}</span>
      <CommandPalette
        commands={commands}
        open={open}
        onOpenChange={setOpen}
        onCommand={(key) => setLast(key)}
      />
    </div>
  );
}

export const Default: Story = { render: () => <Demo initiallyOpen={false} /> };

export const Open: Story = { render: () => <Demo initiallyOpen /> };
