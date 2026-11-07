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

import { focusFirst, type Placement } from '@tim-riep/trui/core';
import { type ReactNode, type RefObject, useEffect, useId, useRef } from 'react';
import { cx } from '../../internal/class-names';
import { Floating } from '../../internal/overlay/Floating';

/** Props of {@link Popover}. */
export interface PopoverProps {
  /** The element the popover belongs to, usually the button that opens it. */
  anchor: RefObject<HTMLElement | null>;
  open: boolean;
  /** Called on Escape and on a click outside; set `open` to false to close. */
  onClose: () => void;
  /** Title in the header; it names the popover for assistive technology. */
  title?: ReactNode;
  /** Name for assistive technology when there is no title. */
  'aria-label'?: string;
  /** Actions at the bottom. */
  footer?: ReactNode;
  placement?: Placement;
  /** Moves focus into the popover when it opens. On by default. */
  autoFocus?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * Content next to an element, e.g. details, filters or a small form. Not
 * modal: the page stays usable, a click outside closes it.
 *
 * Keyboard: focus moves into the popover when it opens; Escape closes it and
 * returns focus to the anchor.
 */
export function Popover({
  anchor,
  open,
  onClose,
  title,
  footer,
  placement = 'bottom-start',
  autoFocus = true,
  className,
  children,
  ...aria
}: PopoverProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open && autoFocus && ref.current) focusFirst(ref.current);
  }, [open, autoFocus]);
  return (
    <Floating
      anchor={anchor}
      open={open}
      onDismiss={onClose}
      placement={placement}
      floatingRef={ref}
      limitHeight={false}
      role="dialog"
      aria-labelledby={title !== undefined ? titleId : undefined}
      aria-label={aria['aria-label']}
      tabIndex={-1}
      className={cx('trui-popover', className)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onClose();
          anchor.current?.focus();
        }
      }}
    >
      {title !== undefined && (
        <div id={titleId} className="trui-popover__title">
          {title}
        </div>
      )}
      <div className="trui-popover__content">{children}</div>
      {footer !== undefined && <div className="trui-popover__footer">{footer}</div>}
    </Floating>
  );
}
