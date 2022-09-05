import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { DownloadOutlined } from '@ant-design/icons';
import { Card, Button, Col, Form, Input, Row, Select, Typography } from 'antd';

import { USER } from '../../Employee';
import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import PageHeader from '../../../components/PageHeader';
import { roles_user, status, archived } from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { UserPagingResult, QueryUserArgs } from '../../../interfaces/generated';

import filterImg from '../../../assets/images/filter.svg';

const { Option } = Select;

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  { label: 'FullName', key: 'fullName' },
  { label: 'Email', key: 'email' },
  { label: 'Address', key: 'address', subKey: 'streetAddress' },
  { label: 'Phone', key: 'phone' },
  { label: 'Status', key: 'status' },
];

const EmployeeReport = () => {
  const loggedInUser = authVar();
  const [filterForm] = Form.useForm();
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });
  const {
    loading: employeeLoading,
    data: employeeData,
    refetch: refetchEmployee,
  } = useQuery<GraphQLResponse<'User', UserPagingResult>, QueryUserArgs>(USER, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
        },
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
  });

  const refetchEmployees = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'archived']);
    let input: {
      paging: any;
      query?: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },
    };
    let query: {
      status?: string;
      archived?: boolean;
      role?: string;
      search?: string;
    } = {};

    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') {
        query['status'] = values.status;
      }
    }

    if (values.archived) query['archived'] = values.archived;

    if (values.role) {
      query['role'] = values?.role;
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    if (query) {
      input['query'] = query;
    }
    refetchEmployee({
      input: input,
    });
  };

  const debouncedResults = debounce(() => {
    onChangeFilter();
  }, 600);

  const onChangeFilter = () => {
    refetchEmployees();
  };
  React.useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const [fetchDownloadData, { data: employeeDownloadData }] = useLazyQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(USER, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(employeeDownloadData?.User?.data, csvHeader, 'Users.csv');
    },
  });
  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchEmployee({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
        },
      });
    }
    filterForm.resetFields();
    setFilterProperty({
      filter: !filterProperty?.filter,
    });
  };

  const downloadReport = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'archived']);
    let input: {
      paging: any;
      query?: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },
    };
    let query: {
      status?: string;
      archived?: boolean;
      role?: string;
      search?: string;
    } = {};

    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') {
        query['status'] = values.status;
      }
    }

    if (values.archived) query['archived'] = values.archived;

    if (values.role) {
      query['role'] = values?.role;
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    if (query) {
      input['query'] = query;
    }

    fetchDownloadData({
      variables: {
        input: input
      },
    });
  };
  return (
    <div>
      <Card>
        <PageHeader
          title='Employee Report'
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
                <Form.Item name='role' label=''>
                  <Select placeholder='Role' onChange={onChangeFilter}>
                    {roles_user?.map((role: any) => (
                      <Option value={role?.value} key={role?.name}>
                        {role?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
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
        {!!employeeData?.User?.data?.length ? (
          <Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
            Download Report
          </Button>
        ) : (
          <Typography.Text type='secondary'>No files to Download</Typography.Text>
        )}
      </Card>
    </div>
  );
};

export default EmployeeReport;
