import React from "react";
import {Button, Col, Form, Input, Row, Select, Space} from "antd";

import styles from "../style.module.scss";


const AddClientForm = (props: any) => {
  const {form, onSubmitForm, btnText, cancelAddClient} = props;
  const { Option } = Select;

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={onSubmitForm}>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="First Name" name='firstName' rules={[{ required: true, message: 'Please enter firstname!' }]}>
              <Input placeholder="Enter the first name" autoComplete="off"/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Last Name" name='lastName' rules={[{ required: true, message: 'Please enter lastname!' }]}>
              <Input placeholder="Enter the last name" autoComplete="off"/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Email Address" name='email'  rules={[{type: 'email', message: 'The input is not valid E-mail!',},
              {required: true, message: 'Please input your E-mail!'},]}>
              <Input placeholder="Enter your email" autoComplete="off" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Phone Number" name='phone' rules={[{ required: true, message: 'Please input your phone number!' },
              {max: 10, message: "Phone number should be less than 10 digits"}]}>
              <Input placeholder="Enter your phone number" autoComplete="off"/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Address" name='streetAddress' rules={[{ required: true, message: 'Please enter address!' }]}>
              <Input placeholder="Enter the address of the client" name='address' autoComplete="off"/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city!' }]}>
              <Select placeholder="Select City">
                <Option value="Pokhara">Pokhara</Option>
                <Option value="Kathmandu">Kathmandu</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Zip Code" name='zipcode' rules={[{ required: true, message: 'Please enter zipcode!' }]}>
              <Input placeholder="Enter the zipcode" autoComplete="off"/>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item label="Apartment/Suite" name='apartment'>
              <Input placeholder="Enter your apartment no" name='' autoComplete="off"/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state!' }]}>
              <Select placeholder="Select State">
                <Option value="Arkansas">Arkansas</Option>
                <Option value="NewYork">New york</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <Form.Item name="status" label="Client Status" rules={[{ required: true, message: 'Please select a status!' }]}>
              <Select placeholder="Select Status">
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row justify="end" style={{padding: '1rem 1rem 2rem 0'}}>
          <Col>
            <Form.Item>
              <Space>
                <Button type="default" htmlType="button" onClick={cancelAddClient}>Cancel</Button>
                <Button type="primary" htmlType="submit">{btnText}</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default AddClientForm;
