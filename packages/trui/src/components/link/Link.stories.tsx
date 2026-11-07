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
import { Text } from '../text/Text';
import { Link } from './Link';

/**
 * A link to another page or place. Pass `href` for plain links, `render` to use
 * the link component of a router, or neither for an action that looks like a
 * link (rendered as a button). `external` opens a new window and says so.
 *
 * **Keyboard:** Tab moves focus to the link; Enter follows it.
 *
 * **Tokens:** `--trui-color-accent-text`, `--trui-color-text-disabled`.
 */
const meta = {
  title: 'Basics/Link',
  component: Link,
  args: { children: 'Purchase order 4500012345', href: '#order' },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="catalog-stack">
      <Text>
        Released by <Link href="#user">Anna Schmidt</Link> on 7 November.
      </Text>
      <Text>
        See the{' '}
        <Link variant="subtle" href="#terms">
          terms of delivery
        </Link>{' '}
        for details.
      </Text>
      <Link href="https://example.com" external>
        Carrier tracking
      </Link>
      <Link onClick={() => undefined}>Show all items</Link>
      <Link href="#x" disabled>
        Archived order
      </Link>
    </div>
  ),
};
