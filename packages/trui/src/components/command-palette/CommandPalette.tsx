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
import { type IconDefinition, useControllableState, useText } from '@tim-riep/trui/core';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { searchIcon } from '../../icons/set/search';
import { cx } from '../../internal/class-names';
import { Dialog } from '../dialog/Dialog';
import { Icon } from '../icon/Icon';

/** A command in a {@link CommandPalette}. */
export interface Command {
  key: string;
  label: string;
  /** A second line, e.g. where the command leads. */
  description?: string;
  icon?: IconDefinition;
  /** Heading the command is listed under, e.g. "Applications" or "Recent". */
  group?: string;
  /** Further words the command is found by. */
  keywords?: readonly string[];
  /** Keys that run the command elsewhere, shown as a hint, e.g. `Ctrl+S`. */
  shortcut?: string;
  disabled?: boolean;
}

/** Props of {@link CommandPalette}. */
export interface CommandPaletteProps {
  commands: readonly Command[];
  /** Called with the key of the command the user runs; the palette closes. */
  onCommand: (key: string, command: Command) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Opens the palette with Ctrl+K, or Command+K on Apple devices, anywhere on
   * the page. On by default.
   */
  globalShortcut?: boolean;
  placeholder?: string;
  className?: string;
}

/** Tells whether all words of the query occur in the texts of the command. */
function matches(command: Command, words: readonly string[]): boolean {
  const text = [command.label, command.description ?? '', ...(command.keywords ?? [])]
    .join(' ')
    .toLocaleLowerCase();
  return words.every((w) => text.includes(w));
}

/**
 * A search for commands and places of an application, opened with Ctrl+K or
 * Command+K. Typing filters the commands by label, description and keywords;
 * commands whose label starts with the query come first.
 *
 * Keyboard: Ctrl+K or Command+K opens it; Arrow Up and Arrow Down move,
 * Home and End jump, Enter runs the command, Escape closes the palette.
 */
export function CommandPalette({
  commands,
  onCommand,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  globalShortcut = true,
  placeholder,
  className,
}: CommandPaletteProps) {
  const t = useText();
  const [open, setOpen] = useControllableState(openProp, defaultOpen, onOpenChange);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const setOpenRef = useRef(setOpen);
  setOpenRef.current = setOpen;

  useEffect(() => {
    if (!globalShortcut) return;
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpenRef.current(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [globalShortcut]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
    }
  }, [open]);

  const found = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    if (!q) return commands;
    const words = q.split(/\s+/);
    const hits = commands.filter((c) => matches(c, words));
    const starts = hits.filter((c) => c.label.toLocaleLowerCase().startsWith(q));
    return [...starts, ...hits.filter((c) => !starts.includes(c))];
  }, [commands, query]);

  // Groups in the order of their first command; commands keep their order inside.
  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const c of found) {
      const list = map.get(c.group ?? '') ?? [];
      list.push(c);
      map.set(c.group ?? '', list);
    }
    return [...map.entries()];
  }, [found]);
  const ordered = groups.flatMap(([, list]) => list);
  const current = Math.min(active, ordered.length - 1);
  const optionId = (index: number) => `${id}-option-${index}`;

  useEffect(() => {
    if (current < 0) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(optionId(current))}`)
      ?.scrollIntoView({ block: 'nearest' });
  });

  const run = (command: Command | undefined) => {
    if (!command || command.disabled) return;
    setOpen(false);
    onCommand(command.key, command);
  };

  let index = -1;
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title={t('command.title')}
      showCloseButton={false}
      closeOnBackdrop
      initialFocus={inputRef}
      size="m"
      className={cx('trui-command-palette', className)}
    >
      <div className="trui-command-palette__search">
        <Icon icon={searchIcon} size="m" className="trui-command-palette__search-icon" />
        <input
          ref={inputRef}
          className="trui-command-palette__input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={current >= 0 ? optionId(current) : undefined}
          aria-label={t('command.title')}
          placeholder={placeholder ?? t('command.placeholder')}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            const last = ordered.length - 1;
            if (event.key === 'ArrowDown') setActive(current >= last ? 0 : current + 1);
            else if (event.key === 'ArrowUp') setActive(current <= 0 ? last : current - 1);
            else if (event.key === 'Home' && event.ctrlKey) setActive(0);
            else if (event.key === 'End' && event.ctrlKey) setActive(last);
            else if (event.key === 'Enter') run(ordered[current]);
            else return;
            event.preventDefault();
          }}
        />
      </div>
      <div
        ref={listRef}
        id={`${id}-list`}
        role="listbox"
        aria-label={t('command.title')}
        className="trui-command-palette__list"
      >
        {groups.map(([group, list], g) => {
          const items = list.map((command) => {
            index += 1;
            const i = index;
            return (
              // biome-ignore lint/a11y/useKeyWithClickEvents: the input above moves through the options by keyboard
              // biome-ignore lint/a11y/useFocusableInteractive: options are reached through aria-activedescendant
              <div
                key={command.key}
                id={optionId(i)}
                role="option"
                aria-selected={i === current}
                aria-disabled={command.disabled || undefined}
                className={cx(
                  'trui-command-palette__option',
                  i === current && 'trui-command-palette__option--active',
                )}
                onMouseMove={() => {
                  if (i !== current) setActive(i);
                }}
                onClick={() => run(command)}
              >
                {command.icon && (
                  <Icon icon={command.icon} size="m" className="trui-command-palette__icon" />
                )}
                <span className="trui-command-palette__text">
                  <span className="trui-command-palette__label">{command.label}</span>
                  {command.description !== undefined && (
                    <span className="trui-command-palette__description">{command.description}</span>
                  )}
                </span>
                {command.shortcut !== undefined && (
                  <kbd className="trui-command-palette__shortcut">{command.shortcut}</kbd>
                )}
              </div>
            );
          });
          return group ? (
            // biome-ignore lint/a11y/useSemanticElements: a group of options inside a listbox, which a fieldset cannot be
            <div
              key={group}
              role="group"
              aria-labelledby={`${id}-group-${g}`}
              className="trui-command-palette__group"
            >
              <div id={`${id}-group-${g}`} className="trui-command-palette__group-title">
                {group}
              </div>
              {items}
            </div>
          ) : (
            items
          );
        })}
      </div>
      {ordered.length === 0 && (
        <div className="trui-command-palette__empty">{t('command.noResults')}</div>
      )}
      <div className="trui-visually-hidden" role="status">
        {query ? t('command.count', { count: ordered.length }) : ''}
      </div>
    </Dialog>
  );
}
