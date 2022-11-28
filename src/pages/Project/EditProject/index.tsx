import { Button, Card, Col, Form, Input, message, Row, Select, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";

import { PROJECT } from "../index";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { MutationProjectUpdateArgs, Project, QueryUserArgs, QueryUserClientArgs, RoleName, UserClientPagingResult, UserPagingResult } from "../../../interfaces/generated";
import routes from "../../../config/routes";
import { CLIENT } from "../../Client";
import { USER } from "../../Employee";
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
  const selectProps = {
    placeholder: "Select Employees",
    mode: "multiple" as const,
    style: { width: "100%" }
  };


  const [projectUpdate] = useMutation<GraphQLResponse<'ProjectUpdate', Project>, MutationProjectUpdateArgs>(PROJECT_UPDATE);

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

  const { data: clientData } = useQuery(CLIENT, {
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

  const { data: employeeData } = useQuery<GraphQLResponse<'User', UserPagingResult>, QueryUserArgs>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          role: RoleName.Employee,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });
  
  const { data: userClientData } = useQuery<GraphQLResponse<'UserClient', UserClientPagingResult>, QueryUserClientArgs>(USERCLIENT, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		skip: !projectData?.Project?.data[0]?.client?.id,
		variables: {
			input: {
				query: {
					client_id:projectData?.Project?.data[0]?.client?.id as string
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			},
		},
	});


	const { data: userData } = useQuery<GraphQLResponse<'User', UserPagingResult>, QueryUserArgs>(USER, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				query: {
					company_id: loggedInUser?.company?.id,
					role: RoleName.Employee
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			},
		},
	});

	let userClientList:any=[], userList;
	if (userClientData?.UserClient?.data?.length) {
		userClientList = userClientData?.UserClient?.data?.filter(function (userClient) {
			return userClient?.status === "Active"
		}
		);
	} else {
		userList = userData?.User?.data.filter((entry: any) => {
			return entry?.activeClient === null
		});
	}
  
  const onSubmitForm = (values: any) => {
    let key = 'project'
    projectUpdate({
      variables: {
        input: {
          id: params?.pid as string,
          name: values.name,
          company_id: loggedInUser?.company?.id as string,
          client_id: values.client,
          user_ids: values?.assignee,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.ProjectUpdate) {
        navigate(-1)
        message.success({
          content: `Project is updated successfully!`,
          key,
          className: 'custom-message'
        });
      }
    }).catch(notifyGraphqlError)
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
              client: projectData?.Project?.data[0]?.client?.id ?? '',
              assignee: projectData?.Project?.data[0]?.users?.map((user: any) => {
                return user?.id
              }) ?? "",
            }}
          >
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
                  <Select placeholder="Select Name of the Client">
                    {clientData && clientData?.Client?.data.map((user: any, index: number) => (
                      <Option value={user?.id} key={index}>{user?.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>
							<Form.Item
								name="assignee"
								label="Tasks Assigned to"
								style={{ position: "relative" }}>
								<Select
									{...selectProps}
									allowClear
									placeholder="Please select">
									{userClientList?.length ?
										userClientList?.map((userClient:any, index: number) => (
											<Option
												value={userClient?.user?.id}
												key={index+1}>
												{userClient?.user?.fullName} / {userClient?.user?.email}
											</Option>
										))
                    :
									
                    userList?.map((user, index: number) => (
											<Option
												value={user?.id}
												key={index}>
												{user?.fullName} / {user?.email}
											</Option>
										))
									}
								</Select>
							</Form.Item>
						</Col>
            </Row>
            <br /><br />
            <Row justify="end">
              <Col>
                <Form.Item>
                  <Space>
                    <Button type="default" htmlType="button" onClick={() => navigate(routes.projects.path(loggedInUser?.company?.id as string))}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Update Project</Button>
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
