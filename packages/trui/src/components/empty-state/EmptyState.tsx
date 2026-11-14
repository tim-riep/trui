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

import type { IconDefinition } from '@tim-riep/trui/core';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Props of {@link EmptyState}. */
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** A picture of what is missing, e.g. the icon of the objects of a list. */
  icon?: IconDefinition;
  /** What is missing, e.g. "No orders yet". */
  title: ReactNode;
  /** Why it is empty or what to do next. */
  description?: ReactNode;
  /** Buttons that lead on, e.g. to create the first object or clear the filters. */
  actions?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

/**
 * Tells that there is nothing to show and what to do next, e.g. in an empty
 * table, list or search result.
 */
export function EmptyState({
  icon,
  title,
  description,
  actions,
  className,
  ref,
  ...rest
}: EmptyStateProps) {
  return (
    <div ref={ref} className={cx('trui-empty-state', className)} {...rest}>
      {icon && <Icon icon={icon} size="l" className="trui-empty-state__icon" />}
      <div className="trui-empty-state__title">{title}</div>
      {description !== undefined && (
        <div className="trui-empty-state__description">{description}</div>
      )}
      {actions !== undefined && <div className="trui-empty-state__actions">{actions}</div>}
    </div>
  );
}
