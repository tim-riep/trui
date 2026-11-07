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

import { createElement, type HTMLAttributes, type ReactNode, type Ref, useId } from 'react';
import { cx } from '../../internal/class-names';

/** Props of {@link Card}. */
export interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Level of the title; 3 by default. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  subtitle?: ReactNode;
  /** Shown before the title, e.g. an avatar or an icon. */
  avatar?: ReactNode;
  /** Actions in the header. */
  actions?: ReactNode;
  /** Content at the bottom, e.g. a status line or buttons. */
  footer?: ReactNode;
  /** Makes the whole card a link to this address. */
  href?: string;
  /** Makes the whole card a button. */
  onPress?: () => void;
  ref?: Ref<HTMLElement>;
}

/**
 * A box that groups content about one thing, e.g. an object in a grid of
 * cards. With `href` or `onPress` the whole card is clickable; the title is
 * then the link or button that keyboard and assistive technology reach.
 */
export function Card({
  title,
  headingLevel = 3,
  subtitle,
  avatar,
  actions,
  footer,
  href,
  onPress,
  className,
  children,
  ref,
  ...rest
}: CardProps) {
  const titleId = useId();
  const interactive = href !== undefined || onPress !== undefined;
  const titleContent = interactive ? (
    href !== undefined ? (
      <a href={href} className="trui-card__target" onClick={onPress}>
        {title}
      </a>
    ) : (
      <button type="button" className="trui-card__target" onClick={onPress}>
        {title}
      </button>
    )
  ) : (
    title
  );
  const hasHeader = title !== undefined || avatar !== undefined || actions !== undefined;
  return (
    <article
      ref={ref}
      aria-labelledby={title !== undefined ? titleId : undefined}
      className={cx('trui-card', interactive && 'trui-card--interactive', className)}
      {...rest}
    >
      {hasHeader && (
        <div className="trui-card__header">
          {avatar !== undefined && <div className="trui-card__avatar">{avatar}</div>}
          <div className="trui-card__heading">
            {title !== undefined &&
              createElement(
                `h${headingLevel}`,
                { id: titleId, className: 'trui-card__title' },
                titleContent,
              )}
            {subtitle !== undefined && <div className="trui-card__subtitle">{subtitle}</div>}
          </div>
          {actions !== undefined && <div className="trui-card__actions">{actions}</div>}
        </div>
      )}
      {children !== undefined && <div className="trui-card__content">{children}</div>}
      {footer !== undefined && <div className="trui-card__footer">{footer}</div>}
    </article>
  );
}
