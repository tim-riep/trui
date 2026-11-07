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

import { useRef, useState } from 'react';
import { chevronDownIcon } from '../../icons/set/chevron-down';
import { Button, type ButtonProps } from '../button/Button';
import { Menu, type MenuItem } from './Menu';

/** Props of {@link MenuButton}: a button with the entries of its menu. */
export type MenuButtonProps = Omit<ButtonProps, 'onClick'> & {
  items: readonly MenuItem[];
  onAction: (key: string, item: MenuItem) => void;
  /** Shows a chevron after the text. On for buttons with text. */
  showChevron?: boolean;
};

/**
 * A button that opens a menu of actions.
 *
 * Keyboard: Enter, Space or Arrow Down open the menu on its first entry,
 * Arrow Up on its last.
 */
export function MenuButton({
  items,
  onAction,
  showChevron,
  iconEnd,
  onKeyDown,
  ...rest
}: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [focusLast, setFocusLast] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const iconOnly = rest.children === undefined;
  const chevron = showChevron ?? !iconOnly;
  return (
    <>
      <Button
        {...(rest as ButtonProps)}
        ref={ref}
        {...(iconEnd !== undefined ? { iconEnd } : chevron ? { iconEnd: chevronDownIcon } : {})}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          setFocusLast(false);
          setOpen(!open);
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setFocusLast(event.key === 'ArrowUp');
            setOpen(true);
          }
        }}
      />
      <Menu
        anchor={ref}
        open={open}
        onClose={() => setOpen(false)}
        items={items}
        onAction={onAction}
        focusLast={focusLast}
        {...(typeof rest['aria-label'] === 'string' ? { 'aria-label': rest['aria-label'] } : {})}
      />
    </>
  );
}
