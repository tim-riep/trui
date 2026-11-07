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
import { countries, searchSuppliers } from '../../../../../catalog/data/sample';
import { AmountField } from '../amount-field/AmountField';
import { Button } from '../button/Button';
import { Checkbox } from '../checkbox/Checkbox';
import { DatePicker } from '../date-picker/DatePicker';
import { LookupField } from '../lookup-field/LookupField';
import { RadioGroup } from '../radio-group/RadioGroup';
import { Select } from '../select/Select';
import { TextArea } from '../text-area/TextArea';
import { TextField } from '../text-field/TextField';
import { Form, FormField, FormGroup } from './Form';

/**
 * A native form with groups in responsive columns. `FormField` connects its
 * label with the input inside it, marks it as required and adds the hint as
 * description; no ids need to be wired by hand. Labels stand beside the fields
 * when a group is wide enough, otherwise above them.
 *
 * **Tokens:** `--trui-space-m` … `--trui-space-xxl`, `--trui-font-size-m`.
 */
const meta = {
  title: 'Forms/Form',
  component: Form,
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PurchaseOrder: Story = {
  render: () => (
    <Form columns={2} onSubmit={(e) => e.preventDefault()}>
      <FormGroup title="Supplier">
        <FormField label="Supplier" required>
          <LookupField name="supplier" fetchItems={searchSuppliers} />
        </FormField>
        <FormField label="Contact person">
          <TextField name="contact" />
        </FormField>
        <FormField label="Country">
          <Select name="country" items={countries} defaultValue="DE" />
        </FormField>
      </FormGroup>
      <FormGroup title="Terms">
        <FormField label="Delivery date" required help="Earliest date the goods may arrive">
          <DatePicker name="deliveryDate" min="2026-11-01" />
        </FormField>
        <FormField label="Net amount" required>
          <AmountField name="amount" currency="EUR" />
        </FormField>
        <FormField label="Shipping">
          <RadioGroup
            name="shipping"
            orientation="horizontal"
            defaultValue="standard"
            options={[
              { value: 'standard', label: 'Standard' },
              { value: 'express', label: 'Express' },
            ]}
          />
        </FormField>
      </FormGroup>
      <FormGroup title="Notes" span={2}>
        <FormField label="Note">
          <TextArea name="note" nullable autoGrow />
        </FormField>
        <FormField label="Confirmation">
          <Checkbox name="confirmed">Send an order confirmation</Checkbox>
        </FormField>
        <div className="catalog-row">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="reset">Reset</Button>
        </div>
      </FormGroup>
    </Form>
  ),
};
