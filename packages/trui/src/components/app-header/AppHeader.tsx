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

import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../internal/class-names';
import { Avatar } from '../avatar/Avatar';
import type { MenuItem } from '../menu/Menu';
import { MenuButton } from '../menu/MenuButton';

/** Props of {@link AppHeader}. */
export interface AppHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Name of the application. */
  title: ReactNode;
  /** Logo before the title. */
  logo?: ReactNode;
  /** Content before the logo, e.g. a button that toggles the navigation. */
  start?: ReactNode;
  /** Content in the middle, e.g. a search field. */
  center?: ReactNode;
  /** Actions before the user menu. */
  actions?: ReactNode;
  /** The signed-in user; shows an avatar that opens `userMenu`. */
  user?: { name: string; picture?: string };
  /** Entries of the user menu, e.g. settings and sign out. */
  userMenu?: readonly MenuItem[];
  onUserMenuAction?: (key: string) => void;
  ref?: Ref<HTMLElement>;
}

/**
 * The header of an application without the shell: title, actions and a user
 * menu. Applications in the shell use its header instead.
 */
export function AppHeader({
  title,
  logo,
  start,
  center,
  actions,
  user,
  userMenu,
  onUserMenuAction,
  className,
  ref,
  ...rest
}: AppHeaderProps) {
  return (
    <header ref={ref} className={cx('trui-app-header', className)} {...rest}>
      {start !== undefined && <div className="trui-app-header__start">{start}</div>}
      {logo !== undefined && <div className="trui-app-header__logo">{logo}</div>}
      <div className="trui-app-header__title">{title}</div>
      <div className="trui-app-header__center">{center}</div>
      {actions !== undefined && <div className="trui-app-header__actions">{actions}</div>}
      {user &&
        (userMenu ? (
          <MenuButton
            variant="text"
            className="trui-app-header__user"
            items={userMenu}
            onAction={(key) => onUserMenuAction?.(key)}
            showChevron={false}
          >
            {/* The button is named by its content: the hidden name, not the initials. */}
            <Avatar
              name={user.name}
              {...(user.picture ? { src: user.picture } : {})}
              size="s"
              decorative
            />
            <span className="trui-visually-hidden">{user.name}</span>
          </MenuButton>
        ) : (
          <Avatar name={user.name} {...(user.picture ? { src: user.picture } : {})} size="s" />
        ))}
    </header>
  );
}
