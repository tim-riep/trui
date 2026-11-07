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
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { closeIcon } from '../../icons/set/close';
import { errorIcon } from '../../icons/set/error';
import { infoIcon } from '../../icons/set/info';
import { successIcon } from '../../icons/set/success';
import { warningIcon } from '../../icons/set/warning';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';
import { Icon } from '../icon/Icon';

export const toneIcons = {
  information: infoIcon,
  success: successIcon,
  warning: warningIcon,
  error: errorIcon,
};

/** Props of {@link Banner}. */
export interface BannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: FeedbackTone;
  /** Bold text before the message. */
  title?: ReactNode;
  /** Actions after the message, e.g. a link or a text button. */
  actions?: ReactNode;
  /** Shows a close button and calls this when it is pressed. */
  onClose?: () => void;
  /**
   * Announces the banner when it appears: `polite` waits for a pause,
   * `assertive` interrupts (for errors). Off by default, for banners that are
   * part of the page from the start.
   */
  announce?: 'polite' | 'assertive';
  ref?: Ref<HTMLDivElement>;
}

/** A message within the page, e.g. above a form or a table. */
export function Banner({
  tone = 'information',
  title,
  actions,
  onClose,
  announce,
  className,
  children,
  ref,
  ...rest
}: BannerProps) {
  const t = useText();
  return (
    <div
      ref={ref}
      role={announce === 'assertive' ? 'alert' : announce === 'polite' ? 'status' : undefined}
      className={cx('trui-banner', `trui-banner--${tone}`, className)}
      {...rest}
    >
      <Icon
        icon={toneIcons[tone]}
        size="s"
        className="trui-banner__icon"
        label={t(`valueState.${tone}`)}
      />
      <div className="trui-banner__text">
        {title !== undefined && <strong className="trui-banner__title">{title} </strong>}
        {children}
      </div>
      {actions !== undefined && <div className="trui-banner__actions">{actions}</div>}
      {onClose && (
        <Button
          variant="text"
          icon={closeIcon}
          aria-label={t('banner.close')}
          onClick={onClose}
          className="trui-banner__close"
        />
      )}
    </div>
  );
}
