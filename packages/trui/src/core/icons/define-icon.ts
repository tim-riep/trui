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

/** One shape of an icon: an SVG path, drawn as outline unless `fill` is set. */
export type IconShape = string | { readonly d: string; readonly fill: true };

/** An icon of the icon set or one defined by an application. */
export interface IconDefinition {
  /** Name under which the icon can be registered, in kebab case. */
  readonly name: string;
  /** Shapes in a 24 × 24 grid. */
  readonly shapes: readonly IconShape[];
  /** Mirrors the icon in right-to-left layout, for icons that show a direction. */
  readonly mirrorInRtl: boolean;
}

/**
 * Defines an icon from SVG paths in a 24 × 24 grid. Outline shapes are drawn
 * with the current text color and the stroke width of the icon set; shapes
 * with `fill` are filled.
 */
export function defineIcon(
  name: string,
  shapes: readonly IconShape[],
  options: { mirrorInRtl?: boolean } = {},
): IconDefinition {
  return Object.freeze({
    name,
    shapes: Object.freeze([...shapes]),
    mirrorInRtl: options.mirrorInRtl ?? false,
  });
}
