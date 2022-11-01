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
import { TimesheetQueryInput, Timesheet, InvoiceSchedule} from '../../interfaces/generated';
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
      needGroupedTimesheet: true,
    },
  };

  const {
    data: timesheetData,
    loading: timesheetLoading,
    refetch: refetchTimesheet,
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

  const refetchTimesheets = () => {

    let values = filterForm.getFieldsValue(['search', 'role', 'status', 'date'])

    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      },

      query: {
        company_id: authData?.company?.id
      }

    }

    let query: {
      status?: string,
      archived?: boolean,
      search?: boolean,
      company_id: string;
      weekStartDate?: Date;
      weekEndDate?: Date;
    } = {
      company_id: authData?.company?.id as string
    }

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search
    }

    if (values?.date) {
      query['weekStartDate'] = values?.date[0]
      query['weekEndDate'] = values?.date[1]
    }
    input['query'] = query

    refetchTimesheet({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchTimesheets()
  }

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchTimesheet({
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: authData?.company?.id as string,
          }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }


  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

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
          return 'N/A';
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
            <Col xs={24} sm={24} md={16} lg={17} xl={20}>
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
                    {employee_timesheet_status?.map((status: any) =>
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name="date" label="">
                  <RangePicker bordered={false} onChange={onChangeFilter} />
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

