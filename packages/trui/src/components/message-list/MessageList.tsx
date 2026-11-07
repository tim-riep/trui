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

import { type FeedbackTone, useText } from '@tim-riep/trui/core';
import { type ReactNode, useMemo, useRef, useState } from 'react';
import { cx } from '../../internal/class-names';
import { toneIcons } from '../banner/Banner';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { Popover } from '../popover/Popover';

/** A message about the content of a page, e.g. a validation error of a field. */
export interface Message {
  id: string;
  type: FeedbackTone;
  title: ReactNode;
  description?: ReactNode;
  /** Id of the element the message is about; choosing the message focuses it. */
  target?: string;
}

/** Props of {@link MessageList}. */
export interface MessageListProps {
  messages: readonly Message[];
  /** Called when the user chooses a message, after its target got focus. */
  onNavigate?: (message: Message) => void;
  className?: string;
}

const order: FeedbackTone[] = ['error', 'warning', 'success', 'information'];

/**
 * Collected messages of a page with a filter by type. Messages with a target
 * are buttons that move focus to the field they are about.
 */
export function MessageList({ messages, onNavigate, className }: MessageListProps) {
  const t = useText();
  const [filter, setFilter] = useState<FeedbackTone | 'all'>('all');
  const counts = useMemo(() => {
    const c: Record<FeedbackTone, number> = { error: 0, warning: 0, success: 0, information: 0 };
    for (const m of messages) c[m.type]++;
    return c;
  }, [messages]);
  const shown = filter === 'all' ? messages : messages.filter((m) => m.type === filter);
  const types = order.filter((type) => counts[type] > 0);

  const go = (message: Message) => {
    if (message.target) document.getElementById(message.target)?.focus();
    onNavigate?.(message);
  };

  return (
    <div className={cx('trui-message-list', className)}>
      {types.length > 1 && (
        <div className="trui-message-list__filter">
          <Button variant="text" pressed={filter === 'all'} onClick={() => setFilter('all')}>
            {t('messages.all')} ({messages.length})
          </Button>
          {types.map((type) => (
            <Button
              key={type}
              variant="text"
              pressed={filter === type}
              icon={toneIcons[type]}
              onClick={() => setFilter(type)}
            >
              {t(`valueState.${type}`)} ({counts[type]})
            </Button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="trui-message-list__empty">{t('messages.none')}</p>
      ) : (
        <ul className="trui-message-list__items">
          {shown.map((message) => {
            const body = (
              <>
                <Icon
                  icon={toneIcons[message.type]}
                  size="s"
                  className={`trui-message-list__icon trui-message-list__icon--${message.type}`}
                  label={t(`valueState.${message.type}`)}
                />
                <span className="trui-message-list__text">
                  <span className="trui-message-list__title">{message.title}</span>
                  {message.description !== undefined && (
                    <span className="trui-message-list__description">{message.description}</span>
                  )}
                </span>
              </>
            );
            return (
              <li key={message.id} className="trui-message-list__item">
                {message.target || onNavigate ? (
                  <button
                    type="button"
                    className="trui-message-list__entry"
                    onClick={() => go(message)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className="trui-message-list__entry">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Props of {@link MessagesButton}. */
export interface MessagesButtonProps extends MessageListProps {
  /** Shows the button also without messages. */
  showEmpty?: boolean;
}

/**
 * A button with the number of messages, colored by the most severe one, that
 * opens the messages in a popover. Hidden while there are none.
 */
export function MessagesButton({
  messages,
  onNavigate,
  showEmpty = false,
  className,
}: MessagesButtonProps) {
  const t = useText();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  if (messages.length === 0 && !showEmpty) return null;
  const worst = order.find((type) => messages.some((m) => m.type === type)) ?? 'information';
  return (
    <>
      <Button
        ref={ref}
        variant="text"
        icon={toneIcons[worst]}
        className={cx('trui-messages-button', `trui-messages-button--${worst}`, className)}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {t('messages.button', { count: messages.length })}
      </Button>
      <Popover
        anchor={ref}
        open={open}
        onClose={() => setOpen(false)}
        title={t('messages.title')}
        placement="top-start"
      >
        <MessageList
          messages={messages}
          onNavigate={(message) => {
            setOpen(false);
            onNavigate?.(message);
          }}
        />
      </Popover>
    </>
  );
}
