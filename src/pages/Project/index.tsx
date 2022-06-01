import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";

import { Card, Col, Dropdown, Menu, message, Row, Table } from "antd";
import { Link, useNavigate } from "react-router-dom";
import routes from "../../config/routes";
import { MoreOutlined, PlusCircleOutlined } from "@ant-design/icons";

import { authVar } from "../../App/link";
import ModalConfirm from "../../components/Modal";

import deleteImg from "../../assets/images/delete_btn.svg";
import archiveImg from "../../assets/images/archive_btn.svg";

import styles from "./style.module.scss";
import ArchiveBody from "../../components/Archive";
import { notifyGraphqlError } from "../../utils/error";
import SubMenu from "antd/lib/menu/SubMenu";

export const PROJECT = gql`
  query Project($input: ProjectQueryInput!) {
    Project(input: $input) {
      data {
        id
        name
        client {
          id
          email
          name
        }
        company {
          id
          name
        }
      }
    }
  }
`;

export const PROJECT_UPDATE = gql`
  mutation ProjectUpdate($input: ProjectUpdateInput!) {
    ProjectUpdate(input: $input) {
      id
      name
      client {
        id
        email
        name
      }
      status
      archived
      company {
        id
        name
      }
    }
  }
`;

const deleteBody = () => {
  return (
    <div className={styles["modal-message"]}>
      <div>
        <img src={deleteImg} alt="confirm" />
      </div>
      <br />
      <p>
        Are you sure you want to delete
        <strong>Insight Workshop Pvt. Ltd?</strong>
      </p>
      <p className={styles["warning-text"]}>
        All the data associated with the project will be deleted permanently.
      </p>
    </div>
  );
};

const Project = () => {
  const loggedInUser = authVar();
  const navigate = useNavigate();
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const [project, setProject] = useState<any>();

  const setModalVisibility = (value: boolean) => {
    setVisibility(value);
  };
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const { data: projectData } = useQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [projectUpdate, { loading: updateLoading }] = useMutation(
    PROJECT_UPDATE,
    {
      onCompleted() {
        message.success({
          content: `Project is updated successfully!`,
          className: "custom-message",
        });
        setArchiveVisibility(false);
      },
      onError(err) {
        setArchiveVisibility(false);
        notifyGraphqlError(err);
      },
    }
  );

  const archiveProject = () => {
    projectUpdate({
      variables: {
        input: {
          id: project?.id,
          archived: !project?.archived,
          company_id: loggedInUser?.company?.id,
          name: project?.name,
        },
      },
    });
  };

  const changeStatus = (value: string, id: string, name: string) => {
    projectUpdate({
      variables: {
        input: {
          status: value,
          id: id,
          name: name,
          company_id: loggedInUser?.company?.id,
        },
      },
    });
  };

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item
          key="active"
          onClick={() => {
            setProject(data);
            if (data?.status === "Inactive") {
              changeStatus("Active", data?.id, data?.name);
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
              setProject(data);
              changeStatus("Inactive", data?.id, data?.name);
            }
          }}
        >
          Inactive
        </Menu.Item>
      </SubMenu>
      <Menu.Divider />

      <Menu.Item key="edit">
        <Link
          to={routes.editProject.path(
            loggedInUser?.company?.code ?? "1",
            data?.id ?? "1"
          )}
        >
          Edit Project
        </Link>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="archive" className={styles.list}>
        <div
          onClick={() => {
            setProject(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Project" : "Archive Project"}
        </div>
      </Menu.Item>
      <Menu.Divider />

      {/* <Menu.Item key="delete">
        <div onClick={() => setModalVisibility(true)}>
          Delete Project
        </div>
      </Menu.Item> */}
    </Menu>
  );

  const columns = [
    {
      title: "Project Name",
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
      title: "Client",
      key: "client",
      render: (record: any) => <div>{record?.client?.email}</div>,
    },
    // {
    //   title: 'Active Employees',
    //   dataIndex: 'active_employees',
    //   key: 'active_employees',
    // },
    // {
    //   title: 'Project Deadline',
    //   dataIndex: 'deadline',
    //   key: 'deadline',
    // },
    // {
    //   title: 'Project Progress',
    //   key: 'progress',
    //   render: (record:any) =>
    //     <div style={{ width: 170 }}>
    //       <Progress percent={record?.progress} size="small" />
    //     </div>
    // },
    // {
    //   title: "Status",
    //   dataIndex: "status",
    //   key: "status",
    //   render: (status: string) => (
    //     <div className={styles[`${status}-text`]}>{status}</div>
    //   ),
    // },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Link
            to={routes.addTasksProject.path(
              loggedInUser?.company?.code ? loggedInUser?.company?.code : "",
              record?.id ?? ""
            )}
          >
            <span className={styles["plus-circle-outline"]}>
              <PlusCircleOutlined />
            </span>{" "}
            &nbsp;
            <span className={styles["add-task"]}>Add Task</span> &nbsp; &nbsp;
          </Link>
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

  return (
    <>
      <div className={styles["project-main-div"]}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles["form-col"]}>
              <h1>Projects</h1>
            </Col>
            <Col span={12} className={styles["form-col"]}>
              <div className={styles["add-new"]}>
                <Link
                  to={routes.addProject.path(
                    loggedInUser?.company?.code
                      ? loggedInUser?.company?.code
                      : ""
                  )}
                >
                  Add new project
                </Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table
                dataSource={projectData?.Project?.data}
                columns={columns}
                rowKey={(record) => record?.id}
                loading={updateLoading }
              />
            </Col>
          </Row>
        </Card>
      </div>
      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={"Delete"}
        modalBody={deleteBody}
      />

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={project?.archived ? "Unarchive" : "Archive"}
        closable
        modalBody={() =>
          ArchiveBody({
            title: (
              <>
                Are you sure you want to{" "}
                {project?.archived ? "unarchive" : "archive"}
                <strong> {project.name}?</strong>
              </>
            ),
            subText: `Project will ${
              project?.archived ? "" : "not"
            } be able to assigned to any employee`,
          })
        }
        onOkClick={archiveProject}
      />
    </>
  );
};

export default Project;
