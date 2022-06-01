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
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";

import routes from "../../../config/routes";
import { UserData } from "../../Client";
import constants from "../../../config/constants";

import styles from "../style.module.scss";
import { TaskStatus } from "../../../interfaces/generated";

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

const TASK_CREATE = gql`
  mutation TaskCreate($input: TaskCreateInput!) {
    TaskCreate(input: $input) {
      id
      name
    }
  }
`;

const AddTasks = () => {
  let params = useParams();
  const loggedInUser = authVar();
  const [fileName, setFileName] = useState("");

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createTask] = useMutation(TASK_CREATE, {
    onCompleted(response) {
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

  const selectProps = {
    placeholder: "Select Employees",
    mode: "multiple" as const,
    style: { width: "100%" },
    // maxTagCount: 'responsive' as const
  };

  const onSubmitForm = (values: any) => {
    createTask({
      variables: {
        input: {
          name: values?.name,
          description: values?.description,
          status: values?.status,
          company_id: loggedInUser?.company?.id,
          manager_id: values?.taskManager,
          project_id: params?.pid,
          user_ids: values?.assignee,
        },
      },
    });
  };
  const status = Object.values(TaskStatus);
  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col
            span={12}
            className={styles["project-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New Task
            </h1>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row className={styles["add-task-row"]}>
            <Col
              span={24}
              className={styles["form-col-task"]}>
              <Form.Item
                label="Task Name"
                name="name">
                <Input
                  placeholder="Enter the Name of the Task"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col
              span={24}
              className={styles["form-col-task"]}>
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
              lg={12}
              className={styles["form-col-task"]}>
              <Form.Item
                name="assignmentFile"
                label="Assignment Files"
                style={{ position: "relative" }}>
                <div className={styles["upload-file"]}>
                  <div>
                    <span>
                      {fileName ? fileName : " Attach your files here"}
                    </span>
                  </div>
                  <div className={styles["browse-file"]}>
                    <Upload
                      name="assignmentFile"
                      maxCount={1}
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setFileName(file?.name);
                      }}>
                      <span>Browse</span>
                    </Upload>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              className={styles["form-col-task"]}>
              <Form.Item
                name="assignee"
                label="Tasks Assigned to"
                style={{ position: "relative" }}>
                <Select
                  {...selectProps}
                  allowClear
                  placeholder="Please select"
                // dropdownStyle={{
                //    maxHeight: 100,
                //    overflowY: "hidden",
                // }}
                >
                  {employeeData &&
                    employeeData?.User?.data?.map((employee, index) => (
                      <Option value={employee?.id} key={index}>
                        {employee?.fullName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              className={styles["form-col-task"]}>
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
                      <Option value={manager?.id} key={index}>
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
              lg={12}
              className={styles["form-col-task"]}>
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
                    <Option value={status} key={index}>
                      {status}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
          <Row justify="end">
            <Col className={styles["form-submit"]}>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button">
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
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
