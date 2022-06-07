import React, { useState } from 'react';
import { Button, Col, Form, Input, Row, Select, Space } from 'antd';

import { STATE_CITIES, USA_STATES } from '../../../utils/cities';
import styles from '../style.module.scss';


const ClientForm = (props: any) => {
  const { form, onSubmitForm, btnText, cancelAddClient } = props;
  const [cities, setCountryCities] = useState<string[]>([]);
  const setState = (data: string) => {
    setCountryCities(STATE_CITIES[data]);
  }
  return (
    <div>
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmitForm}>
        <Row>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              label="Full Name"
              name='name'
              rules={[{
                required: true,
                message: 'Please enter full name!'
              }]}>
              <Input
                placeholder="Enter the full name"
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
              label="Email Address"
              name='email'
              rules={[{
                type: 'email',
                message: 'The input is not valid E-mail!'
              }, {
                required: true,
                message: 'Please input your E-mail!'
              }]}>
              <Input
                placeholder="Enter your email"
                autoComplete="off" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              label="Invoice Email"
              name='invoiceEmail'
              rules={[{
                type: 'email',
                message: 'The input is not valid Invoice E-mail!',
              }, {
                required: true,
                message: 'Please input your invoice E-mail!'
              }]}>
              <Input
                placeholder="Enter your invoice email"
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
        </Row>
        <Row>
          <Col
            xs={24}
            sm={24}
            md={12}
            lg={12}
            className={styles.formCol}>
            <Form.Item
              name="state"
              label="State"
              rules={[{
                required: true,
                message: 'Please enter state!'
              }]}>
              <Select
                showSearch
                placeholder={'Select the state'}
                onChange={setState}
              >
                {USA_STATES?.map((state: any, index: number) =>
                  <Select.Option value={state?.name} key={index}>
                    {state?.name}
                  </Select.Option>
                )}
              </Select>
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
              <Select
                showSearch
                placeholder={'Select the city'}>
                {cities?.map((city: string, index: number) =>
                  <Select.Option value={city} key={index}>
                    {city}
                  </Select.Option>
                )}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
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
                  type="primary"
                  htmlType="submit">
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
