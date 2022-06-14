import { Card, Row, Col, Table, Dropdown, Menu, message, Input, Button, Select, Form } from "antd"
import { MoreOutlined, SearchOutlined } from "@ant-design/icons"

import { Link, useNavigate } from "react-router-dom"
import routes from "../../config/routes"

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { authVar } from "../../App/link";
import { useEffect, useState } from "react";


import ModalConfirm from "../../components/Modal"
import { notifyGraphqlError } from "../../utils/error"

import deleteImg from "../../assets/images/delete_btn.svg"
import archiveImg from "../../assets/images/archive_btn.svg"
import filterImg from "../../assets/images/filter.svg"
import constants, { roles_user, user_status } from "../../config/constants"

import RouteLoader from "../../components/Skeleton/RouteLoader";
import UserPayRateModal from "../../components/UserPayRate";
import ViewUserPayRate, { USER_PAY_RATE } from "../../components/ViewUserPayRate";
import { GraphQLResponse, UserPayRatePagingData } from "../../interfaces/graphql.interface";
import {
  QueryUserArgs,
  // RoleName, 
  UserPagingResult
} from "../../interfaces/generated";
import styles from "./style.module.scss";
import { debounce } from "lodash";

const { SubMenu } = Menu;
const { Option } = Select;

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
      fullName
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
  mutation UserArchiveOrUnArchive($input: UserArchiveOrUnArchiveInput!) {
    UserArchiveOrUnArchive(input: $input) {
      id
      firstName
      lastName
      email
      archived
    }
  }
`;

const Employee = () => {
  const [filterForm] = Form.useForm();
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
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [showUserPayRate, setUserPayRateVisibility] = useState<boolean>(false);
  const [showViewUserPayRate, setViewUserPayRateVisibility] =
    useState<boolean>(false);

  const [getUserPayRate, { data: userPayRate }] = useLazyQuery<UserPayRatePagingData>(USER_PAY_RATE)

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
          User will {employee?.archived ? "" : "not"} be able to login to
          the system.
        </p>
      </div>
    );
  };
  // const role = Object.values(RoleName)
  const { loading: employeeLoading, data: employeeData, refetch: refetchEmployee } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(
    USER,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
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
      content: "Archiving user in progress..",
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
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError(response.errors);
      }
      message.success({
        content: `User is archived successfully!`,
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
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError(response.errors);
      }
      message.success({
        content: `User is updated successfully!`,
        key,
        className: "custom-message",
      });
    })
      .catch(notifyGraphqlError);
  };

  const handleUserPayRate = (user: any) => {
    setEmployee(user)
    getUserPayRate({
      variables: {
        input: {
          query: {
            user_id: user?.id,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
    setUserPayRateVisibility(!showUserPayRate);
  };

  const handleViewPayRate = (user: any) => {
    setEmployee(user)
    getUserPayRate({
      variables: {
        input: {
          query: {
            user_id: user?.id,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
    setViewUserPayRateVisibility(!showViewUserPayRate)
  }

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchEmployee({
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }

  const refetchEmployees = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status'])
    let input: {
      paging: any,
      query?: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      }
    }
    let query: {
      status?: string,
      archived?: boolean,
      role?: string,
      search?: string
    } = {}

    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') {
        query['status'] = values.status
      } else {
        query['archived'] = values.status === 'Archived' ? true : false
      }
    }

    if (values.role) {
      query['role'] = values?.role
    }

    if (values.search) {
      query['search'] = values?.search
    }

    if (query) {
      input['query'] = query
    }
    refetchEmployee({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchEmployees()
  }

  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const menu = (data: any) => (
    <Menu>
      {
        data?.id !== loggedInUser?.user?.id && (
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
        )
      }

      <Menu.Divider />

      <Menu.Item key="edit">
        <div>
          <Link
            to={routes.editEmployee.path(
              loggedInUser?.company?.code ?? "1",
              data?.id ?? "1"
            )}
          >
            Edit User
          </Link>
        </div>
      </Menu.Item>

      <Menu.Divider />

      {
        data?.id !== loggedInUser?.user?.id && (
          <Menu.Item key="archive">
            <div
              onClick={() => {
                setEmployee(data);
                setArchiveVisibility(true);
              }}
            >
              {data?.archived ? "Unarchive User" : "Archive User"}
            </div>
          </Menu.Item>
        )
      }
    </Menu>
  );

  const columns = [
    {
      title: "Name",
      key: "fullName",
      dataIndex: "fullName",
      render: (fullName: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {fullName}
        </span>
      },
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
      title: "Email",
      key: "email",
      dataIndex: "email",
    },
    {
      title: "Role",
      key: "role",
      render: (user: any) => {
        return <span>{user?.roles[0]?.name}</span>;
      },
    },
    {
      title: "Pay Rate",
      render: (user: any) => {
        return <div
          onClick={() => handleViewPayRate(user)}
          className={styles["add-pay-rate"]}>
          View PayRate
        </div>;
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
            <Row gutter={[32, 0]} className={styles['employee-col']}>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <h1>Users</h1>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <div className={styles["add-new-employee"]}>
                  <Link
                    to={routes.addEmployee.path(
                      loggedInUser?.company?.code
                        ? loggedInUser?.company?.code
                        : ""
                    )}
                  >
                    Add New User
                  </Link>
                </div>
              </Col>
            </Row>
            <Form
              form={filterForm}
              layout="vertical"
              onFinish={() => {}}
              autoComplete="off"
              name="filter-form">
              <Row gutter={[32, 0]}>
                <Col xs={24} sm={24} md={16} lg={17} xl={20}>
                  <Form.Item name="search" label="">
                    <Input
                      prefix={<SearchOutlined className="site-form-item-icon" />}
                      placeholder="Search by User name"
                      onChange={debouncedResults}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={7} xl={4}>
                  <div className={styles['filter-col']}>
                    <Button
                      type="text"
                      onClick={openFilterRow}
                      icon={<img
                        src={filterImg}
                        alt="filter"
                        className={styles['filter-image']} />}>
                      &nbsp; &nbsp;
                      {filterProperty?.filter ? 'Reset' : 'Filter'}
                    </Button>
                  </div>
                </Col>
              </Row>
              {filterProperty?.filter &&
                <Row gutter={[32, 0]} className={styles["role-status-col"]}>
                  <Col span={4}>
                    <Form.Item name="role" label="">
                      <Select
                        placeholder="Role"
                        onChange={onChangeFilter}>
                        {roles_user?.map((role: any) =>
                          <Option value={role?.value} key={role?.name}>
                            {role?.name}
                          </Option>
                        )}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Form.Item name="status" label="">
                      <Select
                        placeholder="Select status"
                        onChange={onChangeFilter}
                      >
                        {user_status?.map((status: any) =>
                          <Option value={status?.value} key={status?.name}>
                            {status?.name}
                          </Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>}
            </Form>
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
            userPayRate={userPayRate}
          />
          <ViewUserPayRate
            visibility={showViewUserPayRate}
            setVisibility={setViewUserPayRateVisibility}
            data={employee}
            userPayRate={userPayRate}
          />
        </div>
      )}
    </>
  );
};

export default Employee;
