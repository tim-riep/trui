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
import { TextField } from '../text-field/TextField';
import { type Message, MessageList, MessagesButton } from './MessageList';

/**
 * Collected messages of a page, e.g. all validation messages of a form, with
 * a filter by type. Messages with a `target` move focus to their field.
 * `MessagesButton` shows them in a popover behind a button with the count.
 *
 * **Tokens:** the status colors, `--trui-color-border-subtle`.
 */
const meta = { title: 'Feedback/MessageList', component: MessageList } satisfies Meta<
  typeof MessageList
>;
export default meta;

const messages: Message[] = [
  {
    id: '1',
    type: 'error',
    title: 'Enter a delivery date',
    description: 'Terms',
    target: 'ml-date',
  },
  {
    id: '2',
    type: 'error',
    title: 'Enter a valid amount',
    description: 'Terms',
    target: 'ml-amount',
  },
  { id: '3', type: 'warning', title: 'Supplier is blocked for orders', description: 'Supplier' },
  { id: '4', type: 'information', title: 'Prices are shown without tax' },
];

export const Default: StoryObj = {
  render: () => (
    <div className="catalog-stack">
      <TextField id="ml-date" aria-label="Delivery date" />
      <TextField id="ml-amount" aria-label="Amount" />
      <MessageList messages={messages} />
      <div>
        <MessagesButton messages={messages} />
      </div>
    </div>
  ),
};
