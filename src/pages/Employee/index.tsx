import { Card, Row, Col, Table, Dropdown, Menu, message } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import routes from "../../config/routes";

import { gql, useMutation, useQuery } from "@apollo/client";
import { authVar } from "../../App/link";
import { useState } from "react";

import ModalConfirm from "../../components/Modal";
import { notifyGraphqlError } from "../../utils/error";

import deleteImg from "../../assets/images/delete_btn.svg";
import archiveImg from "../../assets/images/archive_btn.svg";
import constants from "../../config/constants";

import RouteLoader from "../../components/Skeleton/RouteLoader";
import UserPayRateModal from "../../components/UserPayRate";
import styles from "./style.module.scss";
import ViewUserPayRate from "../../components/ViewUserPayRate";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { QueryUserArgs, RoleName, UserPagingResult } from "../../interfaces/generated";

const { SubMenu } = Menu;

export const USER = gql`
  query User($input: UserQueryInput!) {
    User(input: $input) {
      paging {
        total
      }
      data {
        id
        email
        phone
        firstName
        middleName
        lastName
        fullName
        status
        archived
        avatar_id
        avatar {
          id
          url
          name
        }
        activeClient {
          id
          name
        }
        address {
          city
          streetAddress
          zipcode
          state
          aptOrSuite
        }
        company {
          id
          name
        }
        roles {
          id
          name
        }
      }
    }
  }
`;

export const USER_UPDATE = gql`
  mutation UserUpdate($input: UserUpdateInput!) {
    UserUpdate(input: $input) {
      id
      firstName
      lastName
      email
      phone
      status
      archived
      avatar{
        url
        id
      }
    }
  }
`;

export const USER_ARCHIVE = gql`
  mutation UserArchive($input: UserArchiveInput!) {
    UserArchive(input: $input) {
      id
      firstName
      lastName
      email
      archived
    }
  }
`;

const Employee = () => {
  const loggedInUser = authVar();
  const navigate = useNavigate();
  const [employeeUpdate] = useMutation(USER_UPDATE);
  const [employeeArchive] = useMutation(USER_ARCHIVE, {
    update(cache) {
      const normalizedId = cache.identify({
        id: employee.id,
        __typename: "User",
      });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const [pagingInput, setPagingInput] = useState<{
    skip: number;
    currentPage: number;
  }>({
    skip: 0,
    currentPage: 1,
  });

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };
  const [employee, setEmployee] = useState<any>("");
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [showUserPayRate, setUserPayRateVisibility] = useState<boolean>(false);
  const [showViewUserPayRate, setViewUserPayRateVisibility] =
    useState<boolean>(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value);
  };
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const DeleteBody = () => {
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
          All the data associated with the employee will be deleted permanently.
        </p>
      </div>
    );
  };

  const ArchiveBody = () => {
    return (
      <div className={styles["modal-message"]}>
        <div>
          <img src={archiveImg} alt="archive-confirm" />
        </div>{" "}
        <br />
        <p>
          Are you sure you want to{" "}
          {employee?.archived ? "unarchive" : "archive"}
          <strong> {employee.fullName}? </strong>
        </p>
        <p className={styles["archive-text"]}>
          Employee will {employee?.archived ? "" : "not"} be able to login to
          the system.
        </p>
      </div>
    );
  };
const role = Object.values(RoleName)
  const { loading: employeeLoading, data: employeeData } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(
    USER,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          query: {
            role: role[2],
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      },
    }
  );

  const archiveUser = () => {
    let key = "archive";
    message.loading({
      content: "Archiving employee in progress..",
      key,
      className: "custom-message",
    });
    employeeArchive({
      variables: {
        input: {
          id: employee?.id,
          archived: !employee?.archived,
          company_id: loggedInUser?.company?.id,
        },
      },
    })
      .then((response) => {
        if (response.errors) {
          return notifyGraphqlError(response.errors);
        }
        message.success({
          content: `Employee is archived successfully!`,
          key,
          className: "custom-message",
        });
        setArchiveVisibility(false);
      })
      .catch(notifyGraphqlError);
  };

  const changeStatus = (value: string, id: string) => {
    let key = "status";
    message.loading({
      content: "Updating status of employee..",
      key,
      className: "custom-message",
    });
    employeeUpdate({
      variables: {
        input: {
          status: value,
          id: id,
        },
      },
    })
      .then((response) => {
        if (response.errors) {
          return notifyGraphqlError(response.errors);
        }
        message.success({
          content: `Employee is updated successfully!`,
          key,
          className: "custom-message",
        });
      })
      .catch(notifyGraphqlError);
  };

  const handleUserPayRate = (record: any) => {
    setEmployee(record);
    setUserPayRateVisibility(!showUserPayRate);
  };

  const handleViewPayRate = (user: any) => {
    setEmployee(user)
    setViewUserPayRateVisibility(!showViewUserPayRate)
  }
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

      <Menu.Item key="edit">
        <div>
          <Link
            to={routes.editEmployee.path(
              loggedInUser?.company?.code ?? "1",
              data?.id ?? "1"
            )}
          >
            Edit Employee
          </Link>
        </div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="archive">
        <div
          onClick={() => {
            setEmployee(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Employee" : "Archive Employee"}
        </div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Name",
      key: "fullName",
      dataIndex: "fullName",
      onCell: (record: any) => {
        return {
          onClick: () => {
            navigate(
              routes.detailEmployee.path(
                loggedInUser?.company?.code ?? "",
                record?.id ?? ""
              )
            );
          },
        };
      },
    },
    {
      title: "Pay Rate",
      render: (user: any) => {
        return <div onClick={() => handleViewPayRate(user)} className={styles["add-pay-rate"]}>View PayRate</div>;
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
        <Row style={{ marginTop: '11px' }}>
          <Col>
            <p
              onClick={() => handleUserPayRate(record)}
              className={styles["add-pay-rate"]}
            >
              Add PayRate
            </p>
          </Col>
          <Col>
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
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <>
      {employeeLoading ? (
        <RouteLoader />
      ) : (
        <div className={styles["main-div"]}>
          <Card bordered={false}>
            <Row>
              <Col span={12} className={styles["employee-col"]}>
                <h1>Employee</h1>
              </Col>
              <Col span={12} className={styles["employee-col"]}>
                <div className={styles["add-new-employee"]}>
                  <Link
                    to={routes.addEmployee.path(
                      loggedInUser?.company?.code
                        ? loggedInUser?.company?.code
                        : ""
                    )}
                  >
                    Add New Employee
                  </Link>
                </div>
              </Col>
            </Row>
            <Row className='container-row'>
              <Col span={24}>
                <Table
                  loading={employeeLoading}
                  dataSource={employeeData?.User?.data}
                  columns={columns}
                  rowKey={(record) => record?.id}
                  pagination={{
                    current: pagingInput.currentPage,
                    onChange: changePage,
                    // total: employeeData?.User?.paging?.total,
                    pageSize: constants.paging.perPage,
                  }}
                />
              </Col>
            </Row>
          </Card>
          <ModalConfirm
            visibility={visibility}
            setModalVisibility={setModalVisibility}
            imgSrc={deleteImg}
            okText={"Delete"}
            modalBody={<DeleteBody />}
          />

          <ModalConfirm
            visibility={showArchive}
            setModalVisibility={setArchiveVisibility}
            imgSrc={archiveImg}
            okText={employee?.archived ? "Unarchive" : "Archive"}
            modalBody={<ArchiveBody />}
            onOkClick={archiveUser}
          />

          <UserPayRateModal
            visibility={showUserPayRate}
            setVisibility={setUserPayRateVisibility}
            data={employee}
          />
          <ViewUserPayRate
            visibility={showViewUserPayRate}
            setVisibility={setViewUserPayRateVisibility}
            data={employee}
          />
        </div>
      )}
    </>
  );
};

export default Employee;
