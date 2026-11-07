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

import { type ListItem, useLocale, useText } from '@tim-riep/trui/core';
import { useEffect, useId, useRef, useState } from 'react';
import { searchIcon } from '../../icons/set/search';
import { cx } from '../../internal/class-names';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { Dialog } from '../dialog/Dialog';
import { Icon } from '../icon/Icon';
import { Spinner } from '../spinner/Spinner';
import { TextField } from '../text-field/TextField';

/** A request for one page of results of a value help. */
export interface LookupRequest {
  query: string;
  offset: number;
  limit: number;
  /** Aborted when the query changes or the dialog closes. */
  signal: AbortSignal;
}

/** One page of results and the number of all matches. */
export interface LookupPage {
  items: readonly ListItem[];
  total: number;
}

/** Loads a page of results for a value help, e.g. from a server. */
export type FetchLookupItems = (request: LookupRequest) => Promise<LookupPage>;

/** Props of {@link LookupDialog}. */
export interface LookupDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called with the picked items; the dialog does not close by itself. */
  onConfirm: (items: ListItem[]) => void;
  fetchItems: FetchLookupItems;
  /** Allows picking several items, confirmed with OK. */
  multiple?: boolean;
  /** Values that are selected when the dialog opens (with `multiple`). */
  selected?: readonly string[];
  /** Title; "Select a value" by default. */
  title?: string;
  /** Text the search starts with. */
  initialQuery?: string;
  /** Results per page; 20 by default. */
  pageSize?: number;
  /** Milliseconds to wait after typing before searching; 300 by default. */
  debounce?: number;
}

/**
 * A dialog to search and pick values. It knows no backend: `fetchItems`
 * delivers the results page by page.
 */
export function LookupDialog({
  open,
  onClose,
  onConfirm,
  fetchItems,
  multiple = false,
  selected = [],
  title,
  initialQuery = '',
  pageSize = 20,
  debounce = 300,
}: LookupDialogProps) {
  const t = useText();
  const { locale } = useLocale();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<readonly ListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [picked, setPicked] = useState<Map<string, ListItem>>(new Map());
  const [page, setPage] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const countId = useId();

  // biome-ignore lint/correctness/useExhaustiveDependencies: resets only when the dialog opens
  useEffect(() => {
    if (!open) return;
    setQuery(initialQuery);
    setPage(0);
    setPicked(new Map(selected.map((v) => [v, { value: v, label: v }])));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(
      () => {
        fetchItems({
          query,
          offset: page * pageSize,
          limit: pageSize,
          signal: controller.signal,
        }).then(
          (result) => {
            if (controller.signal.aborted) return;
            setResults((before) => (page === 0 ? result.items : [...before, ...result.items]));
            setTotal(result.total);
            setLoading(false);
          },
          () => {
            if (!controller.signal.aborted) setLoading(false);
          },
        );
      },
      page === 0 ? debounce : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [open, query, page, pageSize, debounce, fetchItems]);

  const toggle = (item: ListItem) => {
    const next = new Map(picked);
    if (next.has(item.value)) next.delete(item.value);
    else next.set(item.value, item);
    setPicked(next);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title ?? t('lookup.title')}
      size="m"
      initialFocus={searchRef}
      className="trui-lookup-dialog"
      footer={
        multiple ? (
          <>
            <Button variant="primary" onClick={() => onConfirm([...picked.values()])}>
              {t('common.ok')}
            </Button>
            <Button onClick={onClose}>{t('common.cancel')}</Button>
          </>
        ) : (
          <Button onClick={onClose}>{t('common.cancel')}</Button>
        )
      }
    >
      <div className="trui-lookup-dialog__body">
        <TextField
          ref={searchRef}
          type="search"
          aria-label={t('lookup.search')}
          aria-describedby={countId}
          placeholder={t('lookup.search')}
          value={query}
          onChange={(q) => {
            setQuery(q);
            setPage(0);
          }}
          startContent={<Icon icon={searchIcon} size="s" />}
        />
        <div id={countId} className="trui-lookup-dialog__count" aria-live="polite">
          {loading && page === 0 ? <Spinner size="s" /> : t('lookup.results', { count: total })}
        </div>
        <ul className="trui-lookup-dialog__results" aria-busy={loading || undefined}>
          {results.map((item) => (
            <li key={item.value} className="trui-lookup-dialog__result">
              {multiple ? (
                <Checkbox
                  checked={picked.has(item.value)}
                  disabled={item.disabled}
                  onChange={() => toggle(item)}
                  className="trui-lookup-dialog__check"
                >
                  <span className="trui-lookup-dialog__label">{item.label}</span>
                  {item.description && (
                    <span className="trui-lookup-dialog__description">{item.description}</span>
                  )}
                </Checkbox>
              ) : (
                <button
                  type="button"
                  className={cx('trui-lookup-dialog__pick')}
                  disabled={item.disabled}
                  onClick={() => onConfirm([item])}
                >
                  <span className="trui-lookup-dialog__label">{item.label}</span>
                  {item.description && (
                    <span className="trui-lookup-dialog__description">{item.description}</span>
                  )}
                </button>
              )}
            </li>
          ))}
        </ul>
        {results.length < total && (
          <Button variant="text" loading={loading && page > 0} onClick={() => setPage(page + 1)}>
            {t('lookup.loadMore')} ({new Intl.NumberFormat(locale).format(total - results.length)})
          </Button>
        )}
      </div>
    </Dialog>
  );
}
