import moment from 'moment';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Space, message, Popconfirm } from 'antd';
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import constants from '../../../../config/constants';
import { notifyGraphqlError } from '../../../../utils/error';
import { getWeekDays, getTimeFormat, checkRoles } from '../../../../utils/common';
import { authVar } from '../../../../App/link';
import { IGroupedTimeEntries } from '../../../../interfaces/common.interface';
import { MutationTimeEntriesApproveRejectArgs } from '../../../../interfaces/generated';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';

import ModalConfirm from '../../../../components/Modal';
import Delete from '../../../../components/Delete';
import TimeInput from '../TimeInput';

import deleteImg from '../../../../assets/images/delete_btn.svg';
import styles from './style.module.scss';

export const APPROVE_REJECT_TIME_ENTRIES = gql`
  mutation TimeEntryApproveReject($input: TimeEntryApproveRejectInput!) {
    TimeEntriesApproveReject(input: $input)
  }
`;

export const TIME_ENTRY_BULK_DELETE = gql`
  mutation TimeEntryBulkDelete($input: TimeEntryBulkDeleteInput!) {
    TimeEntryBulkDelete(input: $input) {
      id
    }
  }
`

interface IProps {
  startDate: string | Date;
  durationMap: any;
  groupedTimeEntries: IGroupedTimeEntries[];
  status: string;
  needAction?: boolean;
  deleteAction?: (a: string) => void;
  client_id: string;
  refetch: any;
  timesheet_id: string;
  isTimesheetSubmitted?: boolean;
  refetchCanGenerateInvoiceData?: any;
}

const TimeEntryDetails = (props: IProps) => {
  const authData = authVar();
  const company_id = authData?.company?.id as string;
  const userRoles = authData?.user?.roles ?? [];
  const weekDays = getWeekDays(props.startDate);
  const groupedTimeEntries = props.groupedTimeEntries;

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entriesToDelete, setEntriesToDelete] = useState<{ entryIds: string[], task_id: string }>({
    entryIds: [],
    task_id: ''
  });

  const canApproveReject = checkRoles({
    userRoles,
    expectedRoles: [constants.roles.CompanyAdmin, constants.roles.SuperAdmin, constants.roles.TaskManager]
  });

  const canDelete = checkRoles({
    userRoles,
    expectedRoles: [constants.roles.Employee]
  })

  const [approveRejectTimeEntries] = useMutation<
    GraphQLResponse<'TimeEntriesApproveReject', boolean>,
    MutationTimeEntriesApproveRejectArgs
  >(APPROVE_REJECT_TIME_ENTRIES, {
    onCompleted() {
      props.refetch();
      props?.refetchCanGenerateInvoiceData?.();
    }
  })

  const onApproveRejectTimeEntriesClick = (status: string, group: IGroupedTimeEntries) => {
    const ids = getEntryIdsFromGroup(group);

    approveRejectTimeEntries({
      variables: {
        input: {
          ids,
          approvalStatus: status,
          company_id,
          timesheet_id: props?.timesheet_id,
        },
      },
    })
  }

  const [deleteBulkTimeEntry, { loading: deleting }] = useMutation(TIME_ENTRY_BULK_DELETE, {
    onCompleted: () => {
      setEntriesToDelete({
        entryIds: [],
        task_id: ''
      });
      message.success('Entries deleted successfully!')
      setShowDeleteModal(false);
      props.refetch();
      props?.refetchCanGenerateInvoiceData?.();
    }
  });

  const onDeleteClick = (group: IGroupedTimeEntries) => {
    const ids = getEntryIdsFromGroup(group);
    setEntriesToDelete({
      entryIds: ids,
      task_id: group?.id
    });
    setShowDeleteModal(true);
  }

  const deleteTimeEntries = () => {
    props?.deleteAction?.(entriesToDelete?.task_id)
    if (entriesToDelete?.entryIds?.length) {
      deleteBulkTimeEntry({
        variables: {
          input: {
            ids: entriesToDelete?.entryIds,
            company_id: authData?.company?.id,
            created_by: authData?.user?.id,
            client_id: props.client_id,
          }
        }
      }).catch(notifyGraphqlError)
    } else {
      setEntriesToDelete({
        entryIds: [],
        task_id: ''
      });
      setShowDeleteModal(false);
    }
  }

  return (
    <>
      <div className={styles['detail-table']}>
        <table className={styles['main-table']}>
          <thead>
            <tr className={styles['table-header']}>
              <th>Project</th>
              {
                weekDays.map((day: any, index: number) => (
                  <th key={index}>
                    {moment(day).format('dd, MMM D')}
                  </th>
                ))
              }
              <th>Total</th>
              {
                props?.needAction && (
                  <th>
                    Actions
                  </th>
                )
              }
            </tr>
          </thead>

          <tbody>
            {
              groupedTimeEntries && groupedTimeEntries?.map((group: IGroupedTimeEntries, index: number) => (
                <tr
                  key={index}
                >
                  <td className={styles['detail-name']}>
                    {group?.project}
                  </td>

                  {
                    weekDays.map((date: any, timeIndex: number) => {
                      const entries = group?.entries[date];
                      const duration = getTotalTimeForADay(entries);

                      return (
                        <td
                          key={timeIndex}
                        >
                          {
                            (['Approved', 'Rejected'].includes(props.status) || canApproveReject || props.isTimesheetSubmitted || authData?.user?.roles.includes(constants.roles.BookKeeper) ||  authData?.user?.entryType === 'CICO') ? (
                              <div className={styles['entry-duration']}>
                                { entries ? getTimeFormat(duration) : '-' }
                              </div>
                            ) : (
                              <TimeInput 
                                status={props.status}
                                date={date}
                                project_id={group.project_id}
                                entries={entries}
                                duration={entries ? duration : undefined}
                                timesheet_id={props.timesheet_id}
                                refetch={props.refetch}
                              />
                            )
                          }
                        </td>
                      )
                    })
                  }

                  <td>
                    <span className={styles['entry-duration']}>
                      {getTotalTimeByTask(group?.entries)}
                    </span>
                  </td>


                  {
                    props?.needAction && (
                      <td>
                        {
                          !props.isTimesheetSubmitted && canDelete && ['Pending'].includes(props.status) && (
                            <CloseCircleOutlined
                              className={styles['delete-entry']}
                              onClick={() => onDeleteClick(group)}
                            />
                          )
                        }

                        <Space>
                          {
                            canApproveReject && ['Pending', 'Approved'].includes(props.status) && props.isTimesheetSubmitted &&(
                              <Popconfirm
                                placement="left"
                                title="Are you sure you want to reject timesheet?"
                                onConfirm={() => {
                                  onApproveRejectTimeEntriesClick('Rejected', group)
                                }}
                                okText="Yes" cancelText="No"
                              >
                                <CloseCircleOutlined
                                  title='Reject timesheet'
                                  className={styles['reject-entry']}
                                />
                              </Popconfirm>
                            )
                          }

                          {
                            canApproveReject && ['Pending', 'Rejected'].includes(props.status) && props.isTimesheetSubmitted && (
                              <Space>
                                <Popconfirm
                                  placement="left"
                                  title="Are you sure you want to approve timesheet?"
                                  onConfirm={() => {
                                    onApproveRejectTimeEntriesClick('Approved', group)
                                  }}
                                  okText="Yes" cancelText="No"
                                >
                                  <CheckCircleOutlined
                                    title='Approve timesheet'
                                    style={{ color: 'var(--primary-green)' }}
                                    className={styles['approve-entry']}
                                  />
                                </Popconfirm>
                              </Space>
                            )
                          }
                        </Space>
                      </td>
                    )
                  }
                </tr>
              ))
            }
            <tr className={styles['table-total']}>
              <td>Total</td>
              {
                weekDays.map((day: any, index: number) => {
                  const formattedDay = moment(day).format('YYYY-MM-DD');
                  return (
                    <td key={index}>
                      {
                        props?.durationMap?.[formattedDay]
                          ? getTimeFormat(props?.durationMap?.[formattedDay])
                          : '-'
                      }
                    </td>
                  )
                })
              }
              <td>
                {getTotalTimeFromDurationMap(props?.durationMap ?? {})}
              </td>

              {
                props?.needAction && (
                  <td>
                  </td>
                )
              }
            </tr>
          </tbody>
        </table>
      </div>
      <ModalConfirm
        visibility={showDeleteModal}
        setModalVisibility={setShowDeleteModal}
        imgSrc={deleteImg}
        okText="Delete"
        onOkClick={deleteTimeEntries}
        loading={deleting}
        modalBody={
          <Delete
            title="Are you sure you want to delete the current time entry?"
            subText="Your current time tracking will be deleted."
          />
        }
      />
    </>
  )
}

function getTotalTimeFromDurationMap(durationMap: any): string {
  let sum = 0;
  for (let date in durationMap) {
    sum += durationMap[date];
  }

  return getTimeFormat(sum);
}

function getTotalTimeForADay(entries: any) {
  let sum = 0;
  if (entries) {
    const durations = entries.map((data: any) => data?.duration)
    sum = durations.reduce((entry1: any, entry2: any) => {
      return entry1 + entry2;
    }, 0);
  };
  return sum
}

function getTotalTimeByTask(entries: any) {
  let durations: any = [];
  const data = Object.values(entries);
  data.forEach((tasks: any) => {
    tasks.forEach((data: any) => {
      durations.push(data?.duration)
    })
  });
  let sum = durations.reduce((entry1: any, entry2: any) => {
    return entry1 + entry2
  }, 0);
  return getTimeFormat(sum)
}

function getEntryIdsFromGroup(group: IGroupedTimeEntries): string[] {
  const entriesObj = group.entries;
  const ids: string[] = [];
  for (let date in entriesObj) {
    for (let entry of entriesObj[date]) {
      ids.push(entry.id);
    }
  }

  return ids;
}

export default TimeEntryDetails;
