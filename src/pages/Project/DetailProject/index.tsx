import { Card, Col, Dropdown, Menu, Row, Table, message } from "antd";
import { ArrowLeftOutlined, MoreOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";

import { PROJECT } from "../index";
import { TASK } from "../../Tasks";
import routes from "../../../config/routes";

import deleteImg from "../../../assets/images/delete_btn.svg";
import archiveImg from "../../../assets/images/archive_btn.svg";

import styles from "../style.module.scss";
import ModalConfirm from "../../../components/Modal";

const { SubMenu } = Menu;

export const TASK_UPDATE = gql`
  mutation TaskUpdate($input: TaskUpdateInput!) {
    TaskUpdate(input: $input) {
      id
      name
      status
      archived
    }
  }
`;

export const TASK_DELETE = gql`
  mutation TaskDelete($input: DeleteInput!) {
    TaskDelete(input: $input) {
      id
      name
      status
      archived
    }
  }
`;

export const TASK_FRAGMENT = gql`
  fragment Task on Task {
    id
  }
`;

const DetailProject = () => {
  let params = useParams();
  const navigate = useNavigate();
  const loggedInUser = authVar();

  const [TaskUpdate] = useMutation(TASK_UPDATE, {
    update(cache) {
      const normalizedId = cache.identify({ id: task.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });
  const [TaskDelete] = useMutation(TASK_DELETE, {
    update(cache) {
      const normalizedId = cache.identify({ id: task.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const [task, setTask] = useState<any>("");
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);

  const setModalVisibility = (value: boolean) => {
    setVisibility(value);
  };

  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const deleteBody = () => {
    return (
      <div className={styles["modal-message"]}>
        <div>
          <img src={deleteImg} alt="confirm" />
        </div>
        <br />
        <p>
          Are you sure you want to delete
          <strong> {task.name}?</strong>
        </p>
        <p className={styles["warning-text"]}>
          All the data associated with the task will be deleted permanently.
        </p>
      </div>
    );
  };

  const archiveBody = () => {
    return (
      <div className={styles["modal-message"]}>
        <div>
          <img src={archiveImg} alt="archive-confirm" />
        </div>{" "}
        <br />
        <p>
          Are you sure you want to {task?.archived ? "unarchive" : "archive"}
          <strong> {task.name}?</strong>
        </p>
        <p className={styles["archive-text"]}>
          Task will {task?.archived ? "" : "not"} be able to assigned to any
          employee
        </p>
      </div>
    );
  };

  const changeStatus = (value: string, id: string) => {
    message
      .loading({
        content: "Updating status of task..",
        className: "custom-message",
      })
      .then(() =>
        TaskUpdate({
          variables: {
            input: {
              status: value,
              id: id,
              company_id: loggedInUser?.company?.id,
            },
          },
        })
          .then((response) => {
            if (response.errors) {
              return notifyGraphqlError(response.errors);
            }
            message.success({
              content: `Task is updated successfully!`,
              className: "custom-message",
            });
          })
          .catch(notifyGraphqlError)
      );
  };

  const archiveTask = () => {
    message
      .loading({
        content: "Archiving task in progress..",
        className: "custom-message",
      })
      .then(() =>
        TaskUpdate({
          variables: {
            input: {
              id: task?.id,
              archived: !task?.archived,
              company_id: loggedInUser?.company?.id,
            },
          },
        })
          .then((response) => {
            if (response.errors) {
              return notifyGraphqlError(response.errors);
            }
            message.success({
              content: `Task is archived successfully!`,
              className: "custom-message",
            });
            setArchiveVisibility(false);
          })
          .catch(notifyGraphqlError)
      );
  };

  const deleteTask = () => {
    message
      .loading({
        content: "Deleting task in progress..",
        className: "custom-message",
      })
      .then(() =>
        TaskDelete({
          variables: {
            input: {
              id: task?.id,
            },
          },
        })
          .then((response) => {
            if (response.errors) {
              return notifyGraphqlError(response.errors);
            }
            message.success({
              content: `Task is deleted successfully!`,
              className: "custom-message",
            });
            setVisibility(false);
          })
          .catch(notifyGraphqlError)
      );
  };

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item
          key="active"
          onClick={() => {
            if (data?.status === "Inactive") {
              changeStatus("Active", data?.id);
            }
          }}
        >
          Active
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="inactive"
          onClick={() => {
            if (data?.status === "Active") {
              changeStatus("Inactive", data?.id);
            }
          }}
        >
          Inactive
        </Menu.Item>
      </SubMenu>
      <Menu.Divider />

      <Menu.Item key="archive">
        <div
          onClick={() => {
            setTask(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Task" : "Archive Task"}
        </div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="delete">
        <div
          onClick={() => {
            setModalVisibility(true);
            setTask(data);
          }}
        >
          Delete Task
        </div>
      </Menu.Item>
    </Menu>
  );
  const columns = [
    {
      title: "Task Name",
      key: "name",
      render: (task: any) => {
        return (
          <div className={styles["task-name"]}>
            <p>{task?.name}</p>
          </div>
        );
      },
      onCell: (record: any) => {
        return {
          onClick: () => {
            navigate(
              routes.detailProject.path(
                loggedInUser?.company?.code ?? "",
                record?.id ?? ""
              )
            );
          },
        };
      },
    },
    {
      title: "Task Manager",
      key: "manager",
      render: (task: any) => {
        return (
          <div>
            <p>{task?.name}</p>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span
          className={
            status === "Active"
              ? styles["active-status"]
              : styles["inactive-status"]
          }
        >
          {status}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Dropdown
            overlay={menu(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ paddingLeft: "1rem" }}
            >
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];

  const { data: projectData } = useQuery(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          id: params?.pid,
        },
      },
    },
  });

  const { data: taskData } = useQuery(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          project_id: params?.pid,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles["project-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Project :&nbsp;
              <span>{projectData?.Project?.data[0]?.name ?? ""}</span>
            </h1>
          </Col>
          <Col span={12} className={styles["project-add-task"]}>
            <div>
              <Link
                to={routes.addTasksProject.path(
                  loggedInUser?.company?.code
                    ? loggedInUser?.company?.code
                    : "",
                  params?.pid ?? ""
                )}
              >
                Add new Task
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
      <br />
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles["project-col"]}>
            <h1>Task List</h1>
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={24}>
            <Table
              dataSource={taskData?.Task?.data}
              columns={columns}
              rowKey={(record) => record?.id}
            />
          </Col>
        </Row>
      </Card>

      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={"Delete"}
        modalBody={deleteBody}
        onOkClick={deleteTask}
      />

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={task?.archived ? "Unarchive" : "Archive"}
        modalBody={archiveBody}
        onOkClick={archiveTask}
      />
    </div>
  );
};

export default DetailProject;
