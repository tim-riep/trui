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
import { useCallback, useEffect, useRef } from 'react';
import { useText } from '../provider/hooks';
import { useMessageDialog } from './feedback';

/**
 * Guards changes that are not saved yet. While `dirty` is true, the browser
 * asks before the page is closed or reloaded. `confirmLeave` asks in a
 * message dialog whether to discard the changes; call it before the
 * application leaves the view, e.g. on Back or Cancel. It resolves to true
 * when there is nothing to lose or the user discards the changes.
 */
export function useUnsavedChanges(dirty: boolean): { confirmLeave: () => Promise<boolean> } {
  const t = useText();
  const messages = useMessageDialog();
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const confirmLeave = useCallback(async () => {
    if (!dirtyRef.current) return true;
    return messages.confirm({
      title: t('unsaved.title'),
      message: t('unsaved.message'),
      confirmLabel: t('unsaved.discard'),
      cancelLabel: t('unsaved.keep'),
      danger: true,
    });
  }, [messages, t]);

  return { confirmLeave };
}
