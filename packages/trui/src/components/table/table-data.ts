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

import { compareDecimal, isDecimal } from '@tim-riep/trui/core';
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Sorting of a table by one column. */
export interface TableSort {
  column: string;
  direction: 'ascending' | 'descending';
}

/** A request for a page of rows. */
export interface TablePageRequest {
  offset: number;
  limit: number;
  sort: TableSort | null;
  /** Aborted when the sorting changes or the table unmounts. */
  signal: AbortSignal;
}

/** A page of rows and the number of all rows. */
export interface TablePage<T> {
  rows: readonly T[];
  total: number;
}

/** A column of a table. */
export interface TableColumn<T> {
  /** Identifies the column; also the default property of the row it shows. */
  key: string;
  /** Text of the column header. */
  header: string;
  /** Content of a cell; by default the property `key` of the row as text. */
  renderCell?: (row: T, rowIndex: number) => ReactNode;
  /** Value to sort by; by default the property `key` of the row. */
  sortValue?: (row: T) => unknown;
  /** Compares two rows for sorting; by default the sort values. */
  compare?: (a: T, b: T) => number;
  /** Alignment of header and cells; `end` for numbers and amounts. */
  align?: 'start' | 'center' | 'end';
  /** Width in pixels; 160 by default. */
  width?: number;
  /** Smallest width in pixels when resized; 48 by default. */
  minWidth?: number;
  sortable?: boolean;
  /** Lets the user change the width. On by default. */
  resizable?: boolean;
}

function propertyOf(row: unknown, key: string): unknown {
  return row !== null && typeof row === 'object'
    ? (row as Record<string, unknown>)[key]
    : undefined;
}

/** The value a cell shows or sorts by, when the column defines none. */
export function cellValue<T>(row: T, column: TableColumn<T>): unknown {
  return propertyOf(row, column.key);
}

/**
 * Compares two values for sorting: numbers numerically, canonical decimal
 * strings exactly, other values as text in the order of the locale with
 * numbers in text compared by value. Empty values come last.
 */
export function compareValues(a: unknown, b: unknown, collator: Intl.Collator): number {
  const empty = (v: unknown) => v === null || v === undefined || v === '';
  if (empty(a) || empty(b)) return empty(a) === empty(b) ? 0 : empty(a) ? 1 : -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'string' && typeof b === 'string' && isDecimal(a) && isDecimal(b))
    return compareDecimal(a, b);
  return collator.compare(String(a), String(b));
}

export interface TableDataOptions<T> {
  rows: readonly T[] | undefined;
  loadPage: ((request: TablePageRequest) => Promise<TablePage<T>>) | undefined;
  pageSize: number;
  sort: TableSort | null;
  /** Sorts given rows in the table; off when the application sorts them. */
  sortLocally: boolean;
  columns: readonly TableColumn<T>[];
  locale: string;
}

/**
 * The rows of a table: given rows, sorted locally if wanted, or rows loaded
 * page by page as the visible range needs them.
 */
export function useTableData<T>({
  rows,
  loadPage,
  pageSize,
  sort,
  sortLocally,
  columns,
  locale,
}: TableDataOptions<T>) {
  const sorted = useMemo(() => {
    if (!rows) return undefined;
    if (!sortLocally || !sort) return rows;
    const column = columns.find((c) => c.key === sort.column);
    if (!column) return rows;
    const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
    const factor = sort.direction === 'ascending' ? 1 : -1;
    const value = column.sortValue ?? ((row: T) => cellValue(row, column));
    return [...rows].sort(
      (a, b) =>
        factor *
        (column.compare ? column.compare(a, b) : compareValues(value(a), value(b), collator)),
    );
  }, [rows, sortLocally, sort, columns, locale]);

  // Pages loaded with loadPage, by page index; reset when the sorting changes.
  const [pages, setPages] = useState<ReadonlyMap<number, readonly T[]>>(new Map());
  const [total, setTotal] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);
  const requested = useRef(new Set<number>());
  const controller = useRef<AbortController | null>(null);
  const sortKey = JSON.stringify(sort);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a new sorting or loader starts over
  useEffect(() => {
    controller.current?.abort();
    controller.current = new AbortController();
    requested.current = new Set();
    setPages(new Map());
    setTotal(null);
    setFailed(false);
    return () => controller.current?.abort();
  }, [loadPage, sortKey, pageSize]);

  const ensure = useCallback(
    (first: number, last: number) => {
      if (!loadPage || !controller.current) return;
      const signal = controller.current.signal;
      for (
        let page = Math.floor(first / pageSize);
        page <= Math.floor(Math.max(last, 0) / pageSize);
        page++
      ) {
        if (requested.current.has(page)) continue;
        requested.current.add(page);
        loadPage({ offset: page * pageSize, limit: pageSize, sort, signal }).then(
          (result) => {
            if (signal.aborted) return;
            setTotal(result.total);
            setPages((before) => new Map(before).set(page, result.rows));
          },
          () => {
            if (signal.aborted) return;
            requested.current.delete(page);
            setFailed(true);
          },
        );
      }
    },
    [loadPage, pageSize, sort],
  );

  const rowAt = (index: number): T | undefined => {
    if (sorted) return sorted[index];
    return pages.get(Math.floor(index / pageSize))?.[index % pageSize];
  };

  const loadedRows = useMemo(() => (sorted ? sorted : [...pages.values()].flat()), [sorted, pages]);

  return {
    total: sorted ? sorted.length : (total ?? 0),
    /** True until the first page of loaded rows arrived. */
    initialLoading: !sorted && total === null && !failed,
    failed,
    rowAt,
    ensure,
    loadedRows,
  };
}
