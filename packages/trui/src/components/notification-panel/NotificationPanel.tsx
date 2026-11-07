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

import {
  addDays,
  type TimestampString,
  timestampToDate,
  today,
  toZoned,
  useFormat,
  useLocale,
  useText,
} from '@tim-riep/trui/core';
import { type ReactNode, useState } from 'react';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';
import { Tag } from '../tag/Tag';

/** A notification of a {@link NotificationPanel}. */
export interface Notification {
  id: string;
  title: string;
  text?: ReactNode;
  /** When it was created, as UTC timestamp. */
  timestamp: TimestampString;
  priority: 'high' | 'medium' | 'low';
  read: boolean;
  /** Actions of the notification, e.g. "Approve". */
  actions?: readonly { key: string; label: string }[];
}

/** Props of {@link NotificationPanel}. */
export interface NotificationPanelProps {
  notifications: readonly Notification[];
  /** Grouping of the notifications; the user can switch it. */
  defaultGroupBy?: 'date' | 'priority';
  onAction?: (key: string, notification: Notification) => void;
  onMarkRead?: (notification: Notification) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (notification: Notification) => void;
  /** The current time, for relative times; now by default. */
  now?: number;
  className?: string;
}

const priorities = ['high', 'medium', 'low'] as const;
const priorityTone = { high: 'error', medium: 'warning', low: 'neutral' } as const;

/**
 * Notifications with title, text, time, priority and actions, grouped by
 * date or priority. Unread ones are marked; they can be marked as read and
 * dismissed one by one.
 */
export function NotificationPanel({
  notifications,
  defaultGroupBy = 'date',
  onAction,
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  now,
  className,
}: NotificationPanelProps) {
  const t = useText();
  const format = useFormat();
  const { locale, timeZone } = useLocale();
  const [groupBy, setGroupBy] = useState(defaultGroupBy);
  const current = now ?? Date.now();
  const day = today(timeZone, current);
  const yesterday = addDays(day, -1);
  const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const when = (n: Notification) => {
    const minutes = Math.round((current - timestampToDate(n.timestamp).getTime()) / 60_000);
    if (minutes < 60) return relative.format(-Math.max(minutes, 0), 'minute');
    if (minutes < 24 * 60) return relative.format(-Math.round(minutes / 60), 'hour');
    return format.timestamp(n.timestamp, { dateStyle: 'medium' });
  };

  const sorted = [...notifications].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  const groups: { key: string; label: string; items: Notification[] }[] =
    groupBy === 'priority'
      ? priorities.map((p) => ({
          key: p,
          label: t(`priority.${p}`),
          items: sorted.filter((n) => n.priority === p),
        }))
      : [
          { key: 'today', label: t('notifications.today'), items: [] as Notification[] },
          { key: 'yesterday', label: t('notifications.yesterday'), items: [] as Notification[] },
          { key: 'earlier', label: t('notifications.earlier'), items: [] as Notification[] },
        ].map((g) => ({
          ...g,
          items: sorted.filter((n) => {
            const d = toZoned(n.timestamp, timeZone).date;
            return g.key === 'today'
              ? d === day
              : g.key === 'yesterday'
                ? d === yesterday
                : d < yesterday;
          }),
        }));
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={cx('trui-notifications', className)}>
      <div className="trui-notifications__toolbar">
        <div className="trui-notifications__group-by">
          <Button variant="text" pressed={groupBy === 'date'} onClick={() => setGroupBy('date')}>
            {t('notifications.groupByDate')}
          </Button>
          <Button
            variant="text"
            pressed={groupBy === 'priority'}
            onClick={() => setGroupBy('priority')}
          >
            {t('notifications.groupByPriority')}
          </Button>
        </div>
        {onMarkAllRead && unread > 0 && (
          <Button variant="text" onClick={onMarkAllRead}>
            {t('notifications.markAllRead')}
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="trui-notifications__empty">{t('notifications.empty')}</p>
      ) : (
        groups
          .filter((g) => g.items.length > 0)
          .map((group) => (
            <section key={group.key} className="trui-notifications__group" aria-label={group.label}>
              <h3 className="trui-notifications__group-title">{group.label}</h3>
              <ul className="trui-notifications__list">
                {group.items.map((n) => (
                  <li
                    key={n.id}
                    className={cx('trui-notification', !n.read && 'trui-notification--unread')}
                  >
                    <div className="trui-notification__header">
                      {!n.read && (
                        <span className="trui-notification__dot">
                          <span className="trui-visually-hidden">{t('notifications.unread')}</span>
                        </span>
                      )}
                      <span className="trui-notification__title">{n.title}</span>
                      {onDismiss && (
                        <Button
                          variant="text"
                          icon={closeIcon}
                          aria-label={`${t('notifications.dismiss')}: ${n.title}`}
                          className="trui-notification__dismiss"
                          onClick={() => onDismiss(n)}
                        />
                      )}
                    </div>
                    {n.text !== undefined && (
                      <div className="trui-notification__text">{n.text}</div>
                    )}
                    <div className="trui-notification__meta">
                      <time dateTime={n.timestamp}>{when(n)}</time>
                      {n.priority !== 'low' && (
                        <Tag tone={priorityTone[n.priority]}>{t(`priority.${n.priority}`)}</Tag>
                      )}
                    </div>
                    {(n.actions?.length || (onMarkRead && !n.read)) && (
                      <div className="trui-notification__actions">
                        {n.actions?.map((a) => (
                          <Button key={a.key} onClick={() => onAction?.(a.key, n)}>
                            {a.label}
                          </Button>
                        ))}
                        {onMarkRead && !n.read && (
                          <Button variant="text" onClick={() => onMarkRead(n)}>
                            {t('notifications.markRead')}
                          </Button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
      )}
    </div>
  );
}
