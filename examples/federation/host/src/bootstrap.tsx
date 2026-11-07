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

import '@tim-riep/trui/styles.css';
import './host.css';
import { Button, Text } from '@tim-riep/trui';
import { type ThemeSetting, TruiProvider } from '@tim-riep/trui/core';
import * as React from 'react';
import { lazy, StrictMode, Suspense, useState } from 'react';
import { createRoot } from 'react-dom/client';

// Lets the test compare the React of the host with the one the remote uses.
(window as unknown as { __truiHostReact: typeof React }).__truiHostReact = React;

const OrdersPage = lazy(() => import('orders/OrdersPage'));

function App() {
  const [theme, setTheme] = useState<ThemeSetting>('light');
  const [locale, setLocale] = useState('en');
  return (
    <TruiProvider theme={theme} locale={locale} density="compact" className="host">
      <header className="host__header">
        <Text weight="semibold" size="l">
          Host application
        </Text>
        <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
          Theme: {theme}
        </Button>
        <Button onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}>Language: {locale}</Button>
      </header>
      <main>
        <Suspense fallback={<Text>Loading the remote page</Text>}>
          <OrdersPage />
        </Suspense>
      </main>
    </TruiProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
