import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Card, Table, Button, Form, Row, Select, Col, Input, DatePicker } from 'antd';
import { SearchOutlined,EyeFilled } from '@ant-design/icons';

import { authVar } from '../../App/link';
import constants, { employee_timesheet_status } from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';
import { TimesheetPagingData } from '../../interfaces/graphql.interface';
import { TimesheetQueryInput, Timesheet, InvoiceSchedule, TimesheetQuery } from '../../interfaces/generated';
import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';

import filterImg from "../../assets/images/filter.svg"

import styles from './style.module.scss';
import { debounce } from 'lodash';
import TimeDuration from '../../components/TimeDuration';

const { Option } = Select;

export const EMPLOYEE_TIMESHEET = gql`
  query EmployeeTimesheet($input: TimesheetQueryInput!) {
    Timesheet(input: $input) {
      paging {
        total
      }
      data {
        id
        period
        durationFormat
        duration
        invoicedDuration
        invoicedDurationFormat
        totalExpense
        lastApprovedAt
        weekStartDate
        weekEndDate
        userPayment
        status
        invoiceStatus
        user {
          fullName
          email
        }
        client {
          name
        }
      }
    }
  }
`;

const { RangePicker } = DatePicker;

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

  const [queryInput, setQueryInput] = useState<TimesheetQuery>({
    company_id,
    needGroupedTimesheet: true,
  });

  const [filterForm] = Form.useForm();

  const [filter, setFilter] = useState<boolean>(false);

  const input: TimesheetQueryInput = {
    paging: {
      skip: pagingInput.skip,
      take: constants.paging.perPage,
      order: ['weekStartDate:DESC'],
    },
    query: queryInput,
  };

  const {
    data: timesheetData,
    loading: timesheetLoading,
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

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    })
  };

  const onFilterChange = () => {
    const values = filterForm.getFieldsValue(['search', 'role', 'status', 'date'])

    let query: TimesheetQuery = {
      company_id,
      needGroupedTimesheet: true,
    };

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search.trim();
    }

    if (values?.date) {
      query['weekStartDate'] = values?.date[0]
      query['weekEndDate'] = values?.date[1]
    }

    setQueryInput(query)
    setPagingInput({
      skip: 0,
      currentPage: 1,
    })
  }

  const toggleFilter = () => {
    if(filter) {
      setQueryInput({
        company_id,
        needGroupedTimesheet: true,
      });

      setPagingInput({
        skip: 0,
        currentPage: 1,
      });
    }

    setFilter((prev: boolean) => {
      return !prev;
    })
  }

  const debouncedResults = debounce(() => { onFilterChange() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const dataSource = timesheetData?.Timesheet?.data ?? [];
  const columns = [
    {
      title: 'Date',
      width: '20%',

      render: (timesheet: any) => {
        return <>{moment(timesheet?.weekStartDate).format('YYYY/MM/DD')}-{moment(timesheet?.weekEndDate).format('YYYY/MM/DD')}</>
      }
    },

    {
      title: 'Employee Name',
      dataIndex: ['user', 'fullName'],
    },
    {
      title: 'Employee Email',
      dataIndex: ['user', 'email'],
    },
    {
      title: 'Client',
      dataIndex: ['client', 'name'],
    },
    {
      title: 'Total Hours',
      key: 'duration',
      render: (record: any) =>
        <TimeDuration duration={record.duration} />
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
      title: 'Invoice Status',
      dataIndex: 'invoiceStatus',
      render: (status: string) => {
        if(!status) {
          return '-';
        }

        return (
          <>
            {
              status?.split(',')?.map((st, index) => (
                <>{ index ? ', ': '' }<Status status={st} /></>
              ))
            }
          </>
        )
      }
    },
    {
      title: 'Action',
      render: (timesheet: Timesheet) => {
        let link = routes.detailTimesheet.path(authData?.company?.code as string, timesheet?.id)
        if(timesheet.period === InvoiceSchedule.Biweekly || timesheet.period === InvoiceSchedule.Monthly || timesheet.period === InvoiceSchedule.Custom) {
          link += `?start=${timesheet.weekStartDate}&end=${timesheet.weekEndDate}&period=${timesheet.period}`;
        }

        return (
          <Link
            className={styles['invoice-link']}
            title='View Detail'
            to={link}>
            <EyeFilled  className={`${styles["table-icon"]} ${styles["table-view-icon"]}`}/>
          </Link>
        )
      }
    },
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader title="Employee Timesheet" />

        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form"
        >
          <Row gutter={[32, 0]}>
            <Col xs={24} sm={24} md={16} lg={16} xl={20}>
              <Form.Item name="search" label="">
                <Input
                  prefix={<SearchOutlined className="site-form-item-icon" />}
                  placeholder="Search by employee first name or client"
                  onChange={debouncedResults}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={8} lg={7} xl={4}>
              <div className={styles['filter-col']}>
                <Button
                  type="text"
                  onClick={toggleFilter}
                  icon={
                    <img
                    src={filterImg}
                    alt="filter"
                    className={styles['filter-image']} 
                  />
                  }
                >
                  &nbsp; &nbsp; { filter ? 'Reset' : 'Filter'}
                </Button>
              </div>
            </Col>
          </Row>
          <br />
          {filter &&
            <Row gutter={[32, 0]} className={styles["role-status-col"]}>

              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Form.Item name="status" label="">
                  <Select
                    placeholder="Select status"
                    onChange={onFilterChange}
                  >
                    {employee_timesheet_status?.map((status: any) =>
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={24} lg={10} xl={10}>
                <Form.Item name="date" label="">
                  <RangePicker bordered={false} onChange={onFilterChange} />
                </Form.Item>
              </Col>
            </Row>}
        </Form>
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
        </div>
      </Card>
    </div>

  )
}

export default EmployeeTimesheet;

