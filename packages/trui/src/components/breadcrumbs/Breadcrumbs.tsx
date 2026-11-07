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
import type { HTMLAttributes, ReactElement, Ref } from 'react';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';
import { Link, type LinkRenderProps } from '../link/Link';

/** A step of {@link Breadcrumbs}. */
export interface BreadcrumbItem {
  key: string;
  label: string;
  href?: string;
  onPress?: () => void;
  /** Renders the link with a router link, as `Link` does. */
  render?: (props: LinkRenderProps) => ReactElement;
}

/** Props of {@link Breadcrumbs}. */
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** The steps from the start; the last one is the current page. */
  items: readonly BreadcrumbItem[];
  ref?: Ref<HTMLElement>;
}

/** The path to the current page, e.g. above the title of a page. */
export function Breadcrumbs({ items, className, ref, ...rest }: BreadcrumbsProps) {
  const t = useText();
  return (
    <nav
      ref={ref}
      aria-label={t('breadcrumbs.label')}
      className={cx('trui-breadcrumbs', className)}
      {...rest}
    >
      <ol className="trui-breadcrumbs__list">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.key} className="trui-breadcrumbs__item">
              {last ? (
                <span aria-current="page" className="trui-breadcrumbs__current">
                  {item.label}
                </span>
              ) : (
                <Link
                  variant="subtle"
                  {...(item.href !== undefined ? { href: item.href } : {})}
                  {...(item.onPress ? { onClick: item.onPress } : {})}
                  {...(item.render ? { render: item.render } : {})}
                >
                  {item.label}
                </Link>
              )}
              {!last && (
                <Icon icon={chevronRightIcon} size="s" className="trui-breadcrumbs__separator" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
