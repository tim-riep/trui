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

import { render, screen, within } from '@testing-library/react';
import { TruiProvider, useMessageDialog, useToast } from '@tim-riep/trui/core';
import axe from 'axe-core';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../styles.css';
import { Banner } from './banner/Banner';
import { Button } from './button/Button';
import { FeedbackHost } from './feedback-host/FeedbackHost';
import type { MenuItem } from './menu/Menu';
import { MenuButton } from './menu/MenuButton';
import { type Message, MessageList } from './message-list/MessageList';
import { Popover } from './popover/Popover';

async function expectNoViolations() {
  // Colors are measured after fade-in animations.
  await Promise.all(
    document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
      // An animation of an element removed meanwhile is cancelled.
      .map((a) => a.finished.catch(() => undefined)),
  );
  // The test page has no landmarks of its own, so the region rule does not apply.
  const result = await axe.run(document.body, {
    resultTypes: ['violations'],
    rules: { region: { enabled: false } },
  });
  expect(
    result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([]);
}

const items: MenuItem[] = [
  { key: 'edit', label: 'Edit' },
  { key: 'copy', label: 'Copy', disabled: true },
  {
    key: 'export',
    label: 'Export',
    items: [
      { key: 'csv', label: 'As CSV' },
      { key: 'pdf', label: 'As PDF' },
    ],
  },
  { key: 'delete', label: 'Delete', danger: true, separatorBefore: true },
];

function PopoverDemo() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button ref={ref} onClick={() => setOpen(!open)}>
        Filter
      </Button>
      <Popover anchor={ref} open={open} onClose={() => setOpen(false)} title="Show orders">
        <input aria-label="inside" />
      </Popover>
    </>
  );
}

function FeedbackDemo({ onAnswer }: { onAnswer: (ok: boolean) => void }) {
  const toast = useToast();
  const messages = useMessageDialog();
  return (
    <>
      <Button onClick={() => toast.show({ message: 'Saved', tone: 'success', duration: 1500 })}>
        toast
      </Button>
      <Button onClick={() => toast.show({ message: 'Failed', tone: 'error' })}>error</Button>
      <Button
        onClick={() =>
          toast.show({
            message: 'Removed',
            duration: null,
            action: { label: 'Undo', onAction: () => onAnswer(false) },
          })
        }
      >
        undo
      </Button>
      <Button
        onClick={async () =>
          onAnswer(
            await messages.confirm({
              title: 'Delete?',
              message: 'It cannot be undone.',
              danger: true,
              confirmLabel: 'Delete',
            }),
          )
        }
      >
        ask
      </Button>
      <FeedbackHost />
    </>
  );
}

function NoHost() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ message: 'x' })}>show</Button>;
}

describe('Popover', () => {
  it('moves focus in, closes with Escape and returns focus', async () => {
    render(<PopoverDemo />);
    const button = screen.getByRole('button', { name: 'Filter' });
    button.focus();
    await userEvent.keyboard('{Enter}');
    const dialog = await screen.findByRole('dialog', { name: 'Show orders' });
    expect(document.activeElement).toBe(within(dialog).getByRole('textbox'));
    await expectNoViolations();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(button);
  });
});

describe('Menu', () => {
  it('is operated by keyboard, skips disabled entries and opens submenus', async () => {
    const onAction = vi.fn();
    render(
      <MenuButton items={items} onAction={onAction}>
        Actions
      </MenuButton>,
    );
    const button = screen.getByRole('button', { name: 'Actions' });
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    button.focus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menu')).toBeTruthy();
    await expect.poll(() => document.activeElement?.textContent).toBe('Edit');
    await expectNoViolations();
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toContain('Export');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    expect(document.activeElement?.textContent).toBe('As CSV');
    await userEvent.keyboard('{ArrowLeft}');
    expect(screen.getAllByRole('menu')).toHaveLength(1);
    expect(document.activeElement?.textContent).toContain('Export');
    await userEvent.keyboard('{Enter}{ArrowDown}{Enter}');
    expect(onAction).toHaveBeenCalledWith('pdf', expect.objectContaining({ label: 'As PDF' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('jumps by typing, opens on the last entry with Arrow Up and closes with Escape', async () => {
    render(<MenuButton items={items} onAction={() => undefined} aria-label="More" />);
    const button = screen.getByRole('button', { name: 'More' });
    button.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect.poll(() => document.activeElement?.textContent).toBe('Delete');
    await userEvent.keyboard('e');
    await expect.poll(() => document.activeElement?.textContent).toBe('Edit');
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it('opens submenus with the left arrow in right-to-left layout', async () => {
    render(
      <TruiProvider locale="ar">
        <MenuButton items={items} onAction={() => undefined}>
          Actions
        </MenuButton>
      </TruiProvider>,
    );
    screen.getByRole('button', { name: 'Actions' }).focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowLeft}');
    expect(document.activeElement?.textContent).toBe('As CSV');
  });
});

describe('Banner', () => {
  it('announces when asked and closes', async () => {
    const onClose = vi.fn();
    render(
      <TruiProvider locale="de">
        <Banner tone="error" announce="assertive" onClose={onClose}>
          Not posted
        </Banner>
      </TruiProvider>,
    );
    expect(screen.getByRole('alert').textContent).toContain('Not posted');
    expect(screen.getByRole('img', { name: 'Fehler' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Meldung schließen' }));
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Toasts and message dialogs', () => {
  it('shows toasts in live regions, dismisses them after their time and keeps errors', async () => {
    render(
      <TruiProvider>
        <FeedbackDemo onAnswer={() => undefined} />
      </TruiProvider>,
    );
    await userEvent.click(screen.getByText('toast'));
    await userEvent.click(screen.getByText('error'));
    expect(within(screen.getByRole('status')).getByText('Saved')).toBeTruthy();
    expect(within(screen.getByRole('alert')).getByText('Failed')).toBeTruthy();
    await expectNoViolations();
    await vi.waitFor(() => expect(screen.queryByText('Saved')).toBeNull(), { timeout: 5000 });
    expect(screen.getByText('Failed')).toBeTruthy();
    await userEvent.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Dismiss' }),
    );
    expect(screen.queryByText('Failed')).toBeNull();
  });

  it('runs the action of a toast', async () => {
    const onAnswer = vi.fn();
    render(
      <TruiProvider>
        <FeedbackDemo onAnswer={onAnswer} />
      </TruiProvider>,
    );
    await userEvent.click(screen.getByText('undo'));
    await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
    expect(onAnswer).toHaveBeenCalledWith(false);
    expect(screen.queryByText('Removed')).toBeNull();
  });

  it('resolves a confirmation with the answer and starts on the safe button', async () => {
    const onAnswer = vi.fn();
    render(
      <TruiProvider>
        <FeedbackDemo onAnswer={onAnswer} />
      </TruiProvider>,
    );
    await userEvent.click(screen.getByText('ask'));
    const dialog = await screen.findByRole('alertdialog', { name: /Delete\?/ });
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' }));
    await expectNoViolations();
    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith(false));
    await userEvent.click(screen.getByText('ask'));
    await userEvent.click(await screen.findByRole('button', { name: 'Delete' }));
    await vi.waitFor(() => expect(onAnswer).toHaveBeenLastCalledWith(true));
  });

  it('warns when no host shows the queue', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    render(
      <TruiProvider>
        <NoHost />
      </TruiProvider>,
    );
    await userEvent.click(screen.getByText('show'));
    expect(warn.mock.calls.flat().join(' ')).toContain('FeedbackHost');
    warn.mockRestore();
  });
});

describe('MessageList', () => {
  it('filters by type and moves focus to the target', async () => {
    const messages: Message[] = [
      { id: '1', type: 'error', title: 'Enter a date', target: 'date-field' },
      { id: '2', type: 'warning', title: 'Supplier blocked' },
    ];
    render(
      <>
        <input id="date-field" aria-label="Date" />
        <MessageList messages={messages} />
      </>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Warning/ }));
    expect(screen.queryByText('Enter a date')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /All/ }));
    await userEvent.click(screen.getByRole('button', { name: /Enter a date/ }));
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Date' }));
  });
});
