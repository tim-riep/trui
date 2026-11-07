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
import { useRef, useState } from 'react';
import { filterIcon } from '../../icons/set/filter';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Popover } from './Popover';

/**
 * Content next to an element, e.g. filters or details. It is not modal: a
 * click outside closes it. Focus moves into it when it opens and back to the
 * anchor on Escape.
 *
 * **Keyboard:** Tab moves within and out of the popover; Escape closes it.
 *
 * **Tokens:** `--trui-color-surface-raised`, `--trui-shadow-m`, `--trui-radius-m`.
 */
const meta = { title: 'Overlays/Popover', component: Popover } satisfies Meta<typeof Popover>;
export default meta;

function Demo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button
        ref={ref}
        icon={filterIcon}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(!open)}
      >
        Filter
      </Button>
      <Popover
        anchor={ref}
        open={open}
        onClose={() => setOpen(false)}
        title="Show orders"
        footer={
          <Button variant="primary" onClick={() => setOpen(false)}>
            Apply
          </Button>
        }
      >
        <div className="catalog-stack">
          <Checkbox defaultChecked>Open</Checkbox>
          <Checkbox>Released</Checkbox>
          <Checkbox>Closed</Checkbox>
        </div>
      </Popover>
    </>
  );
}

export const Default: StoryObj = { render: () => <Demo /> };
