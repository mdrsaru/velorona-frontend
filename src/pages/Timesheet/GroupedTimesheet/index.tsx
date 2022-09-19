import moment from 'moment';
import { useMemo } from 'react';
import { gql, useQuery, NetworkStatus } from '@apollo/client';
import {
  useParams,
  Link,
  useNavigate
} from 'react-router-dom';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import { Card, Col, Row, Button, Space, message, Modal, Form, Select, Spin, Collapse } from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { _cs, checkRoles } from '../../../utils/common';
import routes from '../../../config/routes';
import { notifyGraphqlError } from "../../../utils/error";
import constants from "../../../config/constants";
import { TimeEntry, QueryTimesheetArgs, TimeSheetPagingResult, MutationTimeEntriesApproveRejectArgs, Timesheet } from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { PROJECT } from '../../Project';
import { IGroupedTimeEntries } from '../../../interfaces/common.interface';

import TimeSheetLoader from '../../../components/Skeleton/TimeSheetLoader';
import InvoiceViewer from '../../../components/InvoiceViewer';
import ModalConfirm from '../../../components/Modal';

import TimesheetInformation from '../DetailTimesheet/TimesheetInformation';
import DetailTimesheet from '../DetailTimesheet';

import styles from './style.module.scss';

export const TIME_SHEET = gql`
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
        durationFormat
        lastApprovedAt
        lastSubmittedAt
        isSubmitted
        status
        user {
          id
          email
          timesheet_attachment
        }
        client {
          id
          name
        }
        company {
          id
          name
        }
        approver {
          fullName
        }
        projectItems {
          project_id
          totalDuration
          totalExpense
          hourlyRate
        }
        durationMap
        timeEntries {
          ...timeEntry
        }
        entriesGroup {
          byInvoice {
            invoice_id
            entries {
              ...timeEntry
            }
          }
          byStatus {
            approvalStatus
            entries {
              ...timeEntry
            }
          }
        }
      }
    }
  }

  fragment timeEntry on TimeEntry {
    id
    startTime
    endTime
    duration
    description
    approvalStatus
    timesheet {
      id
    }
    project_id
    project {
      id
      name
    }
  }
`;

const { Panel } = Collapse;

const GroupedTimesheet = () => {
  let params = useParams()
  let navigate = useNavigate();
  const timesheet_id = params?.id as string;
  const { Option } = Select;


  const authData = authVar()
  const roles = authData?.user?.roles;
  const [form] = Form.useForm()

  const { data: timeSheetDetailData, loading: timesheetLoading, refetch: refetchTimeSheet, networkStatus } = useQuery<
    GraphQLResponse<'Timesheet', TimeSheetPagingResult>,
    QueryTimesheetArgs
  >(TIME_SHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id as string,
          ids: params?.id?.split(',') ?? [],
        },
        paging: {
          order: ['weekStartDate:DESC']
        }
      }
    },
    onCompleted: (response) => {
    }
  });

  const timesheet = timeSheetDetailData?.Timesheet?.data;

  const totalExpense = useMemo(() => {
    return timesheet?.reduce((acc, current) => {
      return acc + (current?.totalExpense ?? 0);
    }, 0)
  }, [timesheet])

  const details = useMemo(() => {
    const totalTimesheet = timesheet?.length ?? 0;

    if(!totalTimesheet) {
      return null;
    }

    const approvedDates = timesheet
      ?.filter((_timesheet) => _timesheet.lastApprovedAt)
      ?.map((_timesheet) => moment(_timesheet.lastApprovedAt))

    const submittedDates = timesheet
      ?.filter((_timesheet) => _timesheet.lastSubmittedAt)
      ?.map((_timesheet) => moment(_timesheet.lastSubmittedAt))

    return {
      ...(timesheet?.[0] ?? {}),
      totalExpense,
      weekStartDate: timesheet?.[totalTimesheet - 1]?.weekStartDate,
      weekEndDate: timesheet?.[0]?.weekEndDate,
      lastApprovedAt: approvedDates?.length ? moment.max(approvedDates) : null,
      lastSubmittedAt: submittedDates?.length ? moment.max(submittedDates) : null,
      isSubmitted: true,
    } 
  }, [timesheet, totalExpense]) as Timesheet;

  return (
    <>
      {
        (timesheetLoading && networkStatus !== NetworkStatus.refetch) ? <TimeSheetLoader /> : (
          <div className={styles['container']}>
            {
              !!details && (
                <div className={styles['timesheet-details']}>
                  <TimesheetInformation timesheet={details} /> 
                </div>
              )
            }

            {
              timesheet?.length === 1 ? (
                <DetailTimesheet 
                  timesheet={timesheet[0]}
                  refetchTimeSheet={refetchTimeSheet}
                />
              ) : timesheet?.map((_timesheet, index) => (
                <div key={_timesheet.id} style={{ marginBottom: 10 }}>
                  <Collapse collapsible="header" defaultActiveKey={index}>
                    <Panel header={`${_timesheet.weekStartDate} - ${_timesheet.weekEndDate}`} key={index}>
                    <DetailTimesheet 
                      timesheet={_timesheet}
                      refetchTimeSheet={refetchTimeSheet}
                    />
                    </Panel>
                  </Collapse>
                </div>
              ))
            }
          </div>
        )
      }
    </>
  )
}

export default GroupedTimesheet;
