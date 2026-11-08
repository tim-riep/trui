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

import { useControllableState, useLocale, useText } from '@tim-riep/trui/core';
import {
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { moreVerticalIcon } from '../../icons/set/more-vertical';
import { sortAscendingIcon } from '../../icons/set/sort-ascending';
import { sortDescendingIcon } from '../../icons/set/sort-descending';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';
import type { MenuItem } from '../menu/Menu';
import { MenuButton } from '../menu/MenuButton';
import { Spinner } from '../spinner/Spinner';
import {
  cellValue,
  type TableColumn,
  type TablePage,
  type TablePageRequest,
  type TableSort,
  useTableData,
} from './table-data';

/** Props of {@link Table}. */
export interface TableProps<T> {
  columns: readonly TableColumn<T>[];
  /** All rows. Without `loadPage` they are sorted in the table unless `manualSort` is set. */
  rows?: readonly T[];
  /** Loads rows page by page as they scroll into view, e.g. from a server. */
  loadPage?: (request: TablePageRequest) => Promise<TablePage<T>>;
  /** Rows per page of `loadPage`; 50 by default. */
  pageSize?: number;
  /** A unique key of a row, used for selection. */
  getRowKey: (row: T) => string;
  sort?: TableSort | null;
  defaultSort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  /** Leaves sorting of given rows to the application, which reacts to `onSortChange`. */
  manualSort?: boolean;
  selectionMode?: 'none' | 'single' | 'multiple';
  selectedKeys?: ReadonlySet<string>;
  defaultSelectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (keys: ReadonlySet<string>) => void;
  /** Called when a row is chosen by click or Enter, e.g. to open its detail. */
  onRowPress?: (row: T) => void;
  /** Actions of a row, shown in a menu at its end. */
  rowActions?: (row: T) => readonly MenuItem[];
  onRowAction?: (key: string, row: T) => void;
  /** Shows that rows are being loaded or changed. */
  loading?: boolean;
  /** Content without rows; "No data" by default. */
  renderEmpty?: () => ReactNode;
  /** Called when the user changes the width of a column. */
  onColumnResize?: (key: string, width: number) => void;
  /** Height of the table, e.g. `400` or `'100%'`. It needs a height to scroll and render only visible rows. */
  height?: number | string;
  /** Name of the table for assistive technology. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
  style?: CSSProperties;
  ref?: Ref<HTMLDivElement>;
}

interface Cell {
  /** Row index, -1 for the header. */
  row: number;
  col: number;
}

const selectKey = '\u0000select';
const actionsKey = '\u0000actions';
const overscan = 8;
const cellControls =
  'input:not([type="hidden"]):not(:disabled), select:not(:disabled), textarea:not(:disabled), button:not(:disabled), a[href], [contenteditable="true"]';

/**
 * A table of data with sorting, selection, row actions, resizable columns
 * and rows that are rendered only while visible, so that it handles large
 * numbers of rows. Rows are given as array or loaded page by page. Cells
 * show any content through `renderCell`, also inputs for editing.
 *
 * Keyboard: Tab moves to the table and out of it; arrow keys move between
 * cells, Home and End to the first and last cell of a row, Ctrl+Home and
 * Ctrl+End to the first and last row, Page Up and Page Down by a screen.
 * Enter sorts in a header cell, chooses a row, or moves into the controls of
 * a cell (also F2); Escape returns to the cell. Space selects a row.
 * Alt+Arrow Left and Right change the width of a column in its header.
 */
export function Table<T>({
  columns,
  rows,
  loadPage,
  pageSize = 50,
  getRowKey,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  manualSort = false,
  selectionMode = 'none',
  selectedKeys,
  defaultSelectedKeys,
  onSelectionChange,
  onRowPress,
  rowActions,
  onRowAction,
  loading = false,
  renderEmpty,
  onColumnResize,
  height,
  className,
  style,
  ref,
  ...aria
}: TableProps<T>) {
  const t = useText();
  const { locale, dir } = useLocale();
  const [sort, setSort] = useControllableState<TableSort | null>(
    sortProp,
    defaultSort,
    onSortChange,
  );
  const [selected, setSelected] = useControllableState<ReadonlySet<string>>(
    selectedKeys,
    () => defaultSelectedKeys ?? new Set(),
    onSelectionChange,
  );
  const data = useTableData({
    rows,
    loadPage,
    pageSize,
    sort,
    sortLocally: !manualSort,
    columns,
    locale,
  });

  // Columns as shown, with the selection and action columns.
  const shown: TableColumn<T>[] = [
    ...(selectionMode === 'multiple'
      ? [
          {
            key: selectKey,
            header: t('table.selectAll'),
            width: 44,
            resizable: false,
            align: 'center' as const,
          },
        ]
      : []),
    ...columns,
    ...(rowActions
      ? [
          {
            key: actionsKey,
            header: t('table.rowActions'),
            width: 56,
            resizable: false,
            align: 'center' as const,
          },
        ]
      : []),
  ];
  const [widths, setWidths] = useState<Record<string, number>>({});
  const widthOf = (column: TableColumn<T>) => widths[column.key] ?? column.width ?? 160;

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current!, []);

  // Rows are rendered only in the visible range; all rows have one height.
  const [rowHeight, setRowHeight] = useState(32);
  const [viewport, setViewport] = useState({ top: 0, height: 600 });
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const measure = () => {
      const h = Number.parseFloat(getComputedStyle(scroller).getPropertyValue('--trui-row-height'));
      if (h > 0) setRowHeight(h);
      setViewport({ top: scroller.scrollTop, height: scroller.clientHeight || 600 });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, []);
  const total = data.total;
  const first = Math.max(0, Math.floor(viewport.top / rowHeight) - overscan);
  const last = Math.min(
    total - 1,
    Math.ceil((viewport.top + viewport.height) / rowHeight) + overscan,
  );
  const pageRows = Math.max(1, Math.floor(viewport.height / rowHeight) - 1);

  useEffect(() => {
    data.ensure(first, data.initialLoading ? pageSize - 1 : last);
  }, [data.ensure, data.initialLoading, first, last, pageSize]);

  // Keyboard focus: one cell is reachable with Tab.
  const [active, setActive] = useState<Cell>({ row: -1, col: 0 });
  const focusPending = useRef(false);
  const cellId = (cell: Cell) => `${cell.row}:${cell.col}`;
  const clampCell = (cell: Cell): Cell => ({
    row: Math.max(-1, Math.min(cell.row, total - 1)),
    col: Math.max(0, Math.min(cell.col, shown.length - 1)),
  });
  const moveTo = (cell: Cell) => {
    const next = clampCell(cell);
    const scroller = scrollerRef.current;
    if (scroller && next.row >= 0) {
      const top = next.row * rowHeight;
      const header = scroller.querySelector('thead')?.getBoundingClientRect().height ?? rowHeight;
      if (top < scroller.scrollTop) scroller.scrollTop = top;
      else if (top + rowHeight > scroller.scrollTop + scroller.clientHeight - header) {
        scroller.scrollTop = top + rowHeight - scroller.clientHeight + header;
      }
      setViewport({ top: scroller.scrollTop, height: scroller.clientHeight || viewport.height });
    }
    focusPending.current = true;
    setActive(next);
  };
  useEffect(() => {
    if (!focusPending.current) return;
    const el = rootRef.current?.querySelector<HTMLElement>(`[data-cell="${cellId(active)}"]`);
    if (el) {
      focusPending.current = false;
      el.focus({ preventScroll: true });
      // A browser may move focus again when the cell that had it is no longer
      // rendered; the target takes it back in the next frame.
      requestAnimationFrame(() => {
        if (
          el.isConnected &&
          document.activeElement !== el &&
          !el.contains(document.activeElement)
        ) {
          el.focus({ preventScroll: true });
        }
      });
    }
  });

  const selectable = selectionMode !== 'none';
  const toggleRow = (key: string, range?: { from: number; to: number }) => {
    if (selectionMode === 'single') {
      setSelected(new Set(selected.has(key) ? [] : [key]));
      return;
    }
    const next = new Set(selected);
    if (range) {
      const [a, b] = range.from < range.to ? [range.from, range.to] : [range.to, range.from];
      for (let i = a; i <= b; i++) {
        const row = data.rowAt(i);
        if (row !== undefined) next.add(getRowKey(row));
      }
    } else if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };
  const lastToggled = useRef<number | null>(null);
  const allKeys = data.loadedRows.map(getRowKey);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selected.has(k));
  const someSelected = !allSelected && allKeys.some((k) => selected.has(k));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set([...selected, ...allKeys]));

  const toggleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;
    if (sort?.column !== column.key) setSort({ column: column.key, direction: 'ascending' });
    else if (sort.direction === 'ascending')
      setSort({ column: column.key, direction: 'descending' });
    else setSort(null);
  };

  const resize = (column: TableColumn<T>, width: number) => {
    const w = Math.max(column.minWidth ?? 48, Math.round(width));
    setWidths((before) => ({ ...before, [column.key]: w }));
    onColumnResize?.(column.key, w);
  };
  const startResize = (event: PointerEvent<HTMLDivElement>, column: TableColumn<T>) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = widthOf(column);
    const sign = dir === 'rtl' ? -1 : 1;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);
    const onMove = (e: globalThis.PointerEvent) =>
      resize(column, startWidth + sign * (e.clientX - startX));
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const cellEl = (event.target as HTMLElement).closest<HTMLElement>('[data-cell]');
    if (!cellEl) return;
    // Inside the controls of a cell, the keys belong to them; Escape leaves.
    if (event.target !== cellEl) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        cellEl.focus();
      }
      return;
    }
    const [r, c] = cellEl.dataset.cell!.split(':').map(Number) as [number, number];
    const forward = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const column = shown[c]!;
    if (
      event.altKey &&
      r === -1 &&
      (event.key === forward || event.key === back) &&
      column.resizable !== false
    ) {
      event.preventDefault();
      resize(column, widthOf(column) + (event.key === forward ? 16 : -16));
      return;
    }
    const ctrl = event.ctrlKey || event.metaKey;
    const targetOf = (key: string): Cell | null => {
      if (key === forward) return { row: r, col: c + 1 };
      if (key === back) return { row: r, col: c - 1 };
      switch (key) {
        case 'ArrowDown':
          return { row: r + 1, col: c };
        case 'ArrowUp':
          return { row: r - 1, col: c };
        case 'Home':
          return ctrl ? { row: r === -1 ? -1 : 0, col: c } : { row: r, col: 0 };
        case 'End':
          return ctrl ? { row: total - 1, col: c } : { row: r, col: shown.length - 1 };
        case 'PageDown':
          return { row: r + pageRows, col: c };
        case 'PageUp':
          return { row: Math.max(r === -1 ? -1 : 0, r - pageRows), col: c };
        default:
          return null;
      }
    };
    const target = targetOf(event.key);
    if (target) {
      event.preventDefault();
      moveTo(target);
      return;
    }
    const row = r >= 0 ? data.rowAt(r) : undefined;
    if (event.key === 'Enter' || event.key === 'F2') {
      // Controls in cells are out of the tab order, as in any grid; find them all.
      const control = cellEl.querySelector<HTMLElement>(cellControls);
      if (control) {
        event.preventDefault();
        control.focus();
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (r === -1) toggleSort(column);
        else if (row !== undefined) onRowPress?.(row);
      }
      return;
    }
    if (event.key === ' ' && row !== undefined && selectable) {
      event.preventDefault();
      toggleRow(getRowKey(row));
      lastToggled.current = r;
    }
  };

  const tableWidth = shown.reduce((sum, c) => sum + widthOf(c), 0);
  const empty = !data.initialLoading && total === 0;
  const busy = loading || data.initialLoading;

  const renderCell = (column: TableColumn<T>, row: T, index: number) => {
    if (column.key === selectKey) {
      const key = getRowKey(row);
      return (
        <input
          type="checkbox"
          className="trui-table__check"
          tabIndex={-1}
          checked={selected.has(key)}
          aria-label={t('table.selectRow')}
          onClick={(e: MouseEvent<HTMLInputElement>) => {
            e.stopPropagation();
            const range =
              e.shiftKey && lastToggled.current !== null
                ? { from: lastToggled.current, to: index }
                : undefined;
            toggleRow(key, range);
            lastToggled.current = index;
          }}
          onChange={() => undefined}
        />
      );
    }
    if (column.key === actionsKey && rowActions) {
      return (
        <MenuButton
          variant="text"
          icon={moreVerticalIcon}
          aria-label={t('table.rowActions')}
          tabIndex={-1}
          items={rowActions(row)}
          onAction={(key) => onRowAction?.(key, row)}
        />
      );
    }
    if (column.renderCell) return column.renderCell(row, index);
    const value = cellValue(row, column);
    return value === null || value === undefined ? '' : String(value);
  };

  const renderedRows: ReactNode[] = [];
  for (let i = first; i <= last; i++) {
    const row = data.rowAt(i);
    if (row === undefined) {
      renderedRows.push(
        <tr
          key={`placeholder-${i}`}
          aria-rowindex={i + 2}
          aria-busy="true"
          className="trui-table__row trui-table__row--placeholder"
        >
          {shown.map((column, c) => (
            <td
              key={column.key}
              data-cell={cellId({ row: i, col: c })}
              tabIndex={active.row === i && active.col === c ? 0 : -1}
              className="trui-table__cell"
            >
              <span className="trui-table__skeleton" aria-hidden="true" />
              {c === 0 && <span className="trui-visually-hidden">{t('table.loadingRow')}</span>}
            </td>
          ))}
        </tr>,
      );
      continue;
    }
    const key = getRowKey(row);
    const isSelected = selected.has(key);
    renderedRows.push(
      <tr
        key={key}
        aria-rowindex={i + 2}
        aria-selected={selectable ? isSelected : undefined}
        className={cx(
          'trui-table__row',
          isSelected && 'trui-table__row--selected',
          (onRowPress || selectionMode === 'single') && 'trui-table__row--interactive',
        )}
        onClick={(e) => {
          if (
            (e.target as HTMLElement).closest(
              'button, a, input, select, textarea, [role="combobox"]',
            )
          )
            return;
          if (selectionMode === 'single') toggleRow(key);
          onRowPress?.(row);
        }}
      >
        {shown.map((column, c) => (
          <td
            key={column.key}
            data-cell={cellId({ row: i, col: c })}
            tabIndex={active.row === i && active.col === c ? 0 : -1}
            className={cx('trui-table__cell', column.align && `trui-table__cell--${column.align}`)}
            onFocus={(e) => {
              if (e.target === e.currentTarget) setActive({ row: i, col: c });
            }}
          >
            {renderCell(column, row, i)}
          </td>
        ))}
      </tr>,
    );
  }

  return (
    <div
      ref={rootRef}
      className={cx('trui-table', className)}
      style={{ ...style, ...(height !== undefined ? { height } : {}) }}
    >
      <div
        ref={scrollerRef}
        className="trui-table__scroller"
        onScroll={(e) =>
          setViewport({ top: e.currentTarget.scrollTop, height: e.currentTarget.clientHeight })
        }
      >
        <table
          // biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: a table as grid is the pattern for interactive tables
          role="grid"
          className="trui-table__grid"
          style={{ width: tableWidth }}
          aria-rowcount={empty ? 2 : total + 1}
          aria-colcount={shown.length}
          aria-multiselectable={selectionMode === 'multiple' || undefined}
          aria-busy={busy || undefined}
          onKeyDown={onKeyDown}
          {...aria}
        >
          <colgroup>
            {shown.map((column) => (
              <col key={column.key} style={{ width: widthOf(column) }} />
            ))}
          </colgroup>
          <thead>
            <tr aria-rowindex={1}>
              {shown.map((column, c) => {
                const sorted = sort?.column === column.key ? sort.direction : undefined;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    data-cell={cellId({ row: -1, col: c })}
                    tabIndex={active.row === -1 && active.col === c ? 0 : -1}
                    aria-sort={column.sortable ? (sorted ?? 'none') : undefined}
                    className={cx(
                      'trui-table__header',
                      column.align && `trui-table__cell--${column.align}`,
                      column.sortable && 'trui-table__header--sortable',
                    )}
                    onClick={() => toggleSort(column)}
                    onFocus={(e) => {
                      if (e.target === e.currentTarget) setActive({ row: -1, col: c });
                    }}
                  >
                    {column.key === selectKey ? (
                      <input
                        type="checkbox"
                        className="trui-table__check"
                        tabIndex={-1}
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected;
                        }}
                        aria-label={t('table.selectAll')}
                        onChange={toggleAll}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : column.key === actionsKey ? (
                      <span className="trui-visually-hidden">{column.header}</span>
                    ) : (
                      <span className="trui-table__header-content">
                        <span className="trui-table__header-text">{column.header}</span>
                        {sorted && (
                          <Icon
                            icon={sorted === 'ascending' ? sortAscendingIcon : sortDescendingIcon}
                            size="s"
                          />
                        )}
                      </span>
                    )}
                    {column.resizable !== false && (
                      <div
                        className="trui-table__resize"
                        aria-hidden="true"
                        title={t('table.resizeColumn', { column: column.header })}
                        onPointerDown={(e) => startResize(e, column)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {empty ? (
              <tr aria-rowindex={2}>
                <td
                  colSpan={shown.length}
                  className="trui-table__empty"
                  data-cell={cellId({ row: 0, col: 0 })}
                >
                  {renderEmpty?.() ?? t('common.noData')}
                </td>
              </tr>
            ) : (
              <>
                {first > 0 && (
                  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: spacer rows hold the height of rows not rendered and contain nothing
                  <tr aria-hidden="true" className="trui-table__spacer">
                    <td colSpan={shown.length} style={{ height: first * rowHeight }} />
                  </tr>
                )}
                {renderedRows}
                {last < total - 1 && (
                  // biome-ignore lint/a11y/noAriaHiddenOnFocusable: spacer rows hold the height of rows not rendered and contain nothing
                  <tr aria-hidden="true" className="trui-table__spacer">
                    <td colSpan={shown.length} style={{ height: (total - 1 - last) * rowHeight }} />
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      {busy && (
        <div className="trui-table__busy">
          <Spinner />
        </div>
      )}
    </div>
  );
}
