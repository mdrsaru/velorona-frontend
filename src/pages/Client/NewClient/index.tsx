import React from "react";
import { Card, Col, Row, Form, Input, Space, Button, Select, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import {gql} from "@apollo/client";
import {useMutation} from "@apollo/client";

import { useNavigate } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";

import styles from "../style.module.scss";

const { Option } = Select;

const CLIENT_CREATE = gql`
  mutation ClientCreate($input: ClientCreateInput!) {
      ClientCreate(input: $input) {
          id
          name
          createdAt 
      }
  }
`

const NewClient = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createClient] = useMutation(CLIENT_CREATE);

  const onSubmitForm = (values: any) => {
    createClient({
      variables: {
        input: {
          name: values.name,
          status: values.status
        }
      }
    }).then((response) => {
      if(response.errors) {
         return notifyGraphqlError((response.errors))
      } else if (response?.data?.ClientCreate) {
          message.success(`Client admin ${response?.data?.ClientCreate?.name} is created successfully!`).then(r => {});
          navigate(-1)
      }
    }).catch(notifyGraphqlError)

  }

  return (
    <div className={styles['client-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['form-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Client</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item label="Client Name" name="name" rules={[{required: true, message: 'Enter a client name.'}]}>
                <Input placeholder="Enter Name of the client"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} className={styles['form-col2']}>
              <Form.Item name="status" label="Client Status" rules={[{required: true, message: 'Select a client status.'}]}>
                <Select placeholder="Active">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">In Active</Option>
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
