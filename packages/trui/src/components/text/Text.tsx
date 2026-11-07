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

import type { CSSProperties, HTMLAttributes, Ref } from 'react';
import { cx } from '../../internal/class-names';

/** Color of a text, by meaning. */
export type TextTone =
  | 'default'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'success'
  | 'information';

/** Props of {@link Text}. */
export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Element to render; `span` by default. */
  as?: 'span' | 'p' | 'div' | 'strong' | 'em' | 'small';
  /** Font size; without it the text inherits it. */
  size?: 'xs' | 's' | 'm' | 'l';
  tone?: TextTone;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Cuts the text after this number of lines with an ellipsis. */
  maxLines?: number;
  /** Digits of equal width, for numbers in columns. */
  numeric?: boolean;
  ref?: Ref<HTMLElement>;
}

/** Text with a size, color and weight from the tokens. */
export function Text({
  as: Element = 'span',
  size,
  tone = 'default',
  weight,
  maxLines,
  numeric = false,
  className,
  style,
  ref,
  ...rest
}: TextProps) {
  const lineStyle =
    maxLines === undefined
      ? style
      : ({ ...style, '--trui-text-max-lines': maxLines } as CSSProperties);
  return (
    <Element
      ref={ref as Ref<never>}
      className={cx(
        'trui-text',
        size && `trui-text--${size}`,
        tone !== 'default' && `trui-text--${tone}`,
        weight && `trui-text--${weight}`,
        maxLines === 1 && 'trui-text--truncate',
        maxLines !== undefined && maxLines > 1 && 'trui-text--clamp',
        numeric && 'trui-text--numeric',
        className,
      )}
      style={lineStyle}
      {...rest}
    />
  );
}
