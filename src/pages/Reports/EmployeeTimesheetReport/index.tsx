import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Card, Button, Form, Row, Select, Col, DatePicker, Typography, Input } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { TimesheetQueryInput, RoleName } from '../../../interfaces/generated';
import { TimesheetPagingData } from '../../../interfaces/graphql.interface';
import { downloadCSV, secondsToHms } from '../../../utils/common';
import { notifyGraphqlError } from '../../../utils/error';
import { EMPLOYEE_TIMESHEET } from '../../EmployeeTimesheet';
import constants, { employee_timesheet_status } from '../../../config/constants';
import PageHeader from '../../../components/PageHeader';

import filterImg from '../../../assets/images/filter.svg';
const { Option } = Select;

const { RangePicker } = DatePicker;
const EmployeeTimesheetReport = () => {
  const authData = authVar();
  const company_id = authData.company?.id as string;
  const [pagingInput] = useState<{
    skip: number;
    currentPage: number;
  }>({
    skip: 0,
    currentPage: 1,
  });

  const [filterForm] = Form.useForm();

  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const input: TimesheetQueryInput = {
    paging: {
      skip: pagingInput.skip,
      take: constants.paging.perPage,
      order: ['weekStartDate:DESC'],
    },
    query: {
      company_id: company_id,
    },
  };

  const {
    data: timesheetData,
    refetch: refetchTimesheet,
  } = useQuery<TimesheetPagingData, { input: TimesheetQueryInput }>(EMPLOYEE_TIMESHEET, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input,
    },
    onError: notifyGraphqlError,
  });

  const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
    { label: 'Date', key: 'date' },
    { label: 'Employee Name', key: 'employee' },
    { label: 'Client Name', key: 'client' },
    { label: 'Total Time', key: 'durationFormat' },
    { label: 'Last Approved', key: 'lastApprovedAt' },
    { label: 'Invoiced amount', key: 'totalExpense' },
    { label: 'User Payrate amount', key: 'userPayRate' },
    { label: 'Status', key: 'status' },

  ];

  const tableBody = (timesheet:any) => {
    const tableRows = [];
    let timesheets: any = timesheet?.Timesheet?.data;

    for (const timesheet of timesheets) {
      const date = (timesheet?.weekStartDate + '-' + timesheet?.weekEndDate) ?? '-';
      const employee = timesheet?.user?.fullName ?? '-';
      const client = timesheet?.client?.name ?? '-';
      const durationFormat = secondsToHms(timesheet?.duration) ?? '-';
      const status = (timesheet?.status ?? '-');
      const totalExpense = (timesheet?.totalExpense ?? '-');
      const userPayRate = (timesheet?.userPayment ?? '-');
      const lastApprovedAt = (timesheet?.lastApprovedAt ?? '-');
      tableRows.push({
        date,employee, client, durationFormat, status, totalExpense, lastApprovedAt,userPayRate
      });
    }
    return tableRows;
  };
  const [fetchDownloadData] = useLazyQuery<
    TimesheetPagingData,
    { input: TimesheetQueryInput }
  >(EMPLOYEE_TIMESHEET, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    onError: notifyGraphqlError,
  });

  const downloadReport = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'date']);

    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },

      query: {
        company_id: authData?.company?.id,
      },
    };

    let query: {
      status?: string;
      archived?: boolean;
      search?: boolean;
      company_id: string;
      weekStartDate?: Date;
      weekEndDate?: Date;
    } = {
      company_id: authData?.company?.id as string,
    };

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    if (values?.date) {
      query['weekStartDate'] = values?.date[0];
      query['weekEndDate'] = values?.date[1];
    }
    input['query'] = query;

    fetchDownloadData({
      variables: {
        input: input
      },
    })
    .then((response) => {
      if(response.data){
      const csvBody = tableBody(response.data)
      downloadCSV(csvBody, csvHeader, 'EmployeeTimesheet.csv');
      }
    })
  };

  const refetchTimesheets = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'date']);

    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },

      query: {
        company_id: authData?.company?.id,
      },
    };

    let query: {
      status?: string;
      archived?: boolean;
      search?: boolean;
      company_id: string;
      weekStartDate?: Date;
      weekEndDate?: Date;
    } = {
      company_id: authData?.company?.id as string,
    };

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    if (values?.date) {
      query['weekStartDate'] = values?.date[0];
      query['weekEndDate'] = values?.date[1];
    }
    input['query'] = query;

    refetchTimesheet({
      input: input,
    });
  };

  const onChangeFilter = () => {
    refetchTimesheets();
  };

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchTimesheet({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
          query: {
            company_id: authData?.company?.id as string,
          },
        },
      });
    }
    filterForm.resetFields();
    setFilterProperty({
      filter: !filterProperty?.filter,
    });
  };

  const debouncedResults = debounce(() => {
    onChangeFilter();
  }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const dataSource = timesheetData?.Timesheet?.data ?? [];

  return (
    <div>
      <Card bordered={false}>
        <PageHeader
          title='Employee Timesheet Report'
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
                <Form.Item name='search' label=''>
                  <Input
                    prefix={<SearchOutlined className='site-form-item-icon' />}
                    placeholder='Search by name or client'
                    onChange={debouncedResults}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='status' label=''>
                  <Select placeholder='Select status' onChange={onChangeFilter}>
                    {employee_timesheet_status?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='date' label=''>
                  <RangePicker bordered={false} onChange={onChangeFilter} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        <div className='container-row'>
          {!authData.user?.roles?.includes(RoleName.TaskManager) &&
            (!!dataSource?.length ? (
              <Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
                Download Report
              </Button>
            ) : (
              <Typography.Text type='secondary'>No files to Download</Typography.Text>
            ))}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeTimesheetReport;
