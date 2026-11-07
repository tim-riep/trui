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
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { deleteIcon } from '../../icons/set/delete';
import { editIcon } from '../../icons/set/edit';
import { moreHorizontalIcon } from '../../icons/set/more-horizontal';
import { Button } from './Button';

/**
 * A button triggers an action. Use one `primary` button for the main action
 * of an area, `secondary` for other actions, `text` for minor ones and
 * `danger` for destructive actions.
 *
 * **Keyboard:** Tab moves focus to the button; Enter and Space activate it.
 *
 * **Tokens:** `--trui-color-accent`, `--trui-color-on-accent`, `--trui-color-error`,
 * `--trui-color-border-strong`, `--trui-control-height`, `--trui-control-padding-inline`,
 * `--trui-radius-m`.
 */
const meta = {
  title: 'Basics/Button',
  component: Button,
  args: { children: 'Save', variant: 'secondary' },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="catalog-row">
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="text">Reset filters</Button>
      <Button variant="danger" icon={deleteIcon}>
        Delete
      </Button>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="catalog-row">
      <Button variant="primary" icon={addIcon}>
        Create order
      </Button>
      <Button icon={editIcon}>Edit</Button>
      <Button iconEnd={chevronDownIcon}>Actions</Button>
      <Button icon={editIcon} aria-label="Edit" />
      <Button variant="text" icon={moreHorizontalIcon} aria-label="More actions" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="catalog-row">
      <Button variant="primary" disabled>
        Disabled
      </Button>
      <Button disabled>Disabled</Button>
      <Button variant="primary" loading>
        Saving
      </Button>
      <Button pressed>Pressed</Button>
      <Button pressed={false}>Not pressed</Button>
    </div>
  ),
};
