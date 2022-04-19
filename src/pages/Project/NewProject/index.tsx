import { Button, Card, Col, Form, Input, InputNumber, message, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import routes from "../../../config/routes";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import constants from "../../../config/constants";

import {USER} from "../../Employee";
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

  const { data: clientData } = useQuery(USER, {
    variables: {
      input: {
        query: {
          role: constants.roles.Client
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const selectProps = {
    placeholder:"Select Employees",
    mode: 'multiple' as const,
    style: { width: '100%' },
    options,
    onChange: (newValue: string[]) => {
    },
    maxTagCount: 'responsive' as const
  }

  const onSubmitForm = (values: any) => {
    message.loading({content: "Creating project in progress..", className: 'custom-message'}).then(() =>
      ProjectCreate({
        variables: {
          input: {
            name: values.name,
            company_id: loggedInUser?.company?.id,
            client_id: values.client,
          }
        }
      }).then((response) => {
        if(response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data?.ProjectCreate) {
          navigate(-1)
          message.success({content: `New Project is created successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError))
  }


  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Project</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Project Name" name='name' rules={[{ required: true, message: 'Please enter project name!' }]}>
                <Input placeholder="Enter the project name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="client" label="Client Name" rules={[{ required: true, message: 'Please enter client name!' }]}>
                <Select placeholder="Select Name of the Client">
                  {clientData && clientData.User.data.map((user: any, index:number) => (
                    <Option value={user?.id} key={index}>{user?.fullName}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Tasks</p>
            </Col>
          </Row>
          <Row className={styles['add-task-row']}>
            <Col span={12} className={styles['form-col']}>
              <h1>Add Tasks</h1>
            </Col>
            <Col span={12} className={styles['form-col']}>
              <div className={styles['add-new-task']}>
                <Link to={routes.addProject.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>Add New Tasks</Link>
              </div>
            </Col>
            <>
              <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-task']}>
                <Form.Item label="Task Name" name='task-name'>
                  <InputNumber placeholder="Enter the Name of the Task" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="assignee" label="Tasks Assigned to"
                           style={{ position: 'relative' }}>
                  <Select {...selectProps} dropdownStyle={{ maxHeight: 100, overflowY: 'hidden' }}>
                    <Option value={1}>Employee 1</Option>
                    <Option value={2}>Employee 2</Option>
                    <Option value={3}>Employee 3</Option>
                  </Select>
                </Form.Item>
              </Col>
            </>
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
