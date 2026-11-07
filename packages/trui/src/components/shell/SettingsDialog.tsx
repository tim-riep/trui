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

import { type IconDefinition, useControllableState, useText } from '@tim-riep/trui/core';
import { type ReactNode, useId } from 'react';
import { Dialog } from '../dialog/Dialog';
import { Icon } from '../icon/Icon';

/** A section of a {@link SettingsDialog}. */
export interface SettingsSection {
  key: string;
  label: string;
  icon?: IconDefinition;
  /** Content of the section, given by the application. */
  content: ReactNode;
}

/** Props of {@link SettingsDialog}. */
export interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  sections: readonly SettingsSection[];
  selectedKey?: string;
  defaultSelectedKey?: string;
  onSelectionChange?: (key: string) => void;
  /** Title; "Settings" by default. */
  title?: string;
  /** Actions at the bottom, e.g. Save and Cancel. */
  footer?: ReactNode;
}

/**
 * A frame for the settings of an application: navigation between sections on
 * the start side and the content of the selected section, which the
 * application provides.
 *
 * Keyboard: Tab moves from the sections into the content; Enter opens a section.
 */
export function SettingsDialog({
  open,
  onClose,
  sections,
  selectedKey,
  defaultSelectedKey,
  onSelectionChange,
  title,
  footer,
}: SettingsDialogProps) {
  const t = useText();
  const headingId = useId();
  const [selected, setSelected] = useControllableState(
    selectedKey,
    defaultSelectedKey ?? sections[0]?.key ?? '',
    onSelectionChange,
  );
  const section = sections.find((s) => s.key === selected) ?? sections[0];
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title ?? t('settings.title')}
      size="l"
      {...(footer !== undefined ? { footer } : {})}
    >
      <div className="trui-settings">
        <nav className="trui-settings__nav" aria-label={t('settings.sections')}>
          <ul>
            {sections.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  className="trui-settings__section"
                  aria-current={s.key === section?.key ? 'true' : undefined}
                  onClick={() => setSelected(s.key)}
                >
                  {s.icon && <Icon icon={s.icon} size="s" />}
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        {section && (
          <section className="trui-settings__content" aria-labelledby={headingId}>
            <h3 id={headingId} className="trui-settings__title">
              {section.label}
            </h3>
            {section.content}
          </section>
        )}
      </div>
    </Dialog>
  );
}
