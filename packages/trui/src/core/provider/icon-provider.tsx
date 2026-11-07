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

import { type ReactNode, useContext, useMemo } from 'react';
import type { IconDefinition } from '../icons/define-icon';
import { IconContext } from './contexts';

/** Props of {@link IconProvider}. */
export interface IconProviderProps {
  /** Icons to register by name; they extend and override those of outer providers. */
  icons: readonly IconDefinition[];
  children?: ReactNode;
}

/** Registers icons by name for the components below it, without rendering an element. */
export function IconProvider({ icons, children }: IconProviderProps) {
  const outer = useContext(IconContext);
  const map = useMemo(() => {
    const m = new Map(outer);
    for (const icon of icons) m.set(icon.name, icon);
    return m;
  }, [outer, icons]);
  return <IconContext.Provider value={map}>{children}</IconContext.Provider>;
}
