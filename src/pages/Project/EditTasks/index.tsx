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
import { TASK } from "../../Tasks";

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

const TASK_UPDATE = gql`
  mutation TaskUpdate($input: TaskUpdateInput!) {
    TaskUpdate(input: $input) {
      id
      name
    }
  }
`;

const EditTasks = () => {
  let params = useParams();
  const loggedInUser = authVar();
  const [fileName, setFileName] = useState("");

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [updateTask] = useMutation(TASK_UPDATE, {
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
      notifyGraphqlError(err);
    },
  });

  const { Option } = Select;
  const status = Object.values(TaskStatus);

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

  const { data: taskData, loading } = useQuery(TASK, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          id: params?.tid,
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

  if (loading) {
    return <></>;
  }

  const selectProps = {
    placeholder: "Select Employees",
    mode: "multiple" as const,
    style: { width: "100%" },
    // maxTagCount: 'responsive' as const
  };
  let task = taskData?.Task?.data[0];

  const onSubmitForm = (values: any) => {
    updateTask({
      variables: {
        input: {
          id: params?.tid,
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

  return (
    <div className={styles["main-div"]}>
      {loading && <></>}
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles["project-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Edit Task
            </h1>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}
          initialValues={{
            name: task?.name ?? "",
            description: task?.description ?? "",
            assignee: task?.users ?? "",
            taskManager: task?.manager?.fullName ?? "",
            status: task?.status ?? "",
          }}
        >
          <Row className={styles["add-task-row"]}>
            <Col span={24} className={styles["form-col-task"]}>
              <Form.Item label="Task Name" name="name">
                <Input
                  placeholder="Enter the Name of the Task"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col span={24} className={styles["form-col-task"]}>
              <Form.Item label="Description Name" name="description">
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}
              className={styles["form-col-task"]}
            >
              <Form.Item
                name="assignmentFile"
                label="Assignment Files"
                style={{ position: "relative" }}
              >
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
                      }}
                    >
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
              className={styles["form-col-task"]}
            >
              <Form.Item
                name="assignee"
                label="Tasks Assigned to"
                style={{ position: "relative" }}
              >
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
              className={styles["form-col-task"]}
            >
              <Form.Item name="taskManager" label="Task Manager">
                <Select showArrow placeholder="Select Task Manager">
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
              className={styles["form-col-task"]}
            >
              <Form.Item name="status" label="Status">
                <Select placeholder="Select status" defaultValue={task?.status}>
                  {status?.map((status, index) => (
                    <Option value={status}>{status}</Option>
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

export default EditTasks;
