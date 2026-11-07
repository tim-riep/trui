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

import type { ListItem } from '@tim-riep/trui/core';

/** Static sample data for the catalog. */
export const countries: ListItem[] = [
  { value: 'AT', label: 'Austria' },
  { value: 'BE', label: 'Belgium' },
  { value: 'CH', label: 'Switzerland' },
  { value: 'DE', label: 'Germany' },
  { value: 'DK', label: 'Denmark' },
  { value: 'ES', label: 'Spain' },
  { value: 'FR', label: 'France' },
  { value: 'IT', label: 'Italy' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'PL', label: 'Poland' },
  { value: 'SE', label: 'Sweden' },
];

export const suppliers: ListItem[] = Array.from({ length: 57 }, (_, i) => ({
  value: `S${String(1000 + i)}`,
  label: [
    'Acme Corp',
    'Brightline Supplies',
    'Calder Logistics',
    'Delta Components',
    'Evergreen Paper',
  ][i % 5]!,
  description: `S${String(1000 + i)} · ${['Hamburg', 'Lyon', 'Milan', 'Utrecht', 'Graz'][i % 5]}`,
}));

/** Searches the suppliers like a server would, with a short delay. */
export function searchSuppliers({
  query,
  offset,
  limit,
  signal,
}: {
  query: string;
  offset: number;
  limit: number;
  signal: AbortSignal;
}) {
  return new Promise<{ items: ListItem[]; total: number }>((resolve, reject) => {
    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const hits = suppliers.filter(
        (s) => s.label.toLowerCase().includes(q) || s.value.toLowerCase().includes(q),
      );
      resolve({ items: hits.slice(offset, offset + limit), total: hits.length });
    }, 150);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

/** Loads countries matching a query, like a server would. */
export function loadCountries(query: string, signal: AbortSignal) {
  return new Promise<ListItem[]>((resolve, reject) => {
    const timer = setTimeout(() => {
      resolve(countries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())));
    }, 150);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

/** A purchase order of the samples. */
export interface Order {
  id: string;
  supplier: string;
  city: string;
  /** Exact decimal. */
  amount: string;
  currency: string;
  /** `YYYY-MM-DD`. */
  date: string;
  status: 'open' | 'released' | 'delivered' | 'blocked';
  quantity: string;
}

const orderStatuses: Order['status'][] = ['open', 'released', 'delivered', 'blocked'];

/** `count` purchase orders, the same on every call. */
export function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const supplier = suppliers[i % suppliers.length]!;
    const cents = ((i * 7919) % 2_000_000) + 1999;
    const day = (i % 28) + 1;
    return {
      id: String(4500010000 + i),
      supplier: supplier.label,
      city: supplier.description!.split(' · ')[1]!,
      amount: `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2, '0')}`,
      currency: 'EUR',
      date: `2026-${String((i % 12) + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      status: orderStatuses[i % 4]!,
      quantity: String((i % 40) + 1),
    };
  });
}
