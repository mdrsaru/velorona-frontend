import { Card, Row, Col, Table, Dropdown, Menu, message, Input, Button, Select, Form, Avatar, Tabs, Popconfirm, Image } from "antd"
import { SearchOutlined, FormOutlined, CheckCircleFilled, DeleteOutlined, UserOutlined, FileSyncOutlined, CloseCircleFilled, MailOutlined } from "@ant-design/icons"

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
import PayRateImg from "../../assets/images/pay-rate.svg"
import constants, { roles_user, status } from "../../config/constants"

import RouteLoader from "../../components/Skeleton/RouteLoader";
import UserPayRateModal from "../../components/UserPayRate";
import ViewUserPayRate, { USER_PAY_RATE } from "../../components/ViewUserPayRate";
import { GraphQLResponse, UserPayRatePagingData } from "../../interfaces/graphql.interface";
import {
  QueryUserArgs,
  // RoleName, 
  UserPagingResult,
  UserStatus,
} from "../../interfaces/generated";
import styles from "./style.module.scss";
import { debounce } from "lodash";
import PageHeader from "../../components/PageHeader";

// const { SubMenu } = Menu;
const { Option } = Select;
const { TabPane } = Tabs;

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
        designation
        manager{
        id 
        fullName 
        }
        manager_id
        archived
        avatar_id
        entryType
        startDate
        endDate
        loggedIn
        timesheet_attachment
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
          country
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
      timesheet_attachment
      startDate
      endDate
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

export const RESEND_INVITATION = gql`
  mutation ResendInvitation($input: ResendInvitationInput!) {
    ResendInvitation(input: $input)
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

  const [resendInvitation] = useMutation(RESEND_INVITATION, {
    onCompleted: () => {
      message.success('Resend invitation successful')
    },
    onError(err) {
      notifyGraphqlError(err)
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
  const [showChangeClient, setShowChangeClient] = useState<boolean>(false);
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

  const ChangeClient = () => {
    return (
      <div className={styles["modal-message"]}>
        <div>
          <img src={archiveImg} alt="archive-confirm" />
        </div>{" "}
        <br />
        <p>
          Are you sure you want to{" "}
          change client
          <strong> {employee.activeClient?.name}? </strong>
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
          query: {
            company_id: loggedInUser?.company?.id,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      },
    }
  );

  const archiveUnarchiveUser = () => {
    let key = "archive";

    const archived = !employee?.archived;

    employeeArchive({
      variables: {
        input: {
          id: employee?.id,
          archived,
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

  const changeClient = () => {
    navigate(routes.attachClient.path(
      loggedInUser?.company?.code ?? "1",
      employee?.id ?? "1"
    ))
  };


  const changeStatus = (value: string, id: string) => {
    let key = "status";
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

  const onChangeTabs = (keys: any) => {

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


    if (keys === 'archived') {
      query['archived'] = true
    }

    if (keys === 'active') {
      query['status'] = 'Active'
    }

    if (query) {
      input['query'] = query
    }
    refetchEmployee({
      input: input
    })
  }

  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const handleResendInvitation = (record: any) => {
    console.log(record.id)
    resendInvitation({
      variables: {
        input: {
          user_id: record?.id,
          company_id: loggedInUser?.company?.id,
        },
      },
    })
  }
  const menu = (data: any) => {
    return (
      <Menu>
        {/* {
          data?.id !== loggedInUser?.user?.id && (
            <SubMenu title="Change status" key="mainMenu"> */}
        <Menu.Item
          key="active"
          onClick={() => {
            if (data?.status === "Inactive" || data?.status === 'InvitationSent') {
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
            if (data?.status === "Active" || data?.status === 'InvitationSent') {
              changeStatus("Inactive", data?.id);
            }
          }}
        >
          Inactive
        </Menu.Item>
        {/* </SubMenu>
          )
        } */}

        {/* <Menu.Divider />
        {
          data.roles[0]?.name === constants.roles.Employee ?

            data?.activeClient ?

              (<Menu.Item key="changeClient">
                <div
                  onClick={() => {
                    setEmployee(data);
                    setShowChangeClient(true)
                  }}
                >

                  Change Client
                </div>
              </Menu.Item>
              )
              :
              (<Menu.Item key="attachClient">
                <div>
                  <Link
                    to={routes.attachClient.path(
                      loggedInUser?.company?.code ?? "1",
                      data?.id ?? "1"
                    )}
                  >
                    Add Client
                  </Link>
                </div>
              </Menu.Item>
              )
            :
            <>
            </>
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
        } */}
      </Menu>
    )
  };

  const columns = [
    {
      title: "Name",
      key: "fullName",
      dataIndex: "fullName",
      // sortDirections: ['descend', 'ascend'],
      // sorter: (a:any, b:any) => a.fullName.localeCompare(b.fullName),
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
      title: "Active Client",
      dataIndex: "activeClient",
      render: (activeClient: any) => {
        return <span>{activeClient?.name ?? '-'}</span>;
      },
    },
    {
      title: "Pay Rate",
      render: (user: any) => {
        return (
        <>
          {user.roles[0]?.name === constants.roles.Employee ?
            (
              <div
                onClick={() => handleViewPayRate(user)}
                className={styles["add-pay-rate"]}>
                View Employee PayRate
              </div>
            )
            :
            (<>-</>)
          }
        </>
        )
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      // sorter: (a:any, b:any) => a.  .localeCompare(b.status),
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
      render: (record: any) => {
        return (
          <Row style={{ marginTop: '11px' }}>
            {!record.archived ? (
              <>
                {record.roles[0]?.name === constants.roles.Employee &&
                  <Col>
                    <p
                      onClick={() => handleUserPayRate(record)}
                      className={`${styles["table-payrate-icon"]}`}
                      title='Add Employee Payrate'
                    >
                      <Image src={PayRateImg} width='2rem' preview={false}/>
                    </p>
                  </Col>
                }

                {!record.loggedIn && <Col>
                  <Popconfirm
                    placement="left"
                    title={`Are you sure you want to resend invitation to ${record.fullName}?`}
                    onConfirm={() => handleResendInvitation(record)}
                    okText="Yes" cancelText="No"
                  >
                    <div
                      className={`${styles["table-icon"]} ${styles["table-unarchive-icon"]}`}
                      title='Resend Invitation'
                    >
                      <MailOutlined />
                    </div>
                  </Popconfirm>
                </Col>
                }
                <Col>
                  {
                    record?.id !== loggedInUser?.user?.id && (<div
                      className={`${styles["table-icon"]} ${styles["table-status-icon"]}`}
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
                          title='Change Status'
                        >
                          {record?.status === 'Active' ?
                            <div className={styles["table-inactive-status-icon"]} >
                              <CloseCircleFilled />
                            </div>
                            :
                            <div className={styles["table-active-status-icon"]}>

                              <CheckCircleFilled />
                            </div>
                          }
                        </div>
                      </Dropdown>
                    </div>
                    )}
                </Col>
                <Col>
                  {
                    record.roles[0]?.name === constants.roles.Employee ?

                      record?.activeClient ?

                        (
                          <div
                            onClick={() => {
                              setEmployee(record);
                              setShowChangeClient(true)
                            }}
                            title='Edit Client'
                            className={`${styles["table-icon"]} ${styles["table-client-icon"]}`}
                          >

                            <Avatar size="small" icon={<UserOutlined />}  />
                          </div>
                        )
                        :
                        (
                          <div>
                            <Link
                              to={routes.attachClient.path(
                                loggedInUser?.company?.code ?? "1",
                                record?.id ?? "1"
                              )}
                              title='Add Client'
                              className={`${styles["table-icon"]} ${styles["table-client-icon"]}`}
                            >
                              <Avatar size="small" icon={<UserOutlined />} />

                            </Link>
                          </div>
                        )
                      :
                      <>
                      </>
                  }
                </Col>
                <Col>
                  <Link
                    to={routes.editEmployee.path(
                      loggedInUser?.company?.code ?? "1",
                      record?.id ?? "1"
                    )}
                    className={`${styles["table-icon"]} ${styles["table-edit-icon"]}`}
                    title='Edit User'
                  >
                    <FormOutlined />
                  </Link>
                </Col>

                <Col>
                  {
                    record?.id !== loggedInUser?.user?.id && (
                      <div
                        onClick={() => {
                          setEmployee(record);
                          setArchiveVisibility(true);
                        }}
                        className={`${styles["table-icon"]} ${styles["table-archive-icon"]}`}
                        title='Archive User'
                      >
                        <DeleteOutlined />
                      </div>
                    )
                  }
                </Col>
              </>
            ) :
              (
                <Col>
                  {
                    record?.id !== loggedInUser?.user?.id && (
                      <div
                        onClick={() => {
                          setEmployee(record);
                          setArchiveVisibility(true);
                        }}
                        className={`${styles["table-icon"]} ${styles["table-unarchive-icon"]}`}
                        title='Unarchive User'
                      >
                        <FileSyncOutlined />
                      </div>
                    )
                  }
                </Col>
              )
            }
          </Row>
        )
      }

    },
  ];

  return (
    <>
      {employeeLoading ? (
        <RouteLoader />
      ) : (
        <div className={styles["main-div"]}>
          <Card bordered={false}>
            <PageHeader
              title="Users"
              extra={[
                <>

                  <div className={styles["add-new-employee"]} key="new-employee">
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
                </>
              ]}
            />
            <Form
              form={filterForm}
              layout="vertical"
              onFinish={() => { }}
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
                  <Col xs={24} sm={12} md={10} lg={8} xl={5}>
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
                  <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                    <Form.Item name="status" label="">
                      <Select
                        placeholder="Select status"
                        onChange={onChangeFilter}
                      >
                        {status?.map((status: any) =>
                          <Option value={status?.value} key={status?.name}>
                            {status?.name}
                          </Option>)}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>}
            </Form>

            <Tabs defaultActiveKey="1" onChange={onChangeTabs}>
              <TabPane tab="All Users" key="all">
              </TabPane>
              <TabPane tab="Active Users" key="active">
              </TabPane>
              <TabPane tab="Archived Users" key="archived">
              </TabPane>
            </Tabs>

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
            onOkClick={archiveUnarchiveUser}
          />

          <ModalConfirm
            visibility={showChangeClient}
            setModalVisibility={setShowChangeClient}
            imgSrc={archiveImg}
            okText={"Change Client"}
            modalBody={<ChangeClient />}
            onOkClick={changeClient}
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
