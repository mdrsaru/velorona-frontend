import { gql, useQuery } from "@apollo/client";

import { useNavigate } from "react-router-dom";
import { authVar } from "../../../App/link";

import { Table } from 'antd';

import routes from "../../../config/routes";
import styles from "./../style.module.scss";

export const TIME_WEEKLY = gql`
query Timesheet($input: TimesheetQueryInput!) {
  Timesheet(input: $input) {
    paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
    data {
      id
      weekStartDate
      weekEndDate
      totalExpense
      duration
      status
      durationFormat
      user {
        id
        email
      }
      client {
        id
        name
      }
      company {
        id
        name
      }
    }
  }
}`;

const WeeklyTimeSheet = () => {
  const authData = authVar();
  let navigate = useNavigate();

  const columns = [
    {
      title: 'Week',
      key: 'week',
      render: (record: any) =>
        <div>
          {record?.weekStartDate} - {record?.weekEndDate}
        </div>
    },
    {
      title: 'Client',
      key: 'client',
      render: (record: any) =>
        <div>
          {record?.client?.name}
        </div>
    },
    {
      title: 'Total Hours',
      key: 'duration',
      render: (record: any) =>
        <div>
          {record?.duration}
        </div>
    },
    {
      title: 'Total Expense',
      key: 'totalExpense',
      render: (record: any) =>
        <div>
          {record?.totalExpense}
        </div>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div
          className={styles['dropdown-menu']}
          onClick={(e) => {
            navigate(routes.detailTimesheet.path(authData?.company?.code ?? '', record?.id))
          }}>
          <span>View Details</span>
        </div>,
    },
  ];

  const { data: timeWeeklyEntryData } = useQuery(TIME_WEEKLY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id
        },
        paging: {
          order: ['weekStartDate:DESC']
        }
      }
    }
  });

  return (
    <Table
      dataSource={timeWeeklyEntryData?.Timesheet?.data}
      columns={columns}
      rowKey={record => record?.id}/>
  )
}

export default WeeklyTimeSheet;
