import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import {Link, useNavigate} from "react-router-dom";
import routes from "../../../config/routes";
import styles from "../style.module.scss";

const NewProject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { Option } = Select;

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Project</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical">
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Project Name" name='name'>
                <Input placeholder="Enter the project name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="vendor" label="Vendor Name" rules={[{ required: true, message: 'Please enter vendor name!' }]}>
                <Select placeholder="Select Name of the Vendor">
                  <Option value={1}>Vendor 1</Option>
                  <Option value={2}>Vendor 2</Option>
                  <Option value={3}>Vemdor 3</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Invoice Rate" name='rate'>
                <Input placeholder="Enter your Invoice Rate" name=''/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Tasks</p>
            </Col>
          </Row>
          <Row>
            <Col span={12} className={styles['form-col']}>
              <h1>Projects</h1>
            </Col>
            <Col span={12} className={styles['form-col']}>
              <div className={styles['add-new-project']}>
                <Link to={routes.addProject.path}>Add new project</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="roles" label="Project" rules={[{ required: true, message: 'Please enter project!' }]}>
                <Select placeholder="Employee">
                  <Option value={1}>Project 1</Option>
                  <Option value={2}>Project 2</Option>
                  <Option value={3}>Project 3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Pay Rate" name='payRate' rules={[{ required: true, message: 'Please enter pay rate!' }]}>
                <InputNumber placeholder="$20" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="reporting" label="Reporting Manager">
                <Select placeholder="Select Reporting Manager">
                  <Option value="Employee">Employee</Option>
                  <Option value="TaskManager">Task Manager</Option>
                  <Option value="Vendor">Vendor</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="reportsTo" label="Employee Reports to">
                <Select placeholder="Select Reporting Officer">
                  <Option value="Employee">Employee</Option>
                  <Option value="TaskManager">Task Manager</Option>
                  <Option value="Vendor">Vendor</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Create Project</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default NewProject;
