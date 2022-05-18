import { Button, Card, Col, Form, Input, message, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";

import constants from "../../../config/constants";
import { PROJECT } from "../index";
import { USER } from "../../Employee";

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

const PROJECT_UPDATE = gql`
    mutation ProjectUpdate($input: ProjectUpdateInput!) {
        ProjectUpdate(input: $input) {
            id
            name
        }
    }
`

const EditProject = () => {
  let params = useParams();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const loggedInUser = authVar();
  const { Option } = Select;
  const [ProjectUpdate] = useMutation(PROJECT_UPDATE);

  const { data: projectData } = useQuery(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          id: params?.pid
        },
      }
    }
  })

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

  const onSubmitForm = (values: any) => {
    message.loading({ content: "Editing project in progress..", className: 'custom-message' }).then(() =>
      ProjectUpdate({
        variables: {
          input: {
            id: params?.pid,
            name: values.name,
            company_id: loggedInUser?.company?.id,
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data?.ProjectUpdate) {
          navigate(-1)
          message.success({ content: `Project is updated successfully!`, className: 'custom-message' });
        }
      }).catch(notifyGraphqlError))
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Edit Project
            </h1>
          </Col>
        </Row>
        {projectData &&
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}
            initialValues={{
              name: projectData?.Project?.data[0]?.name ?? '',
              client: projectData?.Project?.data[0]?.client?.name ?? '',
            }}>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item
                  label="Project Name"
                  name='name'
                  rules={[{
                    required: true,
                    message: 'Please enter project name!'
                  }]}>
                  <Input placeholder="Enter the project name" />
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
                  <Select placeholder="Select Name of the Client" disabled>
                    {clientData && clientData.User.data.map((user: any, index: number) => (
                      <Option value={user?.id} key={index}>{user?.fullName}</Option>
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
                    <Button type="primary" htmlType="submit">Edit Project</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
      </Card>
    </div>
  )
}

export default EditProject;
