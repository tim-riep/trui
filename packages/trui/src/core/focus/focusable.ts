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

const focusableSelector = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
  'summary',
  '[tabindex]',
].join(',');

/** Tells whether an element can receive focus by keyboard. */
export function isTabbable(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement) || !el.matches(focusableSelector)) return false;
  if (el.tabIndex < 0 || el.closest('[inert]')) return false;
  if ('checkVisibility' in el) return el.checkVisibility({ visibilityProperty: true });
  return true;
}

/** The elements of `container` that the Tab key reaches, in document order. */
export function tabbableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll(focusableSelector)).filter(isTabbable);
}

/** Moves focus to the first tabbable element of `container`, or to the container itself. */
export function focusFirst(container: HTMLElement): void {
  const target =
    container.querySelector<HTMLElement>('[data-trui-autofocus]') ?? tabbableElements(container)[0];
  (target ?? container).focus();
}
