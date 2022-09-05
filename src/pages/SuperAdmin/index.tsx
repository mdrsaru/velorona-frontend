import { useEffect, useState } from "react"
import { Card, PageHeader, Form, Row, Col, Input, Button, Select, Tabs, Table, Dropdown, Menu, message } from "antd"
import {FormOutlined, CheckCircleFilled, DeleteOutlined, SearchOutlined,CloseCircleFilled ,FileSyncOutlined} from "@ant-design/icons"
import { debounce } from "lodash"
import { Link, useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@apollo/client"

import constants, { status} from "../../config/constants"
import routes from "../../config/routes"
import { authVar } from '../../App/link';
import { UserPagingResult, QueryUserArgs, RoleName } from "../../interfaces/generated"
import { GraphQLResponse } from "../../interfaces/graphql.interface"
import { USER, USER_UPDATE } from "../Employee"
import { USER_ARCHIVE } from "../Employee"

import archiveImg from "../../assets/images/archive_btn.svg"
import filterImg from "../../assets/images/filter.svg"

import { notifyGraphqlError } from "../../utils/error"

import ModalConfirm from "../../components/Modal"
import ArchiveBody from "../../components/Archive"
import RouteLoader from "../../components/Skeleton/RouteLoader"

import styles from './styles.module.scss'

const {Option} = Select;
const {TabPane} = Tabs;

const SuperAdmin =() =>{
	const loggedInUser = authVar()
	const navigate = useNavigate();

	const [filterForm] = Form.useForm();

	const [employeeUpdate] = useMutation(USER_UPDATE);
	

	const [employee, setEmployee] = useState<any>("");

	const [showArchive, setArchiveModal] = useState<boolean>(false);

	const [filterProperty, setFilterProperty] = useState<any>({
		filter: false,
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
		  query:{
			role: RoleName.SuperAdmin,
		  }
        },
      },
    }
  );

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
      setArchiveModal(false);
    })
      .catch(notifyGraphqlError);
  };

  
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
    } = {
		role: RoleName.SuperAdmin,
	}

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
    } = {
		role: RoleName.SuperAdmin,
	}


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

  
  const menu = (data: any) => {
    return (
      <Menu>
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
     
      </Menu>
    )
  };

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
			       routes.viewSuperAdmin.path(
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
		  render: (record: any) => {
			return (
			  <Row style={{ marginTop: '11px' }}>
				{!record.archived ? (
              <>

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
                  <Link
                    to={routes.editSuperAdmin.path(
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
                          setArchiveModal(true);
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
                          setArchiveModal(true);
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

	return(
		<>
	  {employeeLoading ? (
        <RouteLoader />
      ) : (
        <div className={styles["main-div"]}>
          <Card bordered={false}>
            <PageHeader
              title="Super Admin"
              extra={[
                <>

                  <div className={styles["add-new-employee"]} key="new-employee">
                    <Link
                      to={routes.addSuperAdmin.path}
                    >
                      Add New Super Admin
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
              <br />
              {filterProperty?.filter &&
                <Row gutter={[32, 0]} className={styles["role-status-col"]}>
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
              <TabPane tab="All Super Admins" key="all">
              </TabPane>
              <TabPane tab="Active Super Admin" key="active">
              </TabPane>
              <TabPane tab="Archived Super Admin" key="archived">
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
		  </div>
	  )
			}

<ModalConfirm
            visibility={showArchive}
            setModalVisibility={setArchiveModal}
            imgSrc={archiveImg}
            okText={employee?.archived ? "Unarchive" : "Archive"}
			modalBody={
				<ArchiveBody
				  title={
					<>
					  Are you sure you want to{" "}
					  {employee?.archived ? "unarchive" : "archive"}
					  <strong> {employee?.name}</strong>
					</>
				  }
				  subText={`Project will ${employee?.archived ? "" : "not"} be able to assigned to any employee`}
				/>
			  }
            onOkClick={archiveUser}
          />

		</>
	)
}

export default SuperAdmin