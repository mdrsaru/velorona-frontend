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
import ArchiveBody from "../../../components/Archive";
import DeleteBody from "../../../components/Delete";
import TaskDetail from "../../../components/TaskDetail";
import AssignedUser from "../../../components/AssignedUser";
import Status from "../../../components/Status";

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

const DetailProject = () => {
  let params = useParams();
  const navigate = useNavigate();
  const loggedInUser = authVar();

  const [taskUpdate, { loading: updateLoading }] = useMutation(TASK_UPDATE, {
    onCompleted() {
      message.success({
        content: `Task is updated successfully!`,
        className: "custom-message",
      });
      setArchiveVisibility(false);
    },
    onError(err) {
      setArchiveVisibility(false);
      notifyGraphqlError(err);
    },
    update(cache) {
      const normalizedId = cache.identify({ id: task.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });
  const [taskDelete, { loading }] = useMutation(TASK_DELETE, {
    onCompleted() {
      message.success({
        content: `Task is deleted successfully!`,
        className: "custom-message",
      });
      setVisibility(false);
    },
    onError(err) {
      setVisibility(false);
      notifyGraphqlError(err);
    },

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

  const changeStatus = (value: string, id: string) => {
    taskUpdate({
      variables: {
        input: {
          status: value,
          id: id,
          company_id: loggedInUser?.company?.id,
        },
      },
    });
  };

  const archiveTask = () => {
    taskUpdate({
      variables: {
        input: {
          id: task?.id,
          archived: !task?.archived,
          company_id: loggedInUser?.company?.id,
        },
      },
    });
  };
  const deleteTask = () => {
    setVisibility(false);
    taskDelete({
      variables: {
        input: {
          id: task?.id,
        },
      },
    });
  };

  const [detailVisibility, setDetailVisibility] = useState(false);
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
      onCell: (task: any) => {
        return {
          onClick: () => {
            setDetailVisibility(!detailVisibility);
            setTask(task);
          },
        };
      },
    },
    {
      title: "Assigned To",
      key: "assignedTo",
      width:"35%",
      render: (task: any) => {
        return <AssignedUser users={task?.users} />;
      },
    },
    {
      title: "Task Manager",
      key: "manager",
      render: (task: any) => {
        return (
          <div>
            <p>{task?.manager?.fullName}</p>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Status status={status} />,
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
              loading={loading || updateLoading}
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
        closable
        modalBody={() =>
          DeleteBody({
            title: (
              <>
                {" "}
                Are you sure you want to delete
                <strong> {task?.name}?</strong>
              </>
            ),
            subText: (
              <>
                ` All the data associated with the task will be deleted
                permanently.`
              </>
            ),
          })
        }
        onOkClick={deleteTask}
      />

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={task?.archived ? "Unarchive" : "Archive"}
        closable
        modalBody={() =>
          ArchiveBody({
            title: (
              <>
                Are you sure you want to{" "}
                {task?.archived ? "unarchive" : "archive"}
                <strong> {task.name}?</strong>
              </>
            ),
            subText: `Task will ${
              task?.archived ? "" : "not"
            } be able to assigned to any employee`,
          })
        }
        onOkClick={archiveTask}
      />
      {detailVisibility && (
        <TaskDetail
          visibility={detailVisibility}
          setVisibility={setDetailVisibility}
          data={task}
        />
      )}
    </div>
  );
};

export default DetailProject;
