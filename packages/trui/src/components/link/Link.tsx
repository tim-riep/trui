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

import { useText } from '@tim-riep/trui/core';
import type { AnchorHTMLAttributes, MouseEvent, ReactElement, ReactNode, Ref } from 'react';
import { externalLinkIcon } from '../../icons/set/external-link';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Props that {@link Link} hands to a custom element in `render`. */
export interface LinkRenderProps {
  className: string;
  children: ReactNode;
  'aria-disabled'?: true;
  ref?: Ref<HTMLAnchorElement> | undefined;
}

/** Props of {@link Link}. */
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** `subtle` shows the link in the text color until hovered, for links inside dense content. */
  variant?: 'default' | 'subtle';
  /** Opens the target in a new window, with an icon and a hint for assistive technology. */
  external?: boolean;
  /** Shows the link as unavailable; it keeps its text but does not navigate. */
  disabled?: boolean;
  /**
   * Renders another element, e.g. the link component of a router:
   * `render={(props) => <RouterLink to="/orders" {...props} />}`.
   */
  render?: (props: LinkRenderProps) => ReactElement;
  ref?: Ref<HTMLAnchorElement>;
}

/**
 * A link to another page or place. Without `href` and `render` it is a button
 * that looks like a link, for actions that do not navigate.
 *
 * Keyboard: Enter follows the link (and activates the button form with Space too).
 */
export function Link({
  variant = 'default',
  external = false,
  disabled = false,
  render,
  className,
  children,
  href,
  onClick,
  ref,
  ...rest
}: LinkProps) {
  const t = useText();
  const classes = cx(
    'trui-link',
    variant === 'subtle' && 'trui-link--subtle',
    disabled && 'trui-link--disabled',
    className,
  );
  const content = (
    <>
      {children}
      {external && (
        <>
          <Icon icon={externalLinkIcon} size="s" className="trui-link__icon" />
          <span className="trui-visually-hidden"> ({t('link.external')})</span>
        </>
      )}
    </>
  );
  if (render) {
    return render({
      className: classes,
      children: content,
      ref,
      ...(disabled ? { 'aria-disabled': true } : {}),
    });
  }
  if (href === undefined) {
    return (
      <button
        type="button"
        className={classes}
        disabled={disabled}
        onClick={onClick as unknown as (e: MouseEvent<HTMLButtonElement>) => void}
        {...(rest as object)}
      >
        {content}
      </button>
    );
  }
  return (
    <a
      ref={ref}
      className={classes}
      // A disabled link has no target, so it cannot be followed or focused.
      href={disabled ? undefined : href}
      role={disabled ? 'link' : undefined}
      aria-disabled={disabled || undefined}
      target={external ? '_blank' : rest.target}
      rel={external ? 'noopener noreferrer' : rest.rel}
      onClick={onClick}
      {...rest}
    >
      {content}
    </a>
  );
}
