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
import { Button } from '../button/Button';
import { Link } from '../link/Link';
import { Banner } from './Banner';

/**
 * A message within the page. Use `announce` for banners that appear after the
 * page was shown, so that assistive technology reads them.
 *
 * **Tokens:** the status colors and their `-subtle` variants.
 */
const meta = {
  title: 'Feedback/Banner',
  component: Banner,
  args: {
    children: 'The supplier has been blocked for new orders since 1 November.',
    tone: 'warning',
  },
} satisfies Meta<typeof Banner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 640 }}>
      <Banner tone="information">Prices are shown without tax.</Banner>
      <Banner tone="success" title="Saved." onClose={() => undefined}>
        Purchase order 4500012345 was created.
      </Banner>
      <Banner tone="warning" actions={<Link href="#supplier">Show supplier</Link>}>
        The supplier has been blocked for new orders.
      </Banner>
      <Banner tone="error" title="Not posted." actions={<Button variant="text">Retry</Button>}>
        The period 11/2026 is closed.
      </Banner>
    </div>
  ),
};
