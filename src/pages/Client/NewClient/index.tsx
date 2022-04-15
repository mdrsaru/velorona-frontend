import React from "react";
import {Button, Card, Col, Form, Input, Row, Select, Space} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

import styles from "../style.module.scss";


const NewClient = () => {

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { Option } = Select;

  return (
    <div className={styles['main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['client-col']}>
              <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Client</h1>
            </Col>
          </Row>
          <Form form={form} layout="vertical">
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Client Name" name='clientName' rules={[{ required: true, message: 'Please enter client name!' }]}>
                  <Input placeholder="Enter the name of the Client" name='firstname'/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Email Address" name='email'  rules={[{type: 'email', message: 'The input is not valid E-mail!',},
                  {required: true, message: 'Please input your E-mail!'},]}>
                  <Input placeholder="Enter your email" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Phone Number" name='phone' rules={[{ required: true, message: 'Please input your phone number!' },
                  {max: 10, message: "Phone number should be less than 10 digits"}]}>
                  <Input placeholder="Enter your phone number"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Address" name='address' rules={[{ required: true, message: 'Please enter address!' }]}>
                  <Input placeholder="Enter the address of the client" name='address'/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Apartment/Suite" name='apartment'>
                  <Input placeholder="Enter Apartment/Suite"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="city" label="City">
                  <Select placeholder="Select City">
                    <Option value="Pokhara">Pokhara</Option>
                    <Option value="Kathmandu">Kathmandu</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="state" label="State">
                  <Select placeholder="Select State">
                    <Option value="Arkansas">Arkansas</Option>
                    <Option value="NewYork">New york</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="status" label="Client Status">
                  <Select placeholder="Select Status">
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">Inactive</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end">
              <Col>
                <Form.Item>
                  <Space>
                    <Button type="default" htmlType="button">Cancel</Button>
                    <Button type="primary" htmlType="submit">Create Client</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
  )
}

export default NewClient;
