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

import { render, screen } from '@testing-library/react';
import { TruiProvider } from '@tim-riep/trui/core';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { Avatar, initials } from './avatar/Avatar';
import { Badge } from './badge/Badge';
import { Link } from './link/Link';
import { ProgressBar } from './progress-bar/ProgressBar';
import { Spinner } from './spinner/Spinner';
import { Tag } from './tag/Tag';
import { Title } from './title/Title';

describe('Link', () => {
  it('is a link with href and follows it with Enter', async () => {
    render(<Link href="#target">Order</Link>);
    const link = screen.getByRole('link', { name: 'Order' });
    expect(link.getAttribute('href')).toBe('#target');
    link.focus();
    await userEvent.keyboard('{Enter}');
    expect(window.location.hash).toBe('#target');
  });

  it('opens external links in a new window and says so', () => {
    render(
      <TruiProvider locale="de">
        <Link href="https://example.com" external>
          Tracking
        </Link>
      </TruiProvider>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toContain('öffnet in einem neuen Fenster');
  });

  it('is a button without href', async () => {
    const onClick = vi.fn();
    render(<Link onClick={onClick}>Show all</Link>);
    await userEvent.click(screen.getByRole('button', { name: 'Show all' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('cannot be followed when disabled', () => {
    render(
      <Link href="#x" disabled>
        Archived
      </Link>,
    );
    const link = screen.getByText('Archived');
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
  });

  it('renders router links through render', () => {
    render(
      <Link render={(props) => <a href="/router/orders" data-router="" {...props} />}>Orders</Link>,
    );
    const link = screen.getByRole('link', { name: 'Orders' });
    expect(link.hasAttribute('data-router')).toBe(true);
    expect(link.className).toBe('trui-link');
  });
});

describe('Title', () => {
  it('sets the level independently of the size', () => {
    render(
      <Title level={1} size="s">
        Orders
      </Title>,
    );
    const heading = screen.getByRole('heading', { level: 1, name: 'Orders' });
    expect(heading.className).toContain('trui-title--s');
  });
});

describe('Tag and Badge', () => {
  it('renders a tag with its tone', () => {
    render(<Tag tone="error">Overdue</Tag>);
    expect(screen.getByText('Overdue').parentElement!.className).toContain('trui-tag--error');
  });

  it('caps the count and reads the label', () => {
    render(
      <TruiProvider locale="de">
        <Badge count={1500} max={999} label="1.500 neue Meldungen" />
        <Badge count={1234} max={9999} data-testid="plain" />
        <Badge count={0} data-testid="zero" />
      </TruiProvider>,
    );
    expect(screen.getByText('999+').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('1.500 neue Meldungen')).toBeTruthy();
    expect(screen.getByTestId('plain').textContent).toBe('1.234');
    expect(screen.queryByTestId('zero')).toBeNull();
  });
});

describe('Avatar', () => {
  it('derives initials from the first and last word', () => {
    expect(initials('anna maria schmidt')).toBe('AS');
    expect(initials('Acme')).toBe('A');
    expect(initials('  ')).toBe('');
    expect(initials('Émile Zola')).toBe('ÉZ');
  });

  it('is an image named after the person, or hidden when decorative', () => {
    render(
      <>
        <Avatar name="Anna Schmidt" />
        <Avatar name="Ben Okafor" decorative data-testid="decorative" />
      </>,
    );
    expect(screen.getByRole('img', { name: 'Anna Schmidt' }).textContent).toBe('AS');
    expect(screen.getByTestId('decorative').getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps the color of a name', () => {
    render(
      <>
        <Avatar name="Anna Schmidt" data-testid="a" />
        <Avatar name="Anna Schmidt" data-testid="b" />
      </>,
    );
    const color = (id: string) =>
      [...screen.getByTestId(id).classList].find((c) => c.startsWith('trui-avatar--color'));
    expect(color('a')).toBe(color('b'));
  });

  it('falls back to the initials when the picture fails', async () => {
    render(<Avatar name="Anna Schmidt" src="/missing-picture.png" />);
    await vi.waitFor(() =>
      expect(screen.getByRole('img', { name: 'Anna Schmidt' }).textContent).toBe('AS'),
    );
  });
});

describe('Spinner', () => {
  it('is a status with a localized label', () => {
    render(
      <TruiProvider locale="de">
        <Spinner />
      </TruiProvider>,
    );
    expect(screen.getByRole('status').textContent).toBe('Wird geladen …');
  });

  it('appears only after the delay', async () => {
    render(<Spinner delay={50} />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(await screen.findByRole('status')).toBeTruthy();
  });
});

describe('ProgressBar', () => {
  it('exposes its value and label', () => {
    render(
      <TruiProvider locale="de">
        <ProgressBar label="Import" value={40} showValue />
      </TruiProvider>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Import' });
    expect(bar.getAttribute('aria-valuenow')).toBe('40');
    expect(bar.getAttribute('aria-valuetext')).toBe('40 Prozent');
    expect(screen.getByText('40 %')).toBeTruthy();
  });

  it('clamps the value and is indeterminate without one', () => {
    render(
      <>
        <ProgressBar aria-label="Over" value={150} />
        <ProgressBar aria-label="Running" />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Over' }).getAttribute('aria-valuenow')).toBe(
      '100',
    );
    expect(screen.getByRole('progressbar', { name: 'Running' }).hasAttribute('aria-valuenow')).toBe(
      false,
    );
  });
});
