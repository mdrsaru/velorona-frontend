import { debounce } from 'lodash';
import React, { useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { DownloadOutlined } from '@ant-design/icons';
import { Card, Button, Col, Form, Row, Select, Typography } from 'antd';

import { USER } from '../../Employee';
import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import PageHeader from '../../../components/PageHeader';
import { roles_user, status, archived } from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { UserPagingResult, QueryUserArgs } from '../../../interfaces/generated';

import filterImg from '../../../assets/images/filter.svg';
import { notifyGraphqlError } from '../../../utils/error';

const { Option } = Select;


const EmployeeReport = () => {
  const loggedInUser = authVar();
  const [filterForm] = Form.useForm();
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });
  const {
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
      company_id:string;
    } = {
      company_id:loggedInUser?.company?.id as string
    };

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

  const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
    { label: 'FullName', key: 'fullName' },
    { label: 'Email', key: 'email' },
    { label: 'Phone', key: 'phone' },
    { label: 'Designation', key: 'designation' },
    { label: 'Country', key: 'country' },
    { label: 'State', key: 'state' },
    { label: 'City', key: 'city' },
    { label: 'Street Address', key: 'streetAddress' },
    { label: 'Apartment', key: 'aptOrSuite' },
    { label: 'Zip Code', key: 'zipcode' },
    { label: 'Status', key: 'status' },
    { label: 'Role', key: 'role' },
    { label: 'Manager Id', key: 'manager' },
    { label: 'Start Date', key: 'startDate' },
    { label: 'End Date', key: 'endDate' },
  ];


  const tableBody = (employeeData:any) => {
    const tableRows = [];
    let users: any = employeeData?.User?.data;

      for (const user of users) {
        const fullName = user?.fullName ?? '-';
        const email = user?.email;
        const phone = (user?.phone ?? '-');
        const designation = (user?.designation ?? '-');
        const country = (user?.address?.country ?? '-');
        const state = (user?.address?.streetAddress ?? '-');
        const city = (user?.address?.city ?? '-');
        const aptOrSuite = (user?.address?.aptOrSuite ?? '-');
        const streetAddress = (user?.address?.streetAddress ?? '-');
        const zipcode = (user?.address?.zipcode ?? '-');
        const status = user?.status;
        const role = (user?.roles?.[0]?.name ?? '-');
        const manager = (user?.manager?.fullName ?? '-');
        const startDate = (user?.startDate ?? '-');
        const endDate = (user?.endDate ?? '-');
        tableRows.push({
          fullName, email, phone, designation, country, state, city, aptOrSuite, streetAddress, zipcode, status, role, manager, startDate, endDate
        });
      }
      return tableRows;
    };

  const [fetchDownloadData] = useLazyQuery<
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
  onError:notifyGraphqlError
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
      company_id:string;
    } = {
				company_id: loggedInUser?.company?.id as string,
    };

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
    }).then((response) => {
      const csvBody = tableBody(response.data);
      downloadCSV(csvBody, csvHeader, 'Users.csv');
    })
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
