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

import { type IconDefinition, useText } from '@tim-riep/trui/core';
import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Look of a button: its weight within a group of actions. */
export type ButtonVariant = 'primary' | 'secondary' | 'text' | 'danger';

export interface ButtonBaseProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
  /** `primary` for the main action, `secondary` (default), `text` for minor actions, `danger` for destructive ones. */
  variant?: ButtonVariant;
  /** Native button type. Defaults to `button`, so a button in a form does not submit it unless asked. */
  type?: 'button' | 'submit' | 'reset';
  /** Icon before the text, as definition or registered name. */
  icon?: IconDefinition | string;
  /** Icon after the text, e.g. a chevron for buttons that open a menu. */
  iconEnd?: IconDefinition | string;
  /** Shows a busy indicator and ignores clicks while an action runs. */
  loading?: boolean;
  /** Makes the button a toggle button with this state (`aria-pressed`). */
  pressed?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Props of {@link Button}. A button without text shows only its icon and
 * needs `aria-label` or `aria-labelledby`.
 */
export type ButtonProps = ButtonBaseProps &
  (
    | { children: ReactNode }
    | { children?: undefined; 'aria-label': string }
    | { children?: undefined; 'aria-labelledby': string }
  );

function renderIcon(icon: IconDefinition | string | undefined) {
  if (!icon) return null;
  return typeof icon === 'string' ? <Icon name={icon} size="s" /> : <Icon icon={icon} size="s" />;
}

/**
 * A button that triggers an action.
 *
 * Keyboard: Enter and Space activate it. While `loading`, it stays
 * focusable but does not react.
 */
export function Button({
  variant = 'secondary',
  type = 'button',
  icon,
  iconEnd,
  loading = false,
  pressed,
  className,
  children,
  onClick,
  ref,
  ...rest
}: ButtonProps) {
  const t = useText();
  const iconOnly = children === undefined || children === null || children === false;
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        'trui-button',
        `trui-button--${variant}`,
        iconOnly && 'trui-button--icon-only',
        loading && 'trui-button--loading',
        className,
      )}
      aria-pressed={pressed}
      aria-busy={loading || undefined}
      title={iconOnly && !rest.title ? rest['aria-label'] : rest.title}
      onClick={handleClick}
      {...rest}
    >
      {loading ? <span className="trui-button__spinner" aria-hidden="true" /> : renderIcon(icon)}
      {!iconOnly && <span className="trui-button__text">{children}</span>}
      {renderIcon(iconEnd)}
      {loading && <span className="trui-visually-hidden">{t('common.loading')}</span>}
    </button>
  );
}
