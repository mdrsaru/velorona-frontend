import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Card, Table, Row, Col, Button } from 'antd';

import { authVar } from '../../App/link';
import constants from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';
import { TimesheetPagingData } from '../../interfaces/graphql.interface';
import { TimesheetQueryInput, Timesheet } from '../../interfaces/generated';
import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';

import styles from './style.module.scss';

const EMPLOYEE_TIMESHEET = gql`
  query EmployeeTimesheet($input: TimesheetQueryInput!) {
    Timesheet(input: $input) {
      paging {
        total
      }
      data {
        id
        durationFormat
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

const EmployeeTimesheet = () => {
  let csv: any;
  const authData = authVar();
  const company_id = authData.company?.id as string
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const {
    data: timesheetData,
    loading: timesheetLoading
  } = useQuery<TimesheetPagingData, { input: TimesheetQueryInput }>(
    EMPLOYEE_TIMESHEET, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id,
        },
      },
    },
    onError: notifyGraphqlError,
  },
  );

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const downloadReport = () => {
    const items = timesheetData?.Timesheet?.data ?? []
    const replacer = (key: string, value: string) => value === null ? '' : value
    const header = Object.keys(items[0])
    csv = [
      header.join(','),
      ...items.map((row: any) => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
    console.log(csv);
  }

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
      title: 'Total Quantity',
      dataIndex: 'durationFormat',
    },
    {
      title: 'Last Approved',
      dataIndex: 'lastApprovedAt',
      render: (lastApprovedAt: any) => {
        return <span>{lastApprovedAt ? lastApprovedAt : 'N/A'}</span>
      }
    },
    {
      title: 'Expense',
      dataIndex: 'totalExpense',
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
        return <span>
          {authData?.user?.roles.includes(constants.roles.TaskManager) ?
            <Link
              className={styles['invoice-link']}
              to={routes.detailTimesheet.path(authData?.company?.code as string, timesheet.id)}>
              Details
            </Link> :
            <Link
              className={styles['invoice-link']}
              to={routes.timesheetInvoice.path(authData?.company?.code as string, timesheet.id)}>
              Invoice
            </Link>}
        </span>
      }
    },
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader title="Employee Timesheet" />

        <Row>
          <Col span={24}>
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
          </Col>
          <Col>
            <Button type="primary" onClick={downloadReport}>
              Download Report
            </Button>
          </Col>
        </Row>
      </Card>
    </div>

  )
}

export default EmployeeTimesheet;
