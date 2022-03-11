import React from "react";

import { Button, Card, Col, Form, Input, Row, Select, Space, TimePicker } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import styles from "../style.module.scss";

const NewEmployee = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { Option } = Select;

  return(
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['employee-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Employee</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical">
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="First Name">
                <Input placeholder="Enter firstname"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Last Name">
                <Input placeholder="Enter lastname"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="role" label="Role">
                <Select placeholder="Employee">
                  <Option value="project1">Employee 1</Option>
                  <Option value="project2">Employee 2</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Designation">
                <Input placeholder="UI/UX Designer"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Email">
                <Input placeholder="Enter your email" value={'ndhungana@gmail.com'}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Phone Number">
                <Input placeholder="Enter your phone number"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="start-time-picker" label="Employee Start Time">
                <TimePicker placeholder={"Enter Start Time"} suffixIcon={""} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Employee Reports to">
                <Input placeholder="Enter the name of reporter" value={"Rabin Karki"}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Employee Image">
                <Input placeholder="Enter the name of reporter" value={"Rabin Karki"}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Renumeration">
                <Input placeholder="$20" />
              </Form.Item>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Create Employee</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
export default NewEmployee
