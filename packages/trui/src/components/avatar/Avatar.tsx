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

import type { IconDefinition } from '@tim-riep/trui/core';
import { type HTMLAttributes, type Ref, useState } from 'react';
import { personIcon } from '../../icons/set/person';
import { cx } from '../../internal/class-names';
import { Icon } from '../icon/Icon';

/** Size of an avatar: 24, 32, 48 or 64 pixels. */
export type AvatarSize = 's' | 'm' | 'l' | 'xl';

/** Props of {@link Avatar}. */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'color'> {
  /** Name of the person or thing; gives the initials, the color and the text for assistive technology. */
  name?: string;
  /** Picture; if it cannot be loaded, the initials are shown. */
  src?: string;
  /** Icon shown when there is neither picture nor name. Defaults to a person. */
  icon?: IconDefinition;
  size?: AvatarSize;
  /** `circle` for people, `square` for organizations and things. */
  shape?: 'circle' | 'square';
  /** One of six background colors; by default chosen from the name, so a name keeps its color. */
  color?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Hides the avatar from assistive technology when the name is shown next to it anyway. */
  decorative?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

/** Up to two initials: of the first and the last word of the name. */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  const first = (word: string) => {
    const segments = new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(word);
    return segments[Symbol.iterator]().next().value?.segment ?? '';
  };
  const letters =
    words.length === 1 ? first(words[0]!) : first(words[0]!) + first(words[words.length - 1]!);
  return letters.toLocaleUpperCase();
}

function colorOf(name: string): number {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)!) >>> 0;
  return (hash % 6) + 1;
}

/** A picture, the initials or an icon that stands for a person or an organization. */
export function Avatar({
  name,
  src,
  icon = personIcon,
  size = 'm',
  shape = 'circle',
  color,
  decorative = false,
  className,
  ref,
  ...rest
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = src !== undefined && failedSrc !== src;
  const letters = name ? initials(name) : '';
  const hue = color ?? (name ? colorOf(name) : 1);
  return (
    <span
      ref={ref}
      className={cx(
        'trui-avatar',
        `trui-avatar--${size}`,
        `trui-avatar--${shape}`,
        `trui-avatar--color-${hue}`,
        className,
      )}
      role="img"
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || !name ? true : undefined}
      {...rest}
    >
      {showImage ? (
        <img className="trui-avatar__image" src={src} alt="" onError={() => setFailedSrc(src)} />
      ) : letters ? (
        <span className="trui-avatar__initials">{letters}</span>
      ) : (
        <Icon icon={icon} className="trui-avatar__icon" />
      )}
    </span>
  );
}
