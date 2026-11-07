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

import { type ListItem, useLocale } from '@tim-riep/trui/core';
import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { edgeEnabled, findByText, nextEnabled, optionId } from './navigation';

export interface ListPopupOptions {
  /** The options currently shown. */
  items: readonly ListItem[];
  /** Called when the user picks an option. */
  onSelect: (item: ListItem) => void;
  /** Index to start on when the list opens, e.g. the selected option. */
  initialIndex?: () => number;
  /** Jumps to options by typing their first letters (for buttons, not text inputs). */
  typeahead?: boolean;
  /** Keeps the list open after picking, for multiple selection. */
  stayOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Open state, active option and keyboard of an element that owns a list of
 * options (combobox pattern with `aria-activedescendant`).
 *
 * Keyboard: Arrow Down and Arrow Up open the list and move through it, Home
 * and End go to the first and last option, Enter picks the active option,
 * Escape and Tab close the list.
 */
export function useListPopup({
  items,
  onSelect,
  initialIndex,
  typeahead = false,
  stayOpen = false,
  disabled = false,
  onOpenChange,
}: ListPopupOptions) {
  const { locale } = useLocale();
  const listboxId = useId();
  const [open, setOpenState] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const typed = useRef({ text: '', at: 0 });

  const setOpen = (next: boolean) => {
    if (next === open) return;
    setOpenState(next);
    onOpenChange?.(next);
    if (next) {
      const start = initialIndex?.() ?? -1;
      setActiveIndex(start >= 0 ? start : edgeEnabled(items, false));
    } else {
      setActiveIndex(-1);
    }
  };

  // Keep the active option inside the list when the options change.
  useEffect(() => {
    if (activeIndex >= items.length)
      setActiveIndex(items.length > 0 ? edgeEnabled(items, false) : -1);
  }, [items, activeIndex]);

  const select = (item: ListItem) => {
    if (item.disabled) return;
    onSelect(item);
    if (!stayOpen) setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (disabled) return;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex(nextEnabled(items, activeIndex, 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        if (!open) setOpen(true);
        else setActiveIndex(nextEnabled(items, activeIndex, -1));
        return;
      case 'Home':
      case 'End':
        if (!open) return;
        event.preventDefault();
        setActiveIndex(edgeEnabled(items, event.key === 'End'));
        return;
      case 'Enter':
        if (open && activeIndex >= 0 && items[activeIndex]) {
          event.preventDefault();
          select(items[activeIndex]!);
        }
        return;
      case 'Escape':
        if (open) {
          // Keeps a dialog around from closing as well.
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        return;
      case 'Tab':
        if (open) setOpen(false);
        return;
    }
    if (typeahead && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now();
      typed.current = {
        text: now - typed.current.at < 700 ? typed.current.text + event.key : event.key,
        at: now,
      };
      const found = findByText(items, typed.current.text, activeIndex, locale);
      if (found >= 0) {
        if (event.key === ' ' && typed.current.text === ' ') return;
        event.preventDefault();
        if (!open) setOpen(true);
        setActiveIndex(found);
      }
    }
  };

  return {
    open,
    setOpen,
    activeIndex,
    setActiveIndex,
    listboxId,
    select,
    onKeyDown,
    /** ARIA attributes of the element that owns the list. */
    ownerProps: {
      role: 'combobox' as const,
      'aria-expanded': open,
      'aria-controls': listboxId,
      'aria-haspopup': 'listbox' as const,
      'aria-activedescendant':
        open && activeIndex >= 0 ? optionId(listboxId, activeIndex) : undefined,
    },
  };
}
