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

import { Button, Label, Text, TextField } from '@tim-riep/trui';
import { useLocale, useText, useTheme } from '@tim-riep/trui/core';
import { addIcon } from '@tim-riep/trui/icons';
import * as React from 'react';
import { useState } from 'react';

/**
 * A page of the remote. It brings no provider and no stylesheet of its own:
 * theme, density, language and texts come from the host through the shared
 * TRUI core.
 */
export function OrdersPage() {
  const { theme } = useTheme();
  const { locale } = useLocale();
  const t = useText();
  const [customer, setCustomer] = useState('');
  const hostReact = (window as unknown as { __truiHostReact?: typeof React }).__truiHostReact;
  return (
    <section
      className="orders"
      data-testid="remote-page"
      data-same-react={String(hostReact?.useState === React.useState)}
    >
      <Text as="p" weight="semibold">
        Orders from the remote
      </Text>
      <Text as="p" data-testid="remote-context">
        {theme} | {locale}
      </Text>
      <Label htmlFor="customer">Customer</Label>
      <TextField id="customer" value={customer} onChange={setCustomer} />
      <div className="orders__actions">
        <Button variant="primary" icon={addIcon}>
          {t('common.save')}
        </Button>
        <Button data-testid="remote-cancel">{t('common.cancel')}</Button>
      </div>
    </section>
  );
}

export default OrdersPage;
