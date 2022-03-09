import React from "react";
import {Card, Col, Row, Form, Input, Space, Button, Select} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import styles from "../style.module.scss";

const { Option } = Select;

const NewClient = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <div className={styles['client-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['form-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Client</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical">
          <Row>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item label="Client Name">
                <Input placeholder="Enter Name of the client"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item name="status" label="Client Status">
                <Select placeholder="Active">
                  <Option value="active">Active</Option>
                  <Option value="inactive">In Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles['form-col2']}>
              <Form.Item label="Email">
                <Input placeholder="Client Admin Email"/>
              </Form.Item>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space size={'large'}>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Add Client</Button>
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
