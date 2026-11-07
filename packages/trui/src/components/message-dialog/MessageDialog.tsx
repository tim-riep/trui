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
import { type ReactNode, useRef } from 'react';
import { cx } from '../../internal/class-names';
import { toneIcons } from '../banner/Banner';
import { Button } from '../button/Button';
import { Dialog } from '../dialog/Dialog';
import { Icon } from '../icon/Icon';

/** Props of {@link MessageDialog}. */
export interface MessageDialogProps {
  open: boolean;
  /** Called with true for the confirming button, false for cancel, Escape or close. */
  onClose: (confirmed: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  tone?: FeedbackTone;
  /** `confirm` shows a cancelling button too; `alert` only the confirming one. */
  kind?: 'alert' | 'confirm';
  confirmLabel?: string;
  cancelLabel?: string;
  /** Shows the confirming button as destructive. */
  danger?: boolean;
}

/**
 * A modal message that needs an answer: a confirmation, a warning or an
 * error. For a promise-based use, see `useMessageDialog`.
 *
 * Keyboard: focus starts on the cancelling button of a confirmation, so that
 * Enter does not confirm by accident, and on OK otherwise; Escape cancels.
 */
export function MessageDialog({
  open,
  onClose,
  title,
  children,
  tone = 'information',
  kind = 'alert',
  confirmLabel,
  cancelLabel,
  danger = false,
}: MessageDialogProps) {
  const t = useText();
  const safeRef = useRef<HTMLButtonElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      role="alertdialog"
      size="s"
      showCloseButton={false}
      initialFocus={kind === 'confirm' ? safeRef : okRef}
      className={cx('trui-message-dialog', `trui-message-dialog--${tone}`)}
      title={
        <span className="trui-message-dialog__title">
          <Icon
            icon={toneIcons[tone]}
            className="trui-message-dialog__icon"
            label={t(`valueState.${tone}`)}
          />
          {title}
        </span>
      }
      footer={
        <>
          <Button ref={okRef} variant={danger ? 'danger' : 'primary'} onClick={() => onClose(true)}>
            {confirmLabel ?? t('common.ok')}
          </Button>
          {kind === 'confirm' && (
            <Button ref={safeRef} onClick={() => onClose(false)}>
              {cancelLabel ?? t('common.cancel')}
            </Button>
          )}
        </>
      }
    >
      <div className="trui-message-dialog__message">{children}</div>
    </Dialog>
  );
}
