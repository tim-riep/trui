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

// Classes carry the prefix trui-, custom properties --trui-. Outside the token
// files, colors, shadows and lengths come from tokens only.
// A length with a nonzero number anywhere in the value, e.g. 4px in "0 4px".
const literalLength = /(^|[\s(,])-?\d*\.?\d*[1-9]\d*(px|rem|em|pt)\b/;

export default {
  rules: {
    'selector-class-pattern': [
      '^trui-[a-z0-9]+(-[a-z0-9]+)*(__[a-z0-9]+(-[a-z0-9]+)*)?(--[a-z0-9]+(-[a-z0-9]+)*)?$',
      { message: 'Classes are named trui-block__element--modifier in kebab case' },
    ],
    'custom-property-pattern': [
      '^trui-[a-z0-9]+(-[a-z0-9]+)*$',
      { message: 'Custom properties are named --trui-... in kebab case' },
    ],
    'declaration-no-important': true,
    'color-no-invalid-hex': true,
  },
  overrides: [
    {
      files: ['packages/trui/src/components/**/*.css', 'packages/trui/src/internal/**/*.css'],
      rules: {
        'color-no-hex': true,
        'color-named': 'never',
        'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla', 'oklch', 'lab', 'lch'],
        'declaration-property-value-disallowed-list': {
          '/^(margin|padding|gap|width|height|min-|max-|inset|top|left|right|bottom|border-radius|font-size|line-height)/':
            [literalLength],
          '/^box-shadow$/': ['/\\d+px/'],
        },
      },
    },
  ],
};
