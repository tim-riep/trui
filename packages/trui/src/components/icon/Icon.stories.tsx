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

import type { Meta, StoryObj } from '@storybook/react-vite';
import { allIcons, iconCategories, iconCategoryByName } from '../../icons';
import { addIcon } from '../../icons/set/add';
import { Icon } from './Icon';

/**
 * Icons of the icon set: outlines in a 24 × 24 grid, drawn in the current text
 * color. Import an icon by itself (`import { addIcon } from '@tim-riep/trui/icons/add'`)
 * so that only the icons used end up in the bundle, or register icons with
 * `TruiProvider icons={…}` or `IconProvider` and use them by name.
 *
 * An icon without `label` is decorative and hidden from assistive technology.
 * Icons that show a direction are mirrored in right-to-left layout.
 *
 * **Tokens:** `--trui-icon-size-s` … `--trui-icon-size-xl`, `--trui-icon-stroke-width`.
 */
const meta = {
  title: 'Basics/Icon',
  component: Icon,
  args: { icon: addIcon, size: 'l' },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="catalog-row">
      <Icon icon={addIcon} size="s" />
      <Icon icon={addIcon} size="m" />
      <Icon icon={addIcon} size="l" />
      <Icon icon={addIcon} size="xl" />
    </div>
  ),
};

export const IconSet: Story = {
  render: () => (
    <div className="catalog-stack" style={{ maxWidth: 'none' }}>
      {Object.entries(iconCategories).map(([key, title]) => (
        <section key={key}>
          <h3>{title}</h3>
          <div className="catalog-icons">
            {allIcons
              .filter((icon) => iconCategoryByName[icon.name] === key)
              .map((icon) => (
                <div key={icon.name} className="catalog-icon">
                  <Icon icon={icon} size="l" />
                  {icon.name}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  ),
};
