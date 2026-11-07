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

import { useText } from '@tim-riep/trui/core';
import { Icon } from '../../components/icon/Icon';
import { errorIcon } from '../../icons/set/error';
import { infoIcon } from '../../icons/set/info';
import { successIcon } from '../../icons/set/success';
import { warningIcon } from '../../icons/set/warning';
import type { ValueStateInfo } from './use-value-state';

const icons = {
  error: errorIcon,
  warning: warningIcon,
  success: successIcon,
  information: infoIcon,
};

/**
 * The message of a value state below a field. The element stays in the
 * document as a polite live region, so that a new message is announced.
 */
export function ValueStateMessage({ info }: { info: ValueStateInfo }) {
  const t = useText();
  const { state, message } = info;
  return (
    <div id={info.messageId} className="trui-field__message" aria-live="polite">
      {message && state !== 'none' && (
        <>
          <Icon
            icon={icons[state]}
            size="s"
            className={`trui-field__message-icon trui-field__message-icon--${state}`}
          />
          <span className="trui-visually-hidden">{t(`valueState.${state}`)}: </span>
          <span>{message}</span>
        </>
      )}
    </div>
  );
}
