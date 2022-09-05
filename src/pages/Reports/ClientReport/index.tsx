import { debounce } from 'lodash';
import { useState } from 'react';
import { Button, Card, Row, Col, Form, Select, Typography } from 'antd';
import { useLazyQuery, useQuery } from '@apollo/client';
import { DownloadOutlined } from '@ant-design/icons';

// import SubMenu from "antd/lib/menu/SubMenu";

import { authVar } from '../../../App/link';

import { archived, status } from '../../../config/constants';

import filterImg from '../../../assets/images/filter.svg';

import { ClientPagingResult, QueryClientArgs, User } from '../../../interfaces/generated';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { downloadCSV } from '../../../utils/common';
import { CLIENT } from '../../Client';
import PageHeader from '../../../components/PageHeader';

export interface UserData {
  User: {
    data: User[];
    paging: {
      total: number;
    };
  };
}

const { Option } = Select;

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  { label: 'Client Name', key: 'name' },
  { label: 'Email Address', key: 'email' },
  { label: 'Invoicing Email', key: 'invoicingEmail' },
  { label: 'Status', key: 'status' },
];

const ClientReport = () => {
  const loggedInUser = authVar();
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const [filterForm] = Form.useForm();

  const { data: clientData, refetch: refetchClient } = useQuery<
    GraphQLResponse<'Client', ClientPagingResult>,
    QueryClientArgs
  >(CLIENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
        },
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
  });

  const [fetchDownloadData, { data: clientDownloadData }] = useLazyQuery<
    GraphQLResponse<'Client', ClientPagingResult>,
    QueryClientArgs
  >(CLIENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
        },
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(clientDownloadData?.Client?.data, csvHeader, 'Client.csv');
    },
  });

  const downloadReport = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'archived']);
    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },
      query: {
        company_id: loggedInUser?.company?.id,
      },
    };
    let query: {
      status?: string;
      archived?: boolean;
      company_id: string;
      search?: string;
    } = {
      company_id: loggedInUser?.company?.id as string,
    };
    if (values.search) {
      query['search'] = values?.search;
    }
    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') query['status'] = values.status;
    }

    if (values.archived) query['archived'] = values.archived;

    input['query'] = query;

    fetchDownloadData({
      variables: {
        input: input
      },
    });
  };

  const refetchClients = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'archived']);
    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },
      query: {
        company_id: loggedInUser?.company?.id,
      },
    };
    let query: {
      status?: string;
      archived?: boolean;
      company_id: string;
      search?: string;
    } = {
      company_id: loggedInUser?.company?.id as string,
    };
    if (values.search) {
      query['search'] = values?.search;
    }
    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') query['status'] = values.status;
    }

    if (values.archived) query['archived'] = values.archived;

    input['query'] = query;

    refetchClient({
      input: input,
    });
  };

  const onChangeFilter = () => {
    refetchClients();
  };

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchClient({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
          query: {
            company_id: loggedInUser?.company?.id as string,
          },
        },
      });
    }
    filterForm.resetFields();
    setFilterProperty({
      filter: !filterProperty?.filter,
    });
  };

  return (
    <div>
      <Card bordered={false}>
        <PageHeader
          title='Clients Report'
          extra={[
            <Button key='btn-filter' type='text' onClick={openFilterRow} icon={<img src={filterImg} alt='filter' />}>
              &nbsp; &nbsp;
              {filterProperty?.filter ? 'Reset' : 'Filter'}
            </Button>,
          ]}
        />

        <Form form={filterForm} layout='vertical' onFinish={() => {}} autoComplete='off' name='filter-form'>
          {filterProperty?.filter && (
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='status' label=''>
                  <Select placeholder='Select status' onChange={onChangeFilter}>
                    {status?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='archived' label=''>
                  <Select placeholder='Archive Status' onChange={onChangeFilter}>
                    {archived?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        <Row>
          <Col span={24}>
            {!!clientData?.Client?.data?.length ? (
              <Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
                Download Report
              </Button>
            ) : (
              <Typography.Text type='secondary'>No files to Download</Typography.Text>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ClientReport;
