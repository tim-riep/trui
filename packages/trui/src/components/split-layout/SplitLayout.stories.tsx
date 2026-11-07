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
import { Page, PageHeader } from '../page/Page';
import { Text } from '../text/Text';
import { SplitLayout } from './SplitLayout';

/**
 * A list next to the detail of its selected entry. Below 720 pixels it shows
 * one pane at a time with a back button; the application decides which.
 *
 * **Tokens:** `--trui-color-surface`, `--trui-color-border`.
 */
const meta = { title: 'Layout/SplitLayout', component: SplitLayout } satisfies Meta<
  typeof SplitLayout
>;
export default meta;

const orders = ['4500012345', '4500012346', '4500012347', '4500012348'];

function Demo({ width }: { width: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div style={{ width, height: 360, border: '1px solid var(--trui-color-border)' }}>
      <SplitLayout
        listLabel="Orders"
        detailLabel="Order"
        showDetail={selected !== null}
        onBack={() => setSelected(null)}
        list={
          <ul style={{ listStyle: 'none', margin: 0, padding: 8 }}>
            {orders.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => setSelected(o)}
                  style={{ all: 'unset', cursor: 'pointer', padding: 8, display: 'block' }}
                >
                  {o}
                </button>
              </li>
            ))}
          </ul>
        }
        detail={
          <Page header={<PageHeader title={selected ?? 'No order selected'} headingLevel={2} />}>
            <Text>
              {selected ? `Details of order ${selected}` : 'Select an order in the list.'}
            </Text>
          </Page>
        }
      />
    </div>
  );
}

export const Wide: StoryObj = { render: () => <Demo width={900} /> };
export const Narrow: StoryObj = { render: () => <Demo width={480} /> };
