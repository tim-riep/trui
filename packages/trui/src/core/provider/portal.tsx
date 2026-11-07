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

import { type ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';
import { ProviderPresentContext } from './contexts';
import { useOverlayContainer } from './hooks';

/**
 * Renders overlays into the container of the nearest provider, so that they
 * get its tokens and writing direction. Outside of a provider, it renders
 * into the document body.
 */
export function Portal({ children }: { children: ReactNode }) {
  const container = useOverlayContainer();
  const inProvider = useContext(ProviderPresentContext);
  if (typeof document === 'undefined') return null;
  // Inside a provider the container exists after its first commit.
  if (inProvider && !container) return null;
  return createPortal(children, container ?? document.body);
}
