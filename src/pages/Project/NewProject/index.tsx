import { Button, Card, Col, Form, Input, message, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { CLIENT } from "../../Client";
import { notifyGraphqlError } from "../../../utils/error";

import routes from "../../../config/routes";
import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { ClientPagingResult, MutationProjectCreateArgs, Project, QueryClientArgs, QueryUserClientArgs, UserClientPagingResult } from "../../../interfaces/generated";
import { USERCLIENT } from "../../Employee/DetailEmployee";

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
    const selectProps = {
	    placeholder: "Select Employees",
	    mode: "multiple" as const,
	    style: { width: "100%" }
	  };
	
  const [client, setClient] = useState('')
 
  const handleChange = (value: any) => {
    setClient(value)
  }

    const { data: userClientData } = useQuery<GraphQLResponse<'UserClient', UserClientPagingResult>, QueryUserClientArgs>(USERCLIENT, {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          query: {
            client_id: client as string
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      },
    });

  const [projectCreate] = useMutation<
    GraphQLResponse<'ProjectCreate',
    Project>,MutationProjectCreateArgs
  >(PROJECT_CREATE);

  const { data: clientData } = useQuery<GraphQLResponse<'Client',ClientPagingResult>,QueryClientArgs>(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const onSubmitForm = (values: any) => {
    let key = 'project'
    projectCreate({
      variables: {
        input: {
          name: values.name,
          company_id: loggedInUser?.company?.id as string,
          client_id: values.client,
		  user_ids: values?.assignee,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.ProjectCreate) {
        message.success({
          content: `New Project is created successfully!`,
          key,
          className: 'custom-message'
        });
        navigate(routes.projects.path(loggedInUser?.company?.code ?? ''))
      }
    }).catch(notifyGraphqlError)
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
              >
                <Select placeholder="Select Name of the Client" onChange={handleChange}>
                  {clientData && clientData.Client.data.map((user: any, index: number) => (
                    <Option value={user?.id} key={index}>{user?.name} / {user?.email}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
			<Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
			<Form.Item
                name="assignee"
                label="Tasks Assigned to"
                style={{ position: "relative" }}>
                <Select
                  {...selectProps}
                  allowClear
                  placeholder="Please select">
                  {userClientData &&
                    userClientData?.UserClient?.data?.map((userClient,index) => (
                      <Option
                        value={userClient?.user?.id}
                        key={index}>
                        {userClient?.user?.fullName} / {userClient?.user?.email}
                      </Option>
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
                  <Button type="default" htmlType="button" onClick={()=>navigate(-1)}>Cancel</Button>
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
