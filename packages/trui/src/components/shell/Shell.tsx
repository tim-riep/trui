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

import { type ListItem, type LoadItems, useText } from '@tim-riep/trui/core';
import { type HTMLAttributes, type ReactNode, type Ref, useId, useRef, useState } from 'react';
import { appsIcon } from '../../icons/set/apps';
import { arrowLeftIcon } from '../../icons/set/arrow-left';
import { homeIcon } from '../../icons/set/home';
import { notificationIcon } from '../../icons/set/notification';
import { searchIcon } from '../../icons/set/search';
import { cx } from '../../internal/class-names';
import { Avatar } from '../avatar/Avatar';
import { Badge } from '../badge/Badge';
import { Button } from '../button/Button';
import { ComboBox } from '../combo-box/ComboBox';
import { FeedbackHost } from '../feedback-host/FeedbackHost';
import { Icon } from '../icon/Icon';
import type { MenuItem } from '../menu/Menu';
import { MenuButton } from '../menu/MenuButton';
import {
  type Notification,
  NotificationPanel,
  type NotificationPanelProps,
} from '../notification-panel/NotificationPanel';
import { Popover } from '../popover/Popover';

/** The search of a {@link ShellHeader}. */
export interface ShellSearch {
  placeholder?: string;
  /** Suggestions for what the user types. */
  loadSuggestions?: LoadItems;
  /** Called with the text when the user searches with Enter. */
  onSearch: (query: string) => void;
  /** Called when the user picks a suggestion. */
  onSuggestionSelect?: (item: ListItem) => void;
}

/** Props of {@link ShellHeader}. */
export interface ShellHeaderProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Name of the application or of the current area. */
  title: ReactNode;
  logo?: ReactNode;
  /** Shows a back button that calls this. */
  onBack?: () => void;
  /** Shows a button to the home page that calls this. */
  onHome?: () => void;
  search?: ShellSearch;
  /** Notifications behind the bell with the number of unread ones. */
  notifications?: readonly Notification[];
  /** Handlers of the notification panel. */
  notificationHandlers?: Omit<NotificationPanelProps, 'notifications'>;
  /** Areas or applications to switch between, e.g. companies or modules. */
  areas?: readonly MenuItem[];
  onAreaChange?: (key: string) => void;
  /** Actions before the user menu. */
  actions?: ReactNode;
  user?: { name: string; picture?: string };
  /** Entries of the user menu, e.g. settings, language, tenant and sign out. */
  userMenu?: readonly MenuItem[];
  onUserMenuAction?: (key: string) => void;
  ref?: Ref<HTMLElement>;
}

/**
 * The header of the shell: logo and title, back and home buttons, a search
 * with suggestions, notifications with the number of unread ones, a switch
 * between areas and the user menu.
 */
export function ShellHeader({
  title,
  logo,
  onBack,
  onHome,
  search,
  notifications,
  notificationHandlers,
  areas,
  onAreaChange,
  actions,
  user,
  userMenu,
  onUserMenuAction,
  className,
  ref,
  ...rest
}: ShellHeaderProps) {
  const t = useText();
  const [query, setQuery] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const unread = notifications?.filter((n) => !n.read).length ?? 0;
  return (
    <header ref={ref} className={cx('trui-shell-header', className)} {...rest}>
      <div className="trui-shell-header__start">
        {onBack && (
          <Button
            variant="text"
            icon={arrowLeftIcon}
            aria-label={t('shell.back')}
            onClick={onBack}
          />
        )}
        {onHome && (
          <Button variant="text" icon={homeIcon} aria-label={t('shell.home')} onClick={onHome} />
        )}
        {logo !== undefined && <div className="trui-shell-header__logo">{logo}</div>}
        <div className="trui-shell-header__title">{title}</div>
        {areas && areas.length > 0 && (
          <MenuButton
            variant="text"
            icon={appsIcon}
            aria-label={t('shell.switchArea')}
            items={areas}
            onAction={(key) => onAreaChange?.(key)}
          />
        )}
      </div>
      <div className="trui-shell-header__center">
        {search && (
          <ComboBox
            className="trui-shell-header__search"
            aria-label={t('shell.search')}
            placeholder={search.placeholder ?? t('shell.search')}
            allowCustomValue
            showButton={false}
            value={query}
            startContent={<Icon icon={searchIcon} size="s" />}
            {...(search.loadSuggestions ? { loadItems: search.loadSuggestions } : { items: [] })}
            onChange={(value, item) => {
              setQuery(item ? '' : value);
              if (item) search.onSuggestionSelect?.(item);
              else if (value.trim()) search.onSearch(value.trim());
            }}
          />
        )}
      </div>
      <div className="trui-shell-header__end">
        {actions}
        {notifications && (
          <>
            <Button
              ref={bellRef}
              variant="text"
              icon={notificationIcon}
              aria-label={
                unread > 0
                  ? t('shell.notificationsUnread', { count: unread })
                  : t('shell.notifications')
              }
              aria-haspopup="dialog"
              aria-expanded={panelOpen}
              className="trui-shell-header__bell"
              onClick={() => setPanelOpen(!panelOpen)}
            />
            {unread > 0 && (
              <Badge
                count={unread}
                tone="error"
                className="trui-shell-header__count"
                aria-hidden="true"
              />
            )}
            <Popover
              anchor={bellRef}
              open={panelOpen}
              onClose={() => setPanelOpen(false)}
              title={t('notifications.title')}
              placement="bottom-end"
            >
              <NotificationPanel notifications={notifications} {...notificationHandlers} />
            </Popover>
          </>
        )}
        {user &&
          (userMenu ? (
            <MenuButton
              variant="text"
              className="trui-shell-header__user"
              items={userMenu}
              onAction={(key) => onUserMenuAction?.(key)}
              showChevron={false}
            >
              <Avatar
                name={user.name}
                {...(user.picture ? { src: user.picture } : {})}
                size="s"
                decorative
              />
              <span className="trui-visually-hidden">
                {t('shell.userMenu', { name: user.name })}
              </span>
            </MenuButton>
          ) : (
            <Avatar name={user.name} {...(user.picture ? { src: user.picture } : {})} size="s" />
          ))}
      </div>
    </header>
  );
}

/** Props of {@link ShellLayout}. */
export interface ShellLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The header, usually a `ShellHeader`. */
  header: ReactNode;
  /** Which content is shown. The shell contains no routing; the application sets it. */
  view: 'home' | 'app';
  /** The home page, e.g. `TileGroups`. */
  home: ReactNode;
  /** The opened application. */
  app?: ReactNode;
  /** Navigation of the opened application, e.g. a `SideNavigation`. */
  navigation?: ReactNode;
  /**
   * Keeps the application mounted while the home page is shown, once it was
   * opened, so its state survives. On by default.
   */
  keepAppMounted?: boolean;
  ref?: Ref<HTMLDivElement>;
}

/**
 * The frame of an application: header, optional navigation and the content,
 * which is either the home page or the opened application. It includes the
 * host for toasts and message dialogs and a link to skip to the content.
 */
export function ShellLayout({
  header,
  view,
  home,
  app,
  navigation,
  keepAppMounted = true,
  className,
  ref,
  ...rest
}: ShellLayoutProps) {
  const t = useText();
  const mainId = useId();
  // The application mounts when it is opened first and stays mounted then.
  const [opened, setOpened] = useState(view === 'app');
  if (view === 'app' && !opened) setOpened(true);
  return (
    <div ref={ref} className={cx('trui-shell', `trui-shell--${view}`, className)} {...rest}>
      <a href={`#${mainId}`} className="trui-shell__skip">
        {t('shell.skipToContent')}
      </a>
      {header}
      <div className="trui-shell__body">
        {view === 'app' && navigation !== undefined && (
          <div className="trui-shell__navigation">{navigation}</div>
        )}
        <main id={mainId} tabIndex={-1} className="trui-shell__main">
          <div className="trui-shell__home" hidden={view !== 'home'}>
            {view === 'home' && home}
          </div>
          {(view === 'app' || (keepAppMounted && opened)) && app !== undefined && (
            <div className="trui-shell__app" hidden={view !== 'app'}>
              {app}
            </div>
          )}
        </main>
      </div>
      <FeedbackHost />
    </div>
  );
}
