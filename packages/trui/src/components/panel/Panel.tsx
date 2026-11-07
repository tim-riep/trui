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

import { useControllableState } from '@tim-riep/trui/core';
import { createElement, type HTMLAttributes, type ReactNode, type Ref, useId } from 'react';
import { chevronRightIcon } from '../../icons/set/chevron-right';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Props of {@link Panel}. */
export interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Title in the header; it names the panel. */
  title: ReactNode;
  /** Level of the title; 2 by default. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Content of the header after the title, e.g. actions. It is not part of the toggle. */
  headerContent?: ReactNode;
  /** Lets the user collapse the panel. On by default. */
  collapsible?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  ref?: Ref<HTMLElement>;
}

/**
 * A titled section of a page that can be collapsed.
 *
 * Keyboard: the title is a button; Enter or Space expands or collapses it.
 */
export function Panel({
  title,
  headingLevel = 2,
  headerContent,
  collapsible = true,
  expanded,
  defaultExpanded = true,
  onExpandedChange,
  className,
  children,
  ref,
  ...rest
}: PanelProps) {
  const [open, setOpen] = useControllableState(expanded, defaultExpanded, onExpandedChange);
  const contentId = useId();
  const titleId = useId();
  const shown = !collapsible || open;
  return (
    <section
      ref={ref}
      aria-labelledby={titleId}
      className={cx('trui-panel', !shown && 'trui-panel--collapsed', className)}
      {...rest}
    >
      <div className="trui-panel__header">
        {createElement(
          `h${headingLevel}`,
          { className: 'trui-panel__title' },
          collapsible ? (
            <button
              id={titleId}
              type="button"
              className="trui-panel__toggle"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpen(!open)}
            >
              <Icon icon={chevronRightIcon} size="s" className="trui-panel__chevron" />
              {title}
            </button>
          ) : (
            <span id={titleId}>{title}</span>
          ),
        )}
        {headerContent !== undefined && (
          <div className="trui-panel__header-content">{headerContent}</div>
        )}
      </div>
      <div id={contentId} className="trui-panel__content" hidden={!shown}>
        {children}
      </div>
    </section>
  );
}
