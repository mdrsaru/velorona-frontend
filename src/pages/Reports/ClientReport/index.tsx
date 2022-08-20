import React, { useState } from "react";
import { Button, Card, Col, Dropdown, Form, Input, Menu, message, Row, Select, Table, Typography } from "antd";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import {DownloadOutlined} from "@ant-design/icons"


// import SubMenu from "antd/lib/menu/SubMenu";

import { authVar } from "../../../App/link";

import constants, { status } from '../../../config/constants';

import filterImg from "../../../assets/images/filter.svg"

import { notifyGraphqlError } from "../../../utils/error";

import { Client as IClient, ClientPagingResult, ClientStatus, MutationClientUpdateArgs, QueryClientArgs, User } from "../../../interfaces/generated";

import { debounce } from "lodash";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { downloadCSV } from "../../../utils/common";
import { CLIENT, CLIENT_UPDATE } from "../../Client";
import PageHeader from "../../../components/PageHeader";


export interface UserData {
  User: {
    data: User[];
    paging: {
      total: number;
    }
  };
}

const {Option} = Select;

const csvHeader: Array<{ label: string, key: string, subKey?: string }> = [
  { label: "Client Name", key: "name" },
  { label: "Email Address", key: "email" },
  { label: "Invoicing Email", key: "invoicingEmail"},
  { label: "Status", key: "status" },
]

const ClientReport = () => {
  const loggedInUser = authVar();
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
      
    </Menu>
  );

  return (
    <div >
      <Card bordered={false}>
        <PageHeader
          title="Clients Report"
          extra={[
            <Button
            key="btn-filter"

                  type="text"
                  onClick={openFilterRow}
                  icon={<img
                    src={filterImg}
                    alt="filter"
                  />}>
                  &nbsp; &nbsp;
                  {filterProperty?.filter ? 'Reset' : 'Filter'}
                </Button>
          ]}
        />

        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form">
          {filterProperty?.filter &&
            <Row gutter={[32, 0]}>

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
        <Row>
          <Col span={24}>
            {
              !!clientData?.Client?.data?.length ? (
                  <Button
                    type="link"
                    onClick={downloadReport}
                    icon={<DownloadOutlined />}
                  >
                    Download Report
                  </Button>
              ) :
              <Typography.Text type="secondary" >No files to Download</Typography.Text>
            }</Col>
        </Row>
      </Card>

    </div>
  );
};

export default ClientReport;
