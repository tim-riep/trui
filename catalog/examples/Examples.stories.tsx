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
import { HomeApp } from './home-app';
import { OrdersApp } from './orders-app';
import './examples.css';

/**
 * Examples of how the components work together, with static data only.
 *
 * - **Business page:** a list of purchase orders with a filter bar, a toolbar,
 *   selection and row actions; a row opens the detail page with key facts and
 *   a form, validation messages, a toast on saving and a confirmation on deleting.
 * - **Home page:** the shell with search, notifications, area switch and user
 *   menu, tile groups with key figures, and settings. A tile opens the business
 *   page in the same shell; the home button returns.
 */
const meta = {
  title: 'Examples/Pages',
  parameters: { layout: 'fullscreen' },
} satisfies Meta;
export default meta;

export const BusinessPage: StoryObj = {
  render: () => (
    <div className="example-frame">
      <OrdersApp />
    </div>
  ),
};

export const HomePage: StoryObj = {
  render: () => (
    <div className="example-frame">
      <HomeApp now={Date.UTC(2026, 10, 8, 10, 0, 0)} />
    </div>
  ),
};
