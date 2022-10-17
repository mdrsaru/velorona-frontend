import moment from 'moment';
import uniq from 'lodash/uniq';
import { useMemo } from 'react';
import { gql, useQuery, NetworkStatus } from '@apollo/client';
import {
  useParams,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { Collapse, Button, Row } from 'antd';

import { round } from '../../../utils/common';
import { authVar } from '../../../App/link';
import routes from '../../../config/routes';
import {
  QueryTimesheetArgs,
  TimeSheetPagingResult,
  Timesheet,
  InvoiceSchedule,
  QueryCanGenerateInvoiceArgs,
  TimesheetStatus
} from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';

import TimeSheetLoader from '../../../components/Skeleton/TimeSheetLoader';

import TimesheetInformation from '../DetailTimesheet/TimesheetInformation';
import DetailTimesheet from '../DetailTimesheet';

import styles from './style.module.scss';

export const CAN_GENERATE_INVOICE = gql`
  query CanGenerateInvoice($input: TimeEntryPeriodicInput) {
    CanGenerateInvoice(input: $input)
  }
`

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
          fullName
          timesheet_attachment
        }
        client {
          id
          name
          invoiceSchedule
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
  const authData = authVar()
  const navigate = useNavigate();
  const [searchParams,] = useSearchParams();
  const company_id = authData?.company?.id as string;

  const period = searchParams.get('period') ?? InvoiceSchedule.Weekly;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

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
          company_id,
          ids: params?.id?.split(',') ?? [],
        },
        paging: {
          order: ['weekStartDate:DESC']
        }
      }
    },
  });

  const timesheet = timeSheetDetailData?.Timesheet?.data;
  const client = timesheet?.[0]?.client;

  const skipInvoiceQuery = !timesheet?.length || !period || period === InvoiceSchedule.Weekly

  const { data: canGenerateInvoiceData, refetch: refetchCanGenerateInvoiceData } = useQuery<
    GraphQLResponse<'CanGenerateInvoice', boolean>,
    QueryCanGenerateInvoiceArgs
  >(CAN_GENERATE_INVOICE, {
    skip: skipInvoiceQuery,
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        startDate: start as string,
        endDate: end as string,
        client_id: client?.id as string,
        user_id: timesheet?.[0]?.user?.id as string,
        company_id,
      }
    }
  })

  const totalExpense = useMemo(() => {
    const expense = timesheet?.reduce((acc, current) => {
      return acc + (current?.totalExpense ?? 0);
    }, 0) ?? 0;

    return round(expense, 2);
  }, [timesheet])

  const details = useMemo(() => {
    const totalTimesheet = timesheet?.length ?? 0;

    if(!totalTimesheet) {
      return null;
    }

    const statuses = timesheet?.map((ts) => ts.status) ?? [];
    const status = getStatus(statuses);

    const approvedDates = timesheet
      ?.filter((_timesheet) => _timesheet.lastApprovedAt)
      ?.map((_timesheet) => moment(_timesheet.lastApprovedAt))

    const submittedDates = timesheet
      ?.filter((_timesheet) => _timesheet.lastSubmittedAt)
      ?.map((_timesheet) => moment(_timesheet.lastSubmittedAt))

    return {
      ...(timesheet?.[0] ?? {}),
      totalExpense,
      weekStartDate: start ? start : timesheet?.[totalTimesheet - 1]?.weekStartDate,
      weekEndDate: end ? end : timesheet?.[0]?.weekEndDate,
      lastApprovedAt: approvedDates?.length ? moment.max(approvedDates) : null,
      lastSubmittedAt: submittedDates?.length ? moment.max(submittedDates) : null,
      isSubmitted: true,
      status,
    } 
  }, [timesheet, totalExpense, start, end]) as Timesheet;

  const generateInvoice = () => {
    const code = authData?.company?.code as string;
    const user_id = timesheet?.[0]?.user?.id;
    let link = routes.timesheetInvoice.path(code, '');

    link += `?client_id=${client?.id}&period=${period}&start=${start}&end=${end}&user_id=${user_id}`;

    navigate(link);
  }

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

            <>
              {
                canGenerateInvoiceData?.CanGenerateInvoice && (
                  <Row justify="end" style={{ marginBottom: 10 }}>
                    <Button onClick={generateInvoice}>
                      Generate Invoice
                    </Button>
                  </Row>
                )
              }
            </>

            {
              timesheet?.length === 1 ? (
                <DetailTimesheet 
                  period={period}
                  timesheet={timesheet[0]}
                  refetchTimeSheet={refetchTimeSheet}
                />
              ) : timesheet?.map((_timesheet, index) => (
                <div className={styles['collapse']} key={_timesheet.id} style={{ marginBottom: 16 }}>
                  <Collapse collapsible="header">
                    <Panel header={`${_timesheet.weekStartDate} - ${_timesheet.weekEndDate}`} key={index}>
                    <DetailTimesheet 
                      period={period}
                      timesheet={_timesheet}
                      refetchTimeSheet={refetchTimeSheet}
                      refetchCanGenerateInvoiceData={refetchCanGenerateInvoiceData}
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

function getStatus(statuses: string[]) {
  const status = uniq(statuses);

  if (status.length === 1) {
    return status[0];
  }

  if (status.includes(TimesheetStatus.PartiallyApproved)) {
    return TimesheetStatus.PartiallyApproved;
  }

  if (status.includes(TimesheetStatus.Rejected)) {
    return TimesheetStatus.Rejected;
  }

  if(status.length > 1) {
    return TimesheetStatus.PartiallyApproved;
  }

  return TimesheetStatus.Pending;

}

export default GroupedTimesheet;
