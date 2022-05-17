import { Button, Card, Col, Form, Input, message, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { useNavigate } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { CLIENT } from "../../Client";
import { notifyGraphqlError } from "../../../utils/error";

import routes from "../../../config/routes";
import styles from "../style.module.scss";

interface ItemProps {
  label: string;
  value: string;
}

const options: ItemProps[] = [];

for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i;
  options.push({
    label: `Long Label: ${value}`,
    value,
  });
}


const PROJECT_CREATE = gql`
  mutation ProjectCreate($input: ProjectCreateInput!) {
      ProjectCreate(input: $input) {
          id
          name
      }
  }
`

const NewProject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const loggedInUser = authVar();
  const { Option } = Select;
  const [ProjectCreate] = useMutation(PROJECT_CREATE);

  const { data: clientData } = useQuery(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const onSubmitForm = (values: any) => {
    message.loading({
      content: "Creating project in progress..",
      className: 'custom-message'
    }).then(() =>
      ProjectCreate({
        variables: {
          input: {
            name: values.name,
            company_id: loggedInUser?.company?.id,
            client_id: values.client,
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data?.ProjectCreate) {
          navigate(routes.addTasksProject.path(loggedInUser?.company?.code ?? '', response?.data?.ProjectCreate?.id ?? ''))
          message.success({
            content: `New Project is created successfully!`,
            className: 'custom-message'
          });
        }
      }).catch(notifyGraphqlError))
  }


  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Add New Project</h1>
          </Col>
        </Row>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                label="Project Name"
                name='name'
                rules={[{
                  required: true,
                  message: 'Please enter project name!'
                }]}>
                <Input
                  placeholder="Enter the project name"
                  autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                name="client"
                label="Client Name"
                rules={[{
                  required: true,
                  message: 'Please enter client name!'
                }]}>
                <Select placeholder="Select Name of the Client">
                  {clientData && clientData.Client.data.map((user: any, index: number) => (
                    <Option value={user?.id} key={index}>{user?.name} / {user?.email}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <br /><br />
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
