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

import { type ListItem, type LoadItems, useLocale } from '@tim-riep/trui/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import { filterItems } from './navigation';

export interface ItemSourceOptions {
  /** Fixed options, filtered by the query. */
  items?: readonly ListItem[] | undefined;
  /** Loads options for the query; takes precedence over `items`. */
  loadItems?: LoadItems | undefined;
  query: string;
  /** Loads only while the list is open. */
  active: boolean;
  /** Milliseconds to wait after typing before loading. */
  debounce: number;
}

/**
 * The options for a query: filtered fixed options, or options loaded with a
 * delay after typing. A new query aborts the request of the previous one.
 * Remembers the labels of all options seen, to show the label of a value.
 */
export function useItemSource({ items, loadItems, query, active, debounce }: ItemSourceOptions) {
  const { locale } = useLocale();
  const [loaded, setLoaded] = useState<readonly ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const labels = useRef(new Map<string, string>());

  useEffect(() => {
    if (!loadItems || !active) return;
    const controller = new AbortController();
    setLoading(true);
    setFailed(false);
    const timer = setTimeout(() => {
      loadItems(query, controller.signal).then(
        (result) => {
          if (controller.signal.aborted) return;
          setLoaded(result);
          setLoading(false);
        },
        (error: unknown) => {
          if (
            controller.signal.aborted ||
            (error instanceof DOMException && error.name === 'AbortError')
          )
            return;
          setLoaded([]);
          setLoading(false);
          setFailed(true);
        },
      );
    }, debounce);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadItems, query, active, debounce]);

  const shown = useMemo(
    () => (loadItems ? loaded : filterItems(items ?? [], query, locale)),
    [loadItems, loaded, items, query, locale],
  );
  for (const item of items ?? []) labels.current.set(item.value, item.label);
  for (const item of shown) labels.current.set(item.value, item.label);

  return {
    items: shown,
    loading: loadItems !== undefined && loading,
    failed,
    /** The label of a value, if an option with it was seen. */
    labelOf: (value: string) => labels.current.get(value),
    remember: (item: ListItem) => labels.current.set(item.value, item.label),
  };
}
