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
import { purchaseOrderIcon } from '../../icons/set/purchase-order';
import { Button } from '../button/Button';
import { EmptyState } from './EmptyState';

/**
 * Tells that there is nothing to show and leads on: say what is missing, why,
 * and offer the next step, e.g. creating the first object or clearing the
 * filters. Tables show it with the text "No data" when `renderEmpty` is not set.
 *
 * **Tokens:** `--trui-color-surface-subtle`, `--trui-color-text-secondary`,
 * `--trui-space-xxl`, `--trui-radius-round`.
 */
const meta = {
  title: 'Feedback/Empty state',
  component: EmptyState,
  args: { title: 'No orders yet' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <EmptyState
      icon={purchaseOrderIcon}
      title="No orders yet"
      description="Orders you create or receive from suppliers appear here."
      actions={
        <Button variant="primary" icon={addIcon}>
          Create order
        </Button>
      }
    />
  ),
};
