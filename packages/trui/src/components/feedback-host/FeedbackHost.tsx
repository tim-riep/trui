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

import { type ToastEntry, useFeedbackQueue, useText } from '@tim-riep/trui/core';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { toneIcons } from '../banner/Banner';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';
import { MessageDialog } from '../message-dialog/MessageDialog';

function Toast({ toast, onDismiss }: { toast: ToastEntry; onDismiss: () => void }) {
  const t = useText();
  const tone = toast.tone ?? 'information';
  // A toast with an action stays longer, so that there is time to undo.
  const duration =
    toast.duration === undefined
      ? tone === 'error'
        ? null
        : toast.action
          ? 8000
          : 5000
      : toast.duration;
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (duration === null || paused) return;
    const start = Date.now();
    const timer = setTimeout(() => dismiss.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - start;
    };
  }, [duration, paused]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: pauses the timer while pointer or focus is inside; no action
    <div
      className={cx('trui-toast', `trui-toast--${tone}`, paused && 'trui-toast--paused')}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Icon
        icon={toneIcons[tone]}
        size="s"
        className="trui-toast__icon"
        label={t(`valueState.${tone}`)}
      />
      <div className="trui-toast__message">{toast.message}</div>
      {toast.action && (
        <Button
          variant="text"
          className="trui-toast__action"
          onClick={() => {
            toast.action?.onAction();
            onDismiss();
          }}
        >
          {toast.action.label}
        </Button>
      )}
      <Button
        variant="text"
        icon={closeIcon}
        aria-label={t('toast.dismiss')}
        className="trui-toast__close"
        onClick={onDismiss}
      />
      {duration !== null && (
        <span
          className="trui-toast__timer"
          style={{ '--trui-toast-duration': `${duration}ms` } as CSSProperties}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/**
 * Shows the toasts and message dialogs that `useToast` and
 * `useMessageDialog` queue. Render it once inside the outermost provider,
 * e.g. next to the routes of the application; the shell layout includes it.
 *
 * Toasts are announced politely, errors at once. They pause while hovered or
 * focused; errors stay until dismissed.
 */
export function FeedbackHost() {
  const t = useText();
  const queue = useFeedbackQueue();
  useEffect(() => queue?.registerHost(), [queue?.registerHost]);
  if (!queue) return null;
  const dialog = queue.dialogs[0];
  const errors = queue.toasts.filter((toast) => toast.tone === 'error');
  const others = queue.toasts.filter((toast) => toast.tone !== 'error');
  return (
    <>
      <section className="trui-toast-region" aria-label={t('toast.region')}>
        <div role="status" className="trui-toast-region__list">
          {others.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={() => queue.dismissToast(toast.id)} />
          ))}
        </div>
        <div role="alert" className="trui-toast-region__list">
          {errors.map((toast) => (
            <Toast key={toast.id} toast={toast} onDismiss={() => queue.dismissToast(toast.id)} />
          ))}
        </div>
      </section>
      {dialog && (
        <MessageDialog
          key={dialog.id}
          open
          kind={dialog.kind}
          title={dialog.title}
          {...(dialog.tone !== undefined ? { tone: dialog.tone } : {})}
          {...(dialog.confirmLabel !== undefined ? { confirmLabel: dialog.confirmLabel } : {})}
          {...(dialog.cancelLabel !== undefined ? { cancelLabel: dialog.cancelLabel } : {})}
          {...(dialog.danger !== undefined ? { danger: dialog.danger } : {})}
          onClose={(confirmed) => queue.closeDialog(dialog.id, confirmed)}
        >
          {dialog.message}
        </MessageDialog>
      )}
    </>
  );
}
