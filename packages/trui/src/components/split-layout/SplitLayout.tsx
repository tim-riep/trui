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
import type { CSSProperties, HTMLAttributes, ReactNode, Ref } from 'react';
import { arrowLeftIcon } from '../../icons/set/arrow-left';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';

/** Props of {@link SplitLayout}. */
export interface SplitLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The list, e.g. of orders. */
  list: ReactNode;
  /** The detail of the selected entry. */
  detail: ReactNode;
  /**
   * Which pane a narrow layout shows: the detail when true, the list when
   * false. Wide layouts show both.
   */
  showDetail?: boolean;
  /** Called by the back button of the narrow layout; set `showDetail` to false. */
  onBack?: () => void;
  /** Hides the list in the wide layout, e.g. to give the detail all the room. */
  listCollapsed?: boolean;
  /** Width of the list in the wide layout, as CSS length; one third by default. */
  listWidth?: string;
  /** Name of the list region. */
  listLabel?: string;
  /** Name of the detail region. */
  detailLabel?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A list next to the detail of its selected entry. Below 720 pixels of width
 * it shows one pane at a time, with a button back to the list. It contains no
 * routing: the application sets `showDetail`.
 */
export function SplitLayout({
  list,
  detail,
  showDetail = false,
  onBack,
  listCollapsed = false,
  listWidth,
  listLabel,
  detailLabel,
  className,
  style,
  ref,
  ...rest
}: SplitLayoutProps) {
  const t = useText();
  return (
    <div
      ref={ref}
      className={cx(
        'trui-split',
        showDetail ? 'trui-split--detail' : 'trui-split--list',
        listCollapsed && 'trui-split--list-collapsed',
        className,
      )}
      style={
        listWidth ? ({ ...style, '--trui-split-list-width': listWidth } as CSSProperties) : style
      }
      {...rest}
    >
      <section className="trui-split__list" aria-label={listLabel}>
        {list}
      </section>
      <section className="trui-split__detail" aria-label={detailLabel}>
        {onBack && (
          <div className="trui-split__back">
            <Button variant="text" icon={arrowLeftIcon} onClick={onBack}>
              {t('splitLayout.back')}
            </Button>
          </div>
        )}
        <div className="trui-split__detail-content">{detail}</div>
      </section>
    </div>
  );
}
