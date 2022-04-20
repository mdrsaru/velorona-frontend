import React from "react";
import { Card, Col, Row, Form, Input, Space, Button, Select, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";

import { useNavigate } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";

import styles from "../style.module.scss";

const { Option } = Select;

const COMPANY_CREATE = gql`
  mutation CompanyCreate($input: CompanyCreateInput!) {
      CompanyCreate(input: $input) {
          id
          name
          createdAt 
      }
  }
`

const NewCompany = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createCompany] = useMutation(COMPANY_CREATE);

  const onSubmitForm = (values: any) => {
    createCompany({
      variables: {
        input: {
          name: values.name,
          status: values.status
        }
      }
    }).then((response) => {
      if(response.errors) {
         return notifyGraphqlError((response.errors))
      } else if (response?.data?.CompanyCreate) {
          message.success(`Company admin ${response?.data?.CompanyCreate?.name} is created successfully!`).then(r => {});
          navigate(-1)
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['company-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['form-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Company</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item label="Company Name" name="name" rules={[{required: true, message: 'Enter a company name.'},
                {max: 50, message: "Name should be less than 50 character"}]}>
                <Input placeholder="Enter Name of the company"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item name="status" label="Company Status" rules={[{required: true, message: 'Select a company status.'}]}>
                <Select placeholder="Active">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">In Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles['form-col2']}>
              <Form.Item label="Email" name='email' rules={[{type: 'email', message: 'The input is not valid E-mail!',},
                {required: true, message: 'Please input your E-mail!'},]}>
                <Input placeholder="Company Admin Email"/>
              </Form.Item>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space size={'large'}>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Add Company</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default NewCompany;
