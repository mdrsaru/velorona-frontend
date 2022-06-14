import moment from 'moment';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { Card, Table, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { authVar } from '../../App/link';
import constants from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';
import { TimesheetPagingData } from '../../interfaces/graphql.interface';
import { TimesheetQueryInput, Timesheet } from '../../interfaces/generated';
import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';

import styles from './style.module.scss';
import { downloadCSV } from '../../utils/common';

const EMPLOYEE_TIMESHEET = gql`
  query EmployeeTimesheet($input: TimesheetQueryInput!) {
    Timesheet(input: $input) {
      paging {
        total
      }
      data {
        id
        durationFormat
        invoicedDuration
        invoicedDurationFormat
        totalExpense
        lastApprovedAt
        status
        user {
          fullName
        }
        client {
          name
        }
      }
    }
  }
`;

const csvHeader: Array<{ label: string, key: string, subKey?: string }> = [
  { label: "Employee Name", key: "client", subKey: "name" },
  { label: "Total Time", key: "durationFormat" },
  { label: "Status", key: "status" },
  { label: "Total Expense", key: "totalExpense" },
  { label: "Last Approved", key: "lastApprovedAt" }
]

const EmployeeTimesheet = () => {
  const authData = authVar();
  const company_id = authData.company?.id as string
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const input: TimesheetQueryInput = {
    paging: {
      skip: pagingInput.skip,
      take: constants.paging.perPage,
      order: ['weekStartDate:DESC'],
    },
    query: {
      company_id: company_id
    },
  };

  const {
    data: timesheetData,
    loading: timesheetLoading
  } = useQuery<TimesheetPagingData, { input: TimesheetQueryInput }>(
    EMPLOYEE_TIMESHEET,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      variables: {
        input,
      },
      onError: notifyGraphqlError,
    },
  );

  const [fetchDownloadData, { data: timesheetDownloadData }] = useLazyQuery<TimesheetPagingData,
    { input: TimesheetQueryInput }>(
      EMPLOYEE_TIMESHEET,
      {
        fetchPolicy: 'network-only',
        nextFetchPolicy: 'cache-first',
        onError: notifyGraphqlError,
        onCompleted: () => {
          downloadCSV(timesheetDownloadData?.Timesheet?.data, csvHeader, 'EmployeeTimesheet.csv')
        }
      },
    );

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    })
  };

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {
            company_id: company_id,
          }
        }
      }
    })
  };

  const dataSource = timesheetData?.Timesheet?.data ?? [];

  const columns = [
    {
      title: 'Employee Name',
      dataIndex: ['user', 'fullName'],
    },
    {
      title: 'Client',
      dataIndex: ['client', 'name'],
    },
    {
      title: 'Total Time',
      dataIndex: 'durationFormat',
    },
    {
      title: 'Invoiced Time',
      render: (timesheet: Timesheet) => {
        if (timesheet.invoicedDuration) {
          return timesheet.invoicedDurationFormat;
        }

        return '-';
      }
    },
    {
      title: 'Last Approved',
      dataIndex: 'lastApprovedAt',
      render: (lastApprovedAt: any) => {
        return <span>{lastApprovedAt ? moment(lastApprovedAt).format('LL') : 'N/A'}</span>
      }
    },
    {
      title: 'Expense',
      dataIndex: 'totalExpense',
      render: (totalExpense: number) => {
        return `$${totalExpense}`
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => {
        return <Status status={status} />
      }
    },
    {
      title: 'Action',
      render: (timesheet: Timesheet) => {
        return (
          <Link
            className={styles['invoice-link']}
            to={routes.detailTimesheet.path(authData?.company?.code as string, timesheet.id)}>
            Details
          </Link>
        )
      }
    },
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader title="Employee Timesheet" />
        <div className='container-row'>
          <Table
            loading={timesheetLoading}
            dataSource={dataSource}
            columns={columns}
            rowKey={(record => record.id)}
            pagination={{
              current: pagingInput.currentPage,
              onChange: changePage,
              total: timesheetData?.Timesheet?.paging?.total,
              pageSize: constants.paging.perPage
            }}
          />
          {
            !!dataSource?.length && (
              <div className={styles['download-report']}>
                <Button
                  type="link"
                  onClick={downloadReport}
                  icon={<DownloadOutlined />}
                >
                  Download Report
                </Button>
              </div>
            )
          }
        </div>
      </Card>
    </div>

  )
}

export default EmployeeTimesheet;

