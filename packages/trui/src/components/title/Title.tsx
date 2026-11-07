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

import type { HTMLAttributes, Ref } from 'react';
import { cx } from '../../internal/class-names';

/** Visual size of a title, independent of its level. */
export type TitleSize = 's' | 'm' | 'l' | 'xl' | 'xxl';

/** Props of {@link Title}. */
export interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level 1–6; sets the element and the document outline. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Visual size; by default derived from the level. */
  size?: TitleSize;
  /** Cuts the title to one line with an ellipsis. */
  truncate?: boolean;
  ref?: Ref<HTMLHeadingElement>;
}

const sizeByLevel: Record<number, TitleSize> = {
  1: 'xxl',
  2: 'xl',
  3: 'l',
  4: 'm',
  5: 's',
  6: 's',
};

/** A heading. The level gives the structure, the size the look; set both independently. */
export function Title({ level = 2, size, truncate = false, className, ref, ...rest }: TitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      ref={ref}
      className={cx(
        'trui-title',
        `trui-title--${size ?? sizeByLevel[level]}`,
        truncate && 'trui-title--truncate',
        className,
      )}
      {...rest}
    />
  );
}
