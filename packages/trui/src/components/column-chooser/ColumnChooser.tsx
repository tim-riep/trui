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
import { type Ref, useImperativeHandle, useRef, useState } from 'react';
import { columnsIcon } from '../../icons/set/columns';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Popover } from '../popover/Popover';

/** A column the user can show or hide. */
export interface ChoosableColumn {
  key: string;
  header: string;
}

/** Props of {@link ColumnChooser}. */
export interface ColumnChooserProps {
  /** The columns in their order, e.g. the columns of a table. */
  columns: readonly ChoosableColumn[];
  /** Keys of the hidden columns. */
  hiddenColumns: ReadonlySet<string>;
  onHiddenColumnsChange: (hiddenColumns: ReadonlySet<string>) => void;
  /** Shows only the icon; the text stays the name of the button. */
  iconOnly?: boolean;
  className?: string;
  ref?: Ref<HTMLButtonElement>;
}

/**
 * A button that opens a list of columns to show or hide, e.g. for the
 * `hiddenColumns` of a table. The last shown column cannot be hidden.
 *
 * Keyboard: Enter or Space opens the list; Tab moves between the columns,
 * Space toggles one, Escape closes the list.
 */
export function ColumnChooser({
  columns,
  hiddenColumns,
  onHiddenColumnsChange,
  iconOnly = false,
  className,
  ref,
}: ColumnChooserProps) {
  const t = useText();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useImperativeHandle(ref, () => buttonRef.current!, []);
  const shownCount = columns.filter((c) => !hiddenColumns.has(c.key)).length;
  const label = t('table.columns');
  return (
    <>
      <Button
        ref={buttonRef}
        icon={columnsIcon}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
        onClick={() => setOpen(!open)}
        {...(iconOnly ? { 'aria-label': label } : {})}
      >
        {iconOnly ? undefined : label}
      </Button>
      <Popover
        anchor={buttonRef}
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        placement="bottom-end"
      >
        <div className="trui-column-chooser">
          {columns.map((column) => {
            const shown = !hiddenColumns.has(column.key);
            return (
              <Checkbox
                key={column.key}
                checked={shown}
                disabled={shown && shownCount === 1}
                onChange={(checked) => {
                  const next = new Set(hiddenColumns);
                  if (checked) next.delete(column.key);
                  else next.add(column.key);
                  onHiddenColumnsChange(next);
                }}
              >
                {column.header}
              </Checkbox>
            );
          })}
        </div>
      </Popover>
    </>
  );
}
