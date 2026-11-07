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
  type DecimalString,
  decimalDigits,
  formatDecimal,
  type IconDefinition,
  shiftDecimal,
  signDecimal,
  toScale,
  useLocale,
  useText,
} from '@tim-riep/trui/core';
import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';
import { errorIcon } from '../../icons/set/error';
import { trendDownIcon } from '../../icons/set/trend-down';
import { trendFlatIcon } from '../../icons/set/trend-flat';
import { trendUpIcon } from '../../icons/set/trend-up';
import { cx } from '../../internal/class-names';
import { Badge } from '../badge/Badge';
import { Icon } from '../icon/Icon';

/** Size of a tile in cells of the tile grid. */
export type TileSize = '1x1' | '2x1';

/** State of a tile. */
export type TileState = 'normal' | 'loading' | 'failed' | 'disabled';

/** Props shared by all tiles. */
export interface TileBaseProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Name of the application or figure the tile stands for. */
  title: string;
  subtitle?: string;
  icon?: IconDefinition;
  /** Line at the bottom, e.g. a source or a time. */
  footer?: ReactNode;
  /** A count in the top corner, e.g. of open items. */
  badge?: number;
  size?: TileSize;
  /** `loading` shows a placeholder, `failed` an error, `disabled` a tile that cannot be opened. */
  state?: TileState;
  /** Opens this address. */
  href?: string;
  /** Called when the tile is opened. */
  onPress?: (event: MouseEvent) => void;
  /** Stable identifier of the tile, e.g. for personalization later on. */
  tileId?: string;
  ref?: Ref<HTMLElement>;
}

/** Props of {@link Tile}. */
export type TileProps = TileBaseProps;

interface TileFrameProps extends TileBaseProps {
  kind: string;
  /** Content between header and footer. */
  body?: ReactNode;
  /** Text read by assistive technology after the title. */
  description?: string;
}

function TileFrame({
  kind,
  title,
  subtitle,
  icon,
  footer,
  badge,
  size = '1x1',
  state = 'normal',
  href,
  onPress,
  tileId,
  body,
  description,
  className,
  ref,
  ...rest
}: TileFrameProps) {
  const t = useText();
  const disabled = state === 'disabled';
  const classes = cx('trui-tile', kind, `trui-tile--${size}`, `trui-tile--${state}`, className);
  const content =
    state === 'loading' ? (
      <>
        <span className="trui-tile__skeleton trui-tile__skeleton--title" aria-hidden="true" />
        <span className="trui-tile__skeleton trui-tile__skeleton--line" aria-hidden="true" />
        <span className="trui-visually-hidden">
          {title}, {t('tile.loading')}
        </span>
      </>
    ) : (
      <>
        <span className="trui-tile__header">
          <span className="trui-tile__title">{title}</span>
          {subtitle !== undefined && <span className="trui-tile__subtitle">{subtitle}</span>}
          {badge !== undefined && badge > 0 && <Badge count={badge} className="trui-tile__badge" />}
        </span>
        <span className="trui-tile__body">
          {state === 'failed' ? (
            <span className="trui-tile__failed">
              <Icon icon={errorIcon} size="s" />
              {t('tile.failed')}
            </span>
          ) : (
            (body ?? (icon && <Icon icon={icon} size="xl" className="trui-tile__icon" />))
          )}
        </span>
        {description !== undefined && <span className="trui-visually-hidden">{description}</span>}
        {footer !== undefined && <span className="trui-tile__footer">{footer}</span>}
      </>
    );
  const common = {
    className: classes,
    'data-tile-id': tileId,
    'aria-busy': state === 'loading' || undefined,
    ...rest,
  };
  if (href !== undefined && !disabled) {
    return (
      <a ref={ref as Ref<HTMLAnchorElement>} href={href} onClick={onPress} {...common}>
        {content}
      </a>
    );
  }
  if (onPress || href !== undefined) {
    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        type="button"
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          if (!disabled) onPress?.(event);
        }}
        {...common}
      >
        {content}
      </button>
    );
  }
  return (
    <div ref={ref as Ref<HTMLDivElement>} {...common}>
      {content}
    </div>
  );
}

/**
 * A tile on a home page that opens an application, with title, subtitle,
 * icon, footer and a count. The whole tile is a link (`href`) or button
 * (`onPress`).
 *
 * Keyboard: Tab reaches the tile, Enter opens it; inside a tile group,
 * arrow keys move between tiles.
 */
export function Tile(props: TileProps) {
  return <TileFrame {...props} kind="trui-app-tile" />;
}

/** Magnitude a figure is shown in. */
export type MetricScale = 'auto' | 'none' | 'thousand' | 'million' | 'billion';

/** Props of {@link MetricTile}. */
export interface MetricTileProps extends TileBaseProps {
  /** The figure as exact decimal, e.g. `"1250000.00"`. */
  value: DecimalString;
  /** Unit after the figure, e.g. `EUR` or `%`. */
  unit?: string;
  /** Shows the figure in thousands, millions or billions; `auto` picks by size. */
  scale?: MetricScale;
  /** Fraction digits of the shown figure; 1 when scaled, else those of the value. */
  fractionDigits?: number;
  trend?: 'up' | 'down' | 'flat';
  /** Rating of the figure, shown by color: neutral, good, critical, bad. */
  tone?: 'neutral' | 'good' | 'critical' | 'bad';
}

const magnitudes = { thousand: 3, million: 6, billion: 9 } as const;

/**
 * A tile with a key figure: value, unit, scaling, trend and a color for its
 * rating. The value is an exact decimal string, never a JavaScript number;
 * scaling moves the decimal point exactly.
 */
export function MetricTile({
  value,
  unit,
  scale = 'auto',
  fractionDigits,
  trend,
  tone = 'neutral',
  ...rest
}: MetricTileProps) {
  const t = useText();
  const { locale } = useLocale();
  const digits = decimalDigits(value).integer;
  const magnitude =
    scale === 'auto'
      ? digits > 9
        ? 'billion'
        : digits > 6
          ? 'million'
          : digits > 4
            ? 'thousand'
            : 'none'
      : scale;
  const scaled = magnitude === 'none' ? value : shiftDecimal(value, -magnitudes[magnitude]);
  const shown = toScale(
    scaled,
    fractionDigits ?? (magnitude === 'none' ? decimalDigits(value).fraction : 1),
  );
  const suffix = magnitude === 'none' ? '' : t(`metric.${magnitude}`);
  const trendIcon =
    trend === 'up'
      ? trendUpIcon
      : trend === 'down'
        ? trendDownIcon
        : trend === 'flat'
          ? trendFlatIcon
          : null;
  const description = [
    trend === 'up'
      ? t('metric.trendUp')
      : trend === 'down'
        ? t('metric.trendDown')
        : trend === 'flat'
          ? t('metric.trendFlat')
          : '',
    tone !== 'neutral' ? t(`metric.${tone}`) : '',
  ]
    .filter(Boolean)
    .join(', ');
  return (
    <TileFrame
      {...rest}
      kind={cx(
        'trui-metric-tile',
        `trui-metric-tile--${tone}`,
        signDecimal(value) < 0 && 'trui-metric-tile--negative',
      )}
      {...(description ? { description } : {})}
      body={
        <span className="trui-metric-tile__figure">
          <span className="trui-metric-tile__value">{formatDecimal(shown, locale)}</span>
          {(suffix || unit) && (
            <span className="trui-metric-tile__unit">
              {suffix}
              {suffix && unit ? ' ' : ''}
              {unit}
            </span>
          )}
          {trendIcon && <Icon icon={trendIcon} size="l" className="trui-metric-tile__trend" />}
        </span>
      }
    />
  );
}

/** Props of {@link ContentTile}. */
export interface ContentTileProps extends Omit<TileBaseProps, 'size'> {
  /** Sizes up to two by two cells. */
  size?: TileSize | '2x2';
  /** Free content, e.g. a short list or a picture. */
  children: ReactNode;
}

/**
 * A tile with free content, e.g. a short list of recent items or a picture.
 * Interactive content inside it stays reachable; the tile itself is not a
 * link then.
 */
export function ContentTile({ children, size = '1x1', ...rest }: ContentTileProps) {
  return (
    <TileFrame
      {...(rest as TileBaseProps)}
      size={size as TileSize}
      kind="trui-content-tile"
      body={children}
    />
  );
}
