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
import { defineIcon, TruiProvider } from '@tim-riep/trui/core';
import { describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { addIcon } from '../../icons/set/add';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { Icon } from '../icon/Icon';
import { Button } from './Button';

describe('Button', () => {
  it('is activated by click, Enter and Space', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole('button', { name: 'Save' });
    await userEvent.click(button);
    // WebKit does not focus buttons on click, as Safari on macOS.
    button.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('does not submit forms unless asked to', async () => {
    const onSubmit = vi.fn((e: SubmitEvent) => e.preventDefault());
    render(
      <form onSubmit={(e) => onSubmit(e.nativeEvent as SubmitEvent)}>
        <Button>Plain</Button>
        <Button type="submit">Send</Button>
      </form>,
    );
    await userEvent.click(screen.getByText('Plain'));
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Send'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('ignores clicks while loading and says it is busy', async () => {
    const onClick = vi.fn();
    render(
      <TruiProvider locale="de">
        <Button loading onClick={onClick}>
          Save
        </Button>
      </TruiProvider>,
    );
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('Wird geladen');
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('names icon-only buttons by their label', () => {
    render(<Button icon={addIcon} aria-label="Add item" />);
    const button = screen.getByRole('button', { name: 'Add item' });
    expect(button.getAttribute('title')).toBe('Add item');
    expect(button.classList.contains('trui-button--icon-only')).toBe(true);
  });

  it('is a toggle button with pressed', () => {
    render(<Button pressed>Bold</Button>);
    expect(screen.getByRole('button', { pressed: true })).toBeTruthy();
  });

  it('passes className, style and ref', () => {
    let element: HTMLButtonElement | null = null;
    render(
      <Button
        className="custom"
        style={{ width: 200 }}
        ref={(el) => {
          element = el;
        }}
      >
        Save
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(element).toBe(button);
    expect(button.classList.contains('custom')).toBe(true);
    expect(button.style.width).toBe('200px');
  });
});

describe('Icon', () => {
  it('is decorative without label and an image with label', () => {
    render(
      <>
        <Icon icon={addIcon} data-testid="plain" />
        <Icon icon={addIcon} label="Add" />
      </>,
    );
    expect(screen.getByTestId('plain').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('img', { name: 'Add' })).toBeTruthy();
  });

  it('renders registered icons by name', () => {
    const custom = defineIcon('custom', ['M1 1h2', { d: 'M3 3h2', fill: true }]);
    render(
      <TruiProvider icons={[custom]}>
        <Icon name="custom" label="Custom" />
      </TruiProvider>,
    );
    const svg = screen.getByRole('img', { name: 'Custom' });
    expect(svg.querySelectorAll('path')).toHaveLength(2);
    expect(svg.querySelector('.trui-icon__fill')).toBeTruthy();
  });

  it('mirrors directional icons in right-to-left layout', async () => {
    await import('../../styles.css');
    render(
      <TruiProvider locale="ar">
        <Icon icon={chevronRightIcon} label="Next" />
        <Icon icon={addIcon} label="Add" />
      </TruiProvider>,
    );
    expect(getComputedStyle(screen.getByRole('img', { name: 'Next' })).transform).not.toBe('none');
    expect(getComputedStyle(screen.getByRole('img', { name: 'Add' })).transform).toBe('none');
  });
});
