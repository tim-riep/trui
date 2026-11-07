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

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/** Meaning of a message, shown by color and icon. */
export type FeedbackTone = 'information' | 'success' | 'warning' | 'error';

/** A short message that appears for a while and disappears by itself. */
export interface ToastOptions {
  message: ReactNode;
  tone?: FeedbackTone;
  /** One action, e.g. "Undo". */
  action?: { label: string; onAction: () => void };
  /** Milliseconds until it disappears; `null` keeps it until dismissed. 5000 by default, errors stay. */
  duration?: number | null;
}

/** A toast in the queue. */
export interface ToastEntry extends ToastOptions {
  id: string;
}

/** A message in a modal dialog that needs an answer. */
export interface MessageDialogOptions {
  title: ReactNode;
  message: ReactNode;
  tone?: FeedbackTone;
  /** Label of the confirming button; "OK" by default. */
  confirmLabel?: string;
  /** Label of the cancelling button of a confirmation; "Cancel" by default. */
  cancelLabel?: string;
  /** Shows the confirming button as destructive, e.g. for deleting. */
  danger?: boolean;
}

/** A message dialog in the queue. */
export interface MessageDialogEntry extends MessageDialogOptions {
  id: string;
  /** `confirm` asks yes or no; `alert` only informs. */
  kind: 'alert' | 'confirm';
  resolve: (confirmed: boolean) => void;
}

/** The queue of toasts and message dialogs of an application. */
export interface FeedbackState {
  toasts: readonly ToastEntry[];
  dialogs: readonly MessageDialogEntry[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  openDialog: (kind: 'alert' | 'confirm', options: MessageDialogOptions) => Promise<boolean>;
  closeDialog: (id: string, confirmed: boolean) => void;
  /** Registers a component that shows the queue; returns the function to unregister it. */
  registerHost: () => () => void;
  hasHost: () => boolean;
}

export const FeedbackContext = createContext<FeedbackState | null>(null);
FeedbackContext.displayName = 'TruiFeedbackContext';

/**
 * Holds toasts and message dialogs. The outermost provider renders it, so
 * that code anywhere below, also loaded at runtime, uses the same queue.
 */
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<readonly ToastEntry[]>([]);
  const [dialogs, setDialogs] = useState<readonly MessageDialogEntry[]>([]);
  const counter = useRef(0);
  const hosts = useRef(0);

  const showToast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const id = `toast-${counter.current}`;
    setToasts((list) => [...list, { ...options, id }]);
    return id;
  }, []);
  const dismissToast = useCallback(
    (id: string) => setToasts((list) => list.filter((t) => t.id !== id)),
    [],
  );
  const openDialog = useCallback(
    (kind: 'alert' | 'confirm', options: MessageDialogOptions) =>
      new Promise<boolean>((resolve) => {
        counter.current += 1;
        setDialogs((list) => [
          ...list,
          { ...options, kind, resolve, id: `dialog-${counter.current}` },
        ]);
      }),
    [],
  );
  const closeDialog = useCallback((id: string, confirmed: boolean) => {
    setDialogs((list) => {
      list.find((d) => d.id === id)?.resolve(confirmed);
      return list.filter((d) => d.id !== id);
    });
  }, []);
  const registerHost = useCallback(() => {
    hosts.current += 1;
    return () => {
      hosts.current -= 1;
    };
  }, []);
  const hasHost = useCallback(() => hosts.current > 0, []);

  const value = useMemo<FeedbackState>(
    () => ({
      toasts,
      dialogs,
      showToast,
      dismissToast,
      openDialog,
      closeDialog,
      registerHost,
      hasHost,
    }),
    [toasts, dialogs, showToast, dismissToast, openDialog, closeDialog, registerHost, hasHost],
  );
  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>;
}

function useFeedback(hook: string): FeedbackState | null {
  const state = useContext(FeedbackContext);
  useEffect(() => {
    if (!state) console.warn(`[trui] ${hook} needs a TruiProvider`);
  }, [state, hook]);
  return state;
}

function warnWithoutHost(state: FeedbackState | null, hook: string) {
  if (state && !state.hasHost())
    console.warn(`[trui] ${hook}: render <FeedbackHost /> once inside the provider`);
}

/** Shows and dismisses toasts. Needs a `FeedbackHost` inside the provider. */
export function useToast(): {
  show: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
} {
  const state = useFeedback('useToast');
  return useMemo(
    () => ({
      show: (options) => {
        warnWithoutHost(state, 'useToast');
        return state?.showToast(options) ?? '';
      },
      dismiss: (id) => state?.dismissToast(id),
    }),
    [state],
  );
}

/**
 * Asks or informs with a modal message dialog and resolves when it is
 * answered: `await confirm(...)` gives true for the confirming button.
 * Needs a `FeedbackHost` inside the provider.
 */
export function useMessageDialog(): {
  confirm: (options: MessageDialogOptions) => Promise<boolean>;
  alert: (options: MessageDialogOptions) => Promise<void>;
} {
  const state = useFeedback('useMessageDialog');
  return useMemo(
    () => ({
      confirm: (options) => {
        warnWithoutHost(state, 'useMessageDialog');
        return state?.openDialog('confirm', options) ?? Promise.resolve(false);
      },
      alert: async (options) => {
        warnWithoutHost(state, 'useMessageDialog');
        await state?.openDialog('alert', options);
      },
    }),
    [state],
  );
}

/** The queue of toasts and message dialogs, for the component that shows them. */
export function useFeedbackQueue(): FeedbackState | null {
  return useContext(FeedbackContext);
}
