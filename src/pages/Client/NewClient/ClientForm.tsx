import moment from 'moment';
import { useState } from 'react';
import { RangePickerProps } from 'antd/es/date-picker';
import { gql, useQuery } from '@apollo/client';
import { Button, Col, Form, Input, Row, Select, Space, DatePicker } from 'antd';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import {
  InvoicePaymentConfigPagingResult,
  InvoiceSchedule,
} from '../../../interfaces/generated';

import styles from '../style.module.scss';

export const INVOICE_PAYMENT_CONFIG = gql`
  query InvoicePaymentConfig($input: InvoicePaymentConfigQueryInput!) {
    InvoicePaymentConfig(input: $input) {
      data {
        id
        name
        days
      }
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }
    }
  }
 `;

interface IProps {
  form: any;
  btnText: string;
  loading: boolean;
  onSubmitForm: any;
  cancelAddClient: any;
  id?: string;
  initialValues?: any;
  createdAt?: string;
}

const ClientForm = (props: any) => {
  const { id, loading, form, onSubmitForm, btnText, cancelAddClient, initialValues, createdAt = null } = props;
  const [schedule, setSchedule] = useState<InvoiceSchedule | undefined>(initialValues?.invoiceSchedule);

  const { data: paymentConfigData, loading: paymnentConfigLoading } = useQuery<
    GraphQLResponse<'InvoicePaymentConfig', InvoicePaymentConfigPagingResult>
  >(INVOICE_PAYMENT_CONFIG, {
    fetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['days:ASC'],
        },
      },
    },
  });

  const onScheduleChange = (value: string) => {
    setSchedule(value as InvoiceSchedule);
  }

  const disabledDate: RangePickerProps['disabledDate'] = current => {
    const currentDate = moment(current);
    let createdDate = createdAt ? moment(createdAt) : moment();

    if(schedule === InvoiceSchedule.Custom) {
      return  currentDate >= createdDate
    }

    return currentDate.day() !== 1 || currentDate >= createdDate;
  };


  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmitForm}
        initialValues={initialValues}
      >
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              label="Full Name"
              name='name'
              rules={[{
                required: true,
                message: 'Please enter full name!'
              }]}
            >
              <Input
                placeholder="Enter the full name"
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              label="Email Address"
              name='email'
              rules={[{
                type: 'email',
                message: 'The input is not valid E-mail!'
              }, {
                required: true,
                message: 'Please input your E-mail!'
              }]}
            >
              <Input
                placeholder="Enter your email"
                autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              label="Invoice Email"
              name='invoicingEmail'
              rules={[{
                type: 'email',
                message: 'The input is not valid Invoice E-mail!',
              }]}
            >
              <Input
                placeholder="Enter your invoice email"
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              name="country"
              label="Country"
              rules={[{
                required: true,
                message: 'Please enter country!'
              }]}
            >
              <Input
                placeholder="Enter the country"
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              name="state"
              label="State"
              rules={[{
                required: true,
                message: 'Please enter state!'
              }]}
            >
              <Input
                placeholder="Enter the state"
                name='state'
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              name="city"
              label="City"
              rules={[{
                required: true,
                message: 'Please enter city!'
              }]}>
              {/* <Select
                showSearch
                placeholder={'Select the city'}>
                {cities?.map((city: string, index: number) =>
                  <Select.Option value={city} key={index}>
                    {city}
                  </Select.Option>
                )}
              </Select> */}
              <Input
                placeholder="Enter the city "
                name='city'
                autoComplete="off" />
            </Form.Item>
          </Col>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              label="Street Address"
              name='streetAddress'
              rules={[{
                required: true,
                message: 'Please enter address!'
              }]}>
              <Input
                placeholder="Enter the address of the client"
                name='address'
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              label="Zip Code"
              name='zipcode'
              rules={[{
                required: true,
                message: 'Please enter zipcode!'
              }]}>
              <Input
                placeholder="Enter the zipcode"
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              label="Contact Number"
              name='phone'

              rules={[{
                required: true,
                message: 'Please enter contact Number!'
              }]}>
              <Input
                type='number'
                placeholder="Enter the contact number"
                autoComplete="off" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              label="Invoice Schedule"
              name='invoiceSchedule'
            >
              <Select 
                placeholder="Invoice Schedule" 
                onChange={onScheduleChange}
              >
                <Select.Option value={InvoiceSchedule.Weekly}>{InvoiceSchedule.Weekly}</Select.Option>
                <Select.Option value={InvoiceSchedule.Biweekly}>{InvoiceSchedule.Biweekly}</Select.Option>
                <Select.Option value={InvoiceSchedule.Monthly}>{InvoiceSchedule.Monthly}</Select.Option>
                <Select.Option value={InvoiceSchedule.Custom}>{InvoiceSchedule.Custom}</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item
              label="Invoice Payment"
              name='invoice_payment_config_id'
            >
              <Select placeholder="Invoice Payment" loading={paymnentConfigLoading}>
                {
                  paymentConfigData?.InvoicePaymentConfig?.data?.map((config) => (
                    <Select.Option key={config.id} value={config.id}>{config.name}</Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>

          {
            [InvoiceSchedule.Biweekly, InvoiceSchedule.Custom].includes(schedule as InvoiceSchedule) && (
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item
                  label="Schedule start date"
                  name='scheduleStartDate'
                >
                  <DatePicker 
                    disabledDate={disabledDate}
                  />
                </Form.Item>
              </Col>
            )
          }
        </Row>

        <Row
          justify="end"
          style={{ padding: '1rem 1rem 2rem 0' }}>
          <Col>
            <Form.Item>
              <Space>
                <Button
                  type="default"
                  htmlType="button"
                  onClick={cancelAddClient}>
                  Cancel
                </Button>
                <Button
                  loading={loading}
                  type="primary"
                  htmlType="submit"
                >
                  {btnText}
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ClientForm;
