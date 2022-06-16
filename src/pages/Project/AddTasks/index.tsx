import {
  Button,
  Card,
  Col,
  Input,
  Form,
  Row,
  Select,
  Space,
  Upload,
  message,
  DatePicker,
} from "antd";
import type { UploadProps } from 'antd';
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";

import routes from "../../../config/routes";
import { UserData } from "../../Client";
import constants from "../../../config/constants";
import { MutationTaskCreateArgs, ProjectPagingResult, QueryProjectArgs, Task, TaskStatus } from "../../../interfaces/generated";
import { ITasks } from "../../../interfaces/ITasks";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { PROJECT } from "..";

const USER = gql`
  query User($input: UserQueryInput!) {
    User(input: $input) {
      data {
        id
        email
        fullName
        roles {
          id
          name
        }
      }
    }
  }
`;

export const TASK_CREATE = gql`
  mutation TaskCreate($input: TaskCreateInput!) {
    TaskCreate(input: $input) {
      id
      name
      project{
      id
      name
      }
    }
  }
`;

const AddTasks = () => {
  let params = useParams();
  const loggedInUser = authVar();
  const [fileData, setFile] = useState<ITasks>({
    ids: [],
    name: ""
  })

  const props: UploadProps = {
    name: 'file',
    action: `${constants.apiUrl}/v1/media/upload`,
    headers: {
      'authorization': loggedInUser?.token ? `Bearer ${loggedInUser?.token}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        let newID = info?.file?.response?.data?.id
        let array = [...fileData?.ids, newID]
        setFile({
          name: info?.file?.name,
          ids: array
        })
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    listType: "picture"
  };

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createTask] = useMutation<GraphQLResponse<'TaskCreate',Task>,MutationTaskCreateArgs>(TASK_CREATE, {
    onCompleted() {
      message.success({
        content: `New task is added successfully!`,
        className: "custom-message",
      });
      navigate(
        routes.detailProject.path(
          loggedInUser?.company?.code ?? "",
          params?.pid ?? ""
        )
      );
    },
    onError(err) {
      notifyGraphqlError(err)
    },
  });

  const { Option } = Select;

  const { data: taskManager } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          role: constants.roles.TaskManager,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const { data: employeeData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          role: constants.roles.Employee,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const { data: projectData } = useQuery<GraphQLResponse<'Project', ProjectPagingResult>, QueryProjectArgs>(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
          id: params?.pid,
        },
      },
    },
  });

  const selectProps = {
    placeholder: "Select Employees",
    mode: "multiple" as const,
    style: { width: "100%" }
  };

  const onSubmitForm = (values: any) => {
    createTask({
      variables: {
        input: {
          name: values?.name,
          description: values?.description,
          status: values?.status,
          attachment_ids: fileData?.ids,
          company_id: loggedInUser?.company?.id as string,
          manager_id: values?.taskManager,
          project_id: params?.pid as string,
          user_ids: values?.assignee,
          deadline: values?.deadline?.toISOString(),
        },
      },
    });
  };
  const status = Object.values(TaskStatus);

  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Col span={24} className={styles["project-col"]}>
          <h1>
            <ArrowLeftOutlined onClick={() => navigate((routes.projects.path(loggedInUser?.company?.id as string)))} />
            &nbsp; Project :&nbsp;
            <span>{projectData?.Project?.data[0]?.name ?? ""}</span>
          </h1>
        </Col>
      </Card>
      <br/>
      <Card bordered={false}>
        <Row>

          <Col
            span={12}
            className={styles["project-col"]}>
            <h1>
              Add New Task
            </h1>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row className={styles["add-task-row"]} gutter={[24, 8]}>
            <Col span={24}>
              <Form.Item
                label="Task Name"
                name="name">
                <Input
                  placeholder="Enter the Name of the Task"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                label="Description Name"
                name="description">
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>

              <Form.Item
                name="assignee"
                label="Tasks Assigned to"
                style={{ position: "relative" }}>
                <Select
                  {...selectProps}
                  allowClear
                  placeholder="Please select">
                  {employeeData &&
                    employeeData?.User?.data?.map((employee, index) => (
                      <Option
                        value={employee?.id}
                        key={index}>
                        {employee?.fullName} / {employee?.email}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                name="taskManager"
                label="Task Manager"
                rules={[
                  {
                    required: true,
                    message: "Choose the task manager",
                  },
                ]}>
                <Select
                  showArrow
                  placeholder="Select Task Manager">
                  {taskManager &&
                    taskManager?.User?.data?.map((manager, index) => (
                      <Option
                        value={manager?.id}
                        key={index}>
                        {manager?.fullName} / {manager?.email}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                label="Assignment Files"
                style={{ position: "relative" }}>
                <Upload {...props}>
                  <Button icon={<UploadOutlined />}>
                    Browse
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  {
                    required: true,
                    message: "Choose the status",
                  },
                ]}>
                <Select placeholder="Select status">
                  {status?.map((status, index) => (
                    <Option
                      value={status}
                      key={index}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="deadline"
                label="Deadline"
              >
                <DatePicker />
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
          <Row justify="end">
            <Col className={styles["form-submit"]}>
              <Form.Item>
                <Space>
                  <Button
                    type="default"
                    htmlType="button" onClick={() => navigate(routes.projects.path(loggedInUser?.company?.id as string))}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit">
                    Create Task
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AddTasks;
