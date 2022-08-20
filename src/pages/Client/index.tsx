import React, { useState } from "react";
import { Button, Card, Col, Dropdown, Form, Input, Menu, message, Row, Select, Table } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {  SearchOutlined,FormOutlined, CheckCircleFilled, DeleteOutlined,CloseCircleFilled } from "@ant-design/icons"

// import SubMenu from "antd/lib/menu/SubMenu";

import routes from "../../config/routes";
import { authVar } from "../../App/link";

import Status from "../../components/Status";
import ModalConfirm from "../../components/Modal";
import constants, { status } from '../../config/constants';

import archiveImg from "../../assets/images/archive_btn.svg";
import filterImg from "../../assets/images/filter.svg"

import { notifyGraphqlError } from "../../utils/error";

import { Client as IClient, ClientPagingResult, ClientStatus, MutationClientUpdateArgs, QueryClientArgs, User } from "../../interfaces/generated";

import styles from "./style.module.scss";
import ArchiveBody from "../../components/Archive";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import PageHeader from "../../components/PageHeader";
import { debounce } from "lodash";
import { downloadCSV } from "../../utils/common";

export interface UserData {
  User: {
    data: User[];
    paging: {
      total: number;
    }
  };
}

export const CLIENT = gql`
  query Client($input: ClientQueryInput!) {
    Client(input: $input) {
      data {
        id
        name
        email
        invoicingEmail
        status
        archived
        phone
        invoiceSchedule
        invoice_payment_config_id
        address {
          country
          streetAddress
          state
          zipcode
          city
        }
      }
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }
    }
  }
`;

export const CLIENT_UPDATE = gql`
  mutation ClientUpdate($input: ClientUpdateInput!) {
    ClientUpdate(input: $input) {
      id
      name
      status
      archived
    }
  }
`;

const {Option} = Select;

const csvHeader: Array<{ label: string, key: string, subKey?: string }> = [
  { label: "Client Name", key: "name" },
  { label: "Email Address", key: "email" },
  { label: "Invoicing Email", key: "invoicingEmail"},
  { label: "Status", key: "status" },
]

const Client = () => {
  const loggedInUser = authVar();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>();
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const [filterForm] = Form.useForm();

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const { data: clientData, refetch: refetchClient } = useQuery<
    GraphQLResponse<'Client', ClientPagingResult>,
    QueryClientArgs
  >(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [fetchDownloadData, { data: clientDownloadData }] = useLazyQuery<GraphQLResponse<'Client', ClientPagingResult>, QueryClientArgs>(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(clientDownloadData?.Client?.data, csvHeader, 'Client.csv')
    }
  });


  const [clientUpdate, { loading: updateLoading }] = useMutation<
    GraphQLResponse<'ClientUpdate', IClient>,
    MutationClientUpdateArgs
  >(
    CLIENT_UPDATE,
    {
      onCompleted() {
        message.success({
          content: `Client is updated successfully!`,
          className: "custom-message",
          type: 'success',
        });
        setArchiveVisibility(false);
      },

      onError(err) {
        setArchiveVisibility(false);
        notifyGraphqlError(err);
      },

      update(cache) {
        const normalizedId = cache.identify({
          id: client?.id,
          __typename: "Client",
        });
        cache.evict({ id: normalizedId });
        cache.gc();
      },
    }
  );

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {
            company_id: loggedInUser?.company?.id ?? '',
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
  };

  const refetchClients = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status'])
    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      },
      query: {
        company_id: loggedInUser?.company?.id
      }
    }
    let query: {
      status?: string,
      archived?: boolean,
      company_id: string;
      search?: string;
    } = {
      company_id: loggedInUser?.company?.id as string

    }
    if (values.search) {
      query['search'] = values?.search
    }
    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') {
        query['status'] = values.status;
      } else {
        query['archived'] = values.status === 'Archived' ? true : false;

      }
    }

    input['query'] = query

    refetchClient({
      input: input
    })
  }

  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  const onChangeFilter = () => {
    refetchClients()
  }
  const changeStatus = (value: string, id: string) => {
    clientUpdate({
      variables: {
        input: {
          status: value as ClientStatus,
          id: id,
          company_id: loggedInUser?.company?.id as string,
        },
      },
    });
    refetchClient()
  };


  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchClient({
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: loggedInUser?.company?.id as string,
          }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }

  const archiveClient = () => {
    clientUpdate({
      variables: {
        input: {
          id: client?.id,

          archived: !client?.archived,

          company_id: loggedInUser?.company?.id as string,
        },
      },
    });
  };

  const menu = (data: any) => (
    <Menu>
      {/* <SubMenu title="Change status" key="mainMenu"> */}
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
      {/* </SubMenu> */}
      <Menu.Divider />
      {/* 
      <Menu.Item key="edit">
        <div>
          <Link
            to={routes.editClient.path(
              loggedInUser?.company?.code ?? "1",
              data?.id ?? "1"
            )}
          >
            Edit Client
          </Link>
        </div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="archive">
        <div
          onClick={() => {
            setClient(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Client" : "Archive Client"}
        </div>
      </Menu.Item>*/}
    </Menu>
  );

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
      onCell: (data: any) => {
        return {
          onClick: () => {
            navigate(routes.viewClient.path(
              loggedInUser?.company?.code ?? "1",
              data?.id ?? "1"
            ))
          },
        };
      },
      className: styles["client-name"]
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Invoicing Email",
      dataIndex: "invoicingEmail",
      key: "invoicingEmail",
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
        // <div
        //   className={styles["dropdown-menu"]}
        //   onClick={(event) => event.stopPropagation()}
        // >
        //   <Dropdown
        //     overlay={menu(record)}
        //     trigger={["click"]}
        //     placement="bottomRight"
        //   >
        //     <div
        //       className="ant-dropdown-link"
        //       onClick={(e) => e.preventDefault()}
        //       style={{ paddingLeft: "1rem" }}
        //     >
        //       <MoreOutlined />
        //     </div>
        //   </Dropdown>
        // </div>
        <Row style={{ marginTop: '11px' }}>
          <Col>
            <div
              className={styles["table-icon"]}
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
          </Col>
          <Col>
            <Link
               to={routes.editClient.path(
                loggedInUser?.company?.code ?? "1",
                record?.id ?? "1"
              )}
              className={`${styles["table-icon"]} ${styles["table-edit-icon"]}`}
              title='Edit Client'
            >
              <FormOutlined />
            </Link>
          </Col>
          <Col>
           
                <div
                    onClick={() => {
                      setClient(record);
                      setArchiveVisibility(true);
                    }}
                    className={`${styles["table-icon"]} ${styles["table-archive-icon"]}`}
                  title='Archive Client'
                >
                  <DeleteOutlined />
                </div>
             
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <PageHeader
          title="Clients"
          extra={[
            <div className={styles["add-new-client"]} key="new-client">
              <Link
                to={routes.addClient.path(
                  loggedInUser?.company?.code
                    ? loggedInUser?.company?.code
                    : ""
                )}
              >
                Add New Client
              </Link>
            </div>
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
                  placeholder="Search by Client name"
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

              <Col span={5}>
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
        <Row className='container-row'>
          <Col span={24}>
            <Table
              dataSource={clientData?.Client?.data}
              loading={updateLoading}
              columns={columns}
              rowKey={(record) => record?.id}
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: clientData?.Client?.paging?.total,
                pageSize: constants.paging.perPage
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            {
              !!clientData?.Client?.data?.length && (
                <div className={styles['download-report']}>
                  <Button
                    type="link"
                    onClick={downloadReport}
                  >
                    Download Report
                  </Button>
                </div>
              )
            }</Col>
        </Row>
      </Card>

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={client?.archived ? "Unarchive" : "Archive"}
        modalBody={
          <ArchiveBody
            title={
              <>
                Are you sure you want to{" "}
                {client?.archived ? "unarchive" : "archive"}
                <strong> {client?.name}?</strong>
              </>
            }
            subText={`Client will ${client?.archived ? "" : "not"} be able to login to the system`}
          />
        }
        onOkClick={archiveClient}
      />
    </div>
  );
};

export default Client;
