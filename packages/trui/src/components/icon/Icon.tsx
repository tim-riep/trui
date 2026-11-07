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

import { type IconDefinition, useIcon } from '@tim-riep/trui/core';
import { type Ref, type SVGProps, useEffect } from 'react';
import { cx } from '../../internal/class-names';

/** Size of an icon: 16, 20, 24 or 32 pixels. */
export type IconSize = 's' | 'm' | 'l' | 'xl';

export interface IconBaseProps extends Omit<SVGProps<SVGSVGElement>, 'name' | 'ref' | 'children'> {
  /** Size; without it the icon takes the size `m`, or the size set by the component around it. */
  size?: IconSize;
  /**
   * Text for assistive technology. Without it the icon is decorative and
   * hidden from assistive technology.
   */
  label?: string;
  ref?: Ref<SVGSVGElement>;
}

/** Props of {@link Icon}: an icon definition, or the name of a registered icon. */
export type IconProps = IconBaseProps &
  ({ icon: IconDefinition; name?: undefined } | { name: string; icon?: undefined });

/**
 * An icon of the icon set or one defined by the application. Pass the icon
 * itself (`icon={addIcon}`), which puts only the icons used into the bundle,
 * or the name of an icon registered with a provider (`name="add"`).
 */
export function Icon({ icon, name, size, label, className, ref, ...rest }: IconProps) {
  const registered = useIcon(name ?? '');
  const definition = icon ?? registered;
  useEffect(() => {
    if (!definition && name) console.warn(`[trui] icon "${name}" is not registered`);
  }, [definition, name]);
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      className={cx(
        'trui-icon',
        size && `trui-icon--${size}`,
        definition?.mirrorInRtl && 'trui-icon--mirror',
        className,
      )}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      data-icon={definition?.name}
      {...rest}
    >
      {definition?.shapes.map((shape, i) =>
        typeof shape === 'string' ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: shapes of an icon never change order
          <path key={i} d={shape} />
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: shapes of an icon never change order
          <path key={i} d={shape.d} className="trui-icon__fill" />
        ),
      )}
    </svg>
  );
}
