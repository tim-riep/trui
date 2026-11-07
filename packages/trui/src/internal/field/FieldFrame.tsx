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

import type { CSSProperties, ReactNode, Ref, RefObject } from 'react';
import { cx } from '../class-names';
import type { ValueStateInfo } from './use-value-state';
import { ValueStateMessage } from './ValueStateMessage';

export interface FieldFrameProps {
  /** Class of the kind of field, e.g. `trui-text-field`. */
  kind: string;
  info: ValueStateInfo;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  /** Element focused by a click on the box outside of it. */
  focusTarget?: RefObject<HTMLElement | null>;
  /** Ref to the box, e.g. as anchor of a list. */
  controlRef?: Ref<HTMLDivElement>;
  startContent?: ReactNode;
  endContent?: ReactNode;
  /** Content after the box, e.g. hidden inputs or a popup. */
  after?: ReactNode;
  children: ReactNode;
}

/** The box of a field with its adornments and the value state message below. */
export function FieldFrame({
  kind,
  info,
  disabled,
  readOnly,
  className,
  style,
  focusTarget,
  controlRef,
  startContent,
  endContent,
  after,
  children,
}: FieldFrameProps) {
  return (
    <div
      className={cx(
        'trui-field',
        kind,
        info.state !== 'none' && `trui-field--${info.state}`,
        disabled && 'trui-field--disabled',
        readOnly && 'trui-field--readonly',
        className,
      )}
      style={style}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: a click on the box focuses the input; the input itself is the control */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard users reach the input directly */}
      <div
        ref={controlRef}
        className="trui-field__control"
        onClick={(e) => {
          if (e.target === e.currentTarget) focusTarget?.current?.focus();
        }}
      >
        {startContent !== undefined && startContent !== null && (
          <span className="trui-field__adornment">{startContent}</span>
        )}
        {children}
        {endContent !== undefined && endContent !== null && (
          <span className="trui-field__adornment">{endContent}</span>
        )}
      </div>
      {after}
      <ValueStateMessage info={info} />
    </div>
  );
}
