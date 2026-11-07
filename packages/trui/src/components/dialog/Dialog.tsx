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

import { FieldContext, OverlayContainerProvider, Portal, useText } from '@tim-riep/trui/core';
import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
  type Ref,
  type RefObject,
  useCallback,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { closeIcon } from '../../icons/set/close';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';

/** Why a dialog asks to be closed. */
export type DialogCloseReason = 'escape' | 'closeButton' | 'backdrop';

/** Props of {@link Dialog}. */
export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, 'title' | 'onClose'> {
  /** Whether the dialog is shown. The dialog is always controlled. */
  open: boolean;
  /** Called when the user asks to close the dialog; set `open` to false to close it. */
  onClose: (reason: DialogCloseReason) => void;
  /** Title in the header; it names the dialog for assistive technology. */
  title: ReactNode;
  /** Content of the header next to the title, e.g. a search field. */
  headerContent?: ReactNode;
  /** Actions at the bottom, usually buttons; the main action comes first. */
  footer?: ReactNode;
  /** Width: `s` 400, `m` 600 (default), `l` 900 pixels, or the whole window. Small screens always use the whole window. */
  size?: 's' | 'm' | 'l' | 'fullscreen';
  /** `alertdialog` for messages that need a reaction. */
  role?: 'dialog' | 'alertdialog';
  /** Shows a close button in the header. On by default. */
  showCloseButton?: boolean;
  /** Closes the dialog on a click beside it. Off by default, so that input is not lost. */
  closeOnBackdrop?: boolean;
  /** Element to focus when the dialog opens; by default the first focusable one. */
  initialFocus?: RefObject<HTMLElement | null>;
  ref?: Ref<HTMLDialogElement>;
}

/**
 * A modal dialog. Everything outside of it is inert while it is open.
 *
 * Keyboard: focus moves into the dialog when it opens and back to where it
 * was when it closes; Tab stays inside; Escape asks to close it.
 */
export function Dialog({
  open,
  onClose,
  title,
  headerContent,
  footer,
  size = 'm',
  role = 'dialog',
  showCloseButton = true,
  closeOnBackdrop = false,
  initialFocus,
  className,
  children,
  ref,
  ...rest
}: DialogProps) {
  const t = useText();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  useImperativeHandle(ref, () => dialogRef.current!, []);
  const [overlayContainer, setOverlayContainer] = useState<HTMLElement | null>(null);
  const overlayRef = useCallback((el: HTMLDivElement | null) => setOverlayContainer(el), []);
  const close = useRef(onClose);
  close.current = onClose;

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    initialFocus?.current?.focus();
    const onCancel = (event: Event) => {
      event.preventDefault();
      close.current('escape');
    };
    dialog.addEventListener('cancel', onCancel);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      if (dialog.open) dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, [open, initialFocus]);

  if (!open) return null;

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdrop && event.target === dialogRef.current) close.current('backdrop');
  };

  return (
    <Portal>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape closes the dialog by keyboard */}
      <dialog
        ref={dialogRef}
        role={role === 'alertdialog' ? 'alertdialog' : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={cx('trui-dialog', `trui-dialog--${size}`, className)}
        onClick={onBackdropClick}
        {...rest}
      >
        <div className="trui-dialog__frame">
          <header className="trui-dialog__header">
            <h2 id={titleId} className="trui-dialog__title">
              {title}
            </h2>
            {headerContent}
            {showCloseButton && (
              <Button
                variant="text"
                icon={closeIcon}
                aria-label={t('common.close')}
                className="trui-dialog__close"
                onClick={() => close.current('closeButton')}
              />
            )}
          </header>
          <div className="trui-dialog__content">
            {/* Inputs in the dialog do not belong to a form field the dialog was opened from. */}
            <FieldContext.Provider value={null}>
              <OverlayContainerProvider container={overlayContainer}>
                {children}
              </OverlayContainerProvider>
            </FieldContext.Provider>
          </div>
          {footer !== undefined && <footer className="trui-dialog__footer">{footer}</footer>}
        </div>
        <div ref={overlayRef} className="trui-overlay-container" />
      </dialog>
    </Portal>
  );
}
