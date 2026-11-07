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
import { useMessageDialog, useToast } from '@tim-riep/trui/core';
import { useState } from 'react';
import { Button } from '../button/Button';
import { Text } from '../text/Text';
import { FeedbackHost } from './FeedbackHost';

/**
 * Toasts and message dialogs from anywhere in the application. `useToast()`
 * shows short messages that disappear by themselves (errors stay);
 * `useMessageDialog()` asks with a modal dialog and resolves a promise with
 * the answer. Both need one `FeedbackHost` inside the provider; the queue
 * lives in the provider, so code loaded at runtime uses the host of the
 * application.
 *
 * **Keyboard:** toasts pause while focused; their buttons are reachable with
 * Tab. Message dialogs start on the safe button and close with Escape.
 *
 * **Tokens:** `--trui-color-surface-raised`, `--trui-shadow-l`, the status colors.
 */
const meta = { title: 'Feedback/Toast and message dialog', component: FeedbackHost } satisfies Meta<
  typeof FeedbackHost
>;
export default meta;

function Demo() {
  const toast = useToast();
  const messages = useMessageDialog();
  const [answer, setAnswer] = useState('');
  return (
    <div className="catalog-stack">
      <div className="catalog-row">
        <Button onClick={() => toast.show({ message: 'Purchase order saved', tone: 'success' })}>
          Success toast
        </Button>
        <Button
          onClick={() =>
            toast.show({
              message: 'Item removed',
              action: { label: 'Undo', onAction: () => setAnswer('undone') },
            })
          }
        >
          Toast with action
        </Button>
        <Button
          onClick={() => toast.show({ message: 'Connection to the server lost', tone: 'error' })}
        >
          Error toast
        </Button>
      </div>
      <div className="catalog-row">
        <Button
          variant="danger"
          onClick={async () => {
            const ok = await messages.confirm({
              title: 'Delete purchase order?',
              message: 'Purchase order 4500012345 and its 12 items will be deleted.',
              tone: 'warning',
              confirmLabel: 'Delete',
              danger: true,
            });
            setAnswer(ok ? 'deleted' : 'kept');
          }}
        >
          Delete
        </Button>
        <Button
          onClick={() =>
            messages.alert({
              title: 'Posting failed',
              message: 'The period 11/2026 is closed.',
              tone: 'error',
            })
          }
        >
          Show error
        </Button>
        <Text tone="secondary">{answer}</Text>
      </div>
      <FeedbackHost />
    </div>
  );
}

export const Default: StoryObj = { render: () => <Demo /> };
