import moment from 'moment';
import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { Col, Row, Space, Input } from 'antd';
import {
  CloseCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import constants from '../../../../config/constants';
import { notifyGraphqlError } from '../../../../utils/error';
import { getWeekDays, getTimeFormat, checkRoles, _cs } from '../../../../utils/common';
import { authVar } from '../../../../App/link';
import { IGroupedTimeEntries } from '../../../../interfaces/common.interface';
import { MutationTimeEntriesApproveRejectArgs } from '../../../../interfaces/generated';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';

import ModalConfirm from '../../../../components/Modal';
import Delete from '../../../../components/Delete';
import EditTimeSheet from '../../EditTimesheet';

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
  client_id: string;
  refetch: any;
}

const TimeEntryDetails = (props: IProps) => {
  const authData = authVar();
  const company_id = authData?.company?.id as string;
  const userRoles = authData?.user?.roles ?? [];
  const weekDays = getWeekDays(props.startDate);
  const groupedTimeEntries = props.groupedTimeEntries;

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entriesToDelete, setEntriesToDelete] = useState<undefined | string[]>();
  const [selectedGroup, setSelectedGroup] = useState<any>();

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
    }
  })

  const refetchGroups = () => {
    props?.refetch()
  }

  const onApproveRejectTimeEntriesClick = (status: string, group: IGroupedTimeEntries) => {
    const ids = getEntryIdsFromGroup(group);

    approveRejectTimeEntries({
      variables: {
        input: {
          ids,
          approvalStatus: status,
          company_id,
        },
      },
    })
  }

  const [deleteBulkTimeEntry, { loading: deleting }] = useMutation(TIME_ENTRY_BULK_DELETE, {
    onCompleted: () => {
      setEntriesToDelete(undefined);
      setShowDeleteModal(false);
      props.refetch();
    }
  });

  const onDeleteClick = (group: IGroupedTimeEntries) => {
    const ids = getEntryIdsFromGroup(group);
    setEntriesToDelete(ids);
    setShowDeleteModal(true);
  }

  const deleteTimeEntries = () => {
    if (entriesToDelete?.length) {
      deleteBulkTimeEntry({
        variables: {
          input: {
            ids: entriesToDelete,
            company_id: authData?.company?.id,
            created_by: authData?.user?.id,
            client_id: props.client_id,
          }
        }
      }).then((response) => {
      }).catch(notifyGraphqlError)
    }
  }

  const showEditTimesheet = (day: string, group: IGroupedTimeEntries, total: number) => {
    setShowEditModal(true);
    setSelectedGroup({
      day,
      group,
      total
    });
  }

  return (
    <>
      <Row>
        <Col span={24}>
          <div className={styles['resp-table']}>
            <div className={styles["resp-table-header"]}>
              <div className={styles['table-header-cell']}>
                Project
              </div>
              <div className={styles['table-header-cell']}>
                Task
              </div>

              {
                weekDays.map((day: any, index: number) => (
                  <div
                    className={styles['table-header-cell']}
                    key={index}
                  >
                    {moment(day).format('ddd, MMM D')}
                  </div>
                ))
              }
              <div className={styles['table-header-cell']}>
                Total
              </div>


              {
                props?.needAction && (
                  <div className={styles['table-header-cell']}>
                    Actions
                  </div>
                )
              }
            </div>

            {
              groupedTimeEntries && groupedTimeEntries?.map((group: IGroupedTimeEntries, index: number) => (
                <div
                  className={styles["resp-table-body"]}
                  key={index}
                >
                  <div className={styles["table-body-cell"]}>
                    {group?.project}
                  </div>
                  <div className={styles["table-body-cell"]}>
                    {group?.name}
                  </div>

                  {
                    weekDays.map((day: any, timeIndex: number) => (
                      <div
                        className={styles["table-body-cell"]}
                        key={timeIndex}
                      >
                        {
                          (['Approved', 'Rejected'].includes(props.status) || canApproveReject) ? (
                            <div>
                              {getTimeFormat(getTotalTimeForADay(group?.entries[moment(day).format('ddd, MMM D')]))}
                            </div>
                          ) : (
                            <Input
                              type="text"
                              onClick={() => showEditTimesheet(moment(day).format('YYYY-MM-DD'), group, getTotalTimeForADay(group?.entries[moment(day).format('ddd, MMM D')]))}
                              value={
                                getTimeFormat(getTotalTimeForADay(group?.entries[moment(day).format('ddd, MMM D')]))
                              }
                            />
                          )
                        }
                      </div>
                    ))
                  }

                  <div className={styles["table-body-cell"]}>
                    <span>
                      {getTotalTimeByTask(group?.entries)}
                    </span>
                  </div>


                  {
                    props?.needAction && (
                      <div className={styles["table-body-cell"]}>
                        {
                          canDelete && ['Pending'].includes(props.status) && (
                            <CloseCircleOutlined
                              className={styles['delete-entry']}
                              onClick={() => onDeleteClick(group)}
                            />
                          )
                        }

                        <Space>
                          {
                            canApproveReject && ['Pending', 'Approved'].includes(props.status) && (
                              <CloseCircleOutlined
                                className={styles['reject-entry']}
                                onClick={() => {
                                  onApproveRejectTimeEntriesClick('Rejected', group)
                                }}
                              />
                            )
                          }

                          {
                            canApproveReject && ['Pending', 'Rejected'].includes(props.status) && (
                              <Space>
                                <CheckCircleOutlined
                                  style={{ color: 'var(--primary-green)' }}
                                  className={styles['approve-entry']}
                                  onClick={() => {
                                    onApproveRejectTimeEntriesClick('Approved', group)
                                  }}
                                />
                              </Space>

                            )
                          }
                        </Space>
                      </div>
                    )
                  }
                </div>
              ))
            }
          </div>
        </Col>
      </Row>
      <Row>
        <Col
          span={24}
          className={styles['form-col']}
        >
          <div className={_cs([styles['resp-table'], styles['total-duration']])}>
            <div className={styles["resp-table-header"]}>
              <div className={styles['table-header-cell']}>
                Total
              </div>
              <div className={styles['table-header-cell']}>
              </div>
              {
                weekDays.map((day: any, index: number) => (
                  <div key={index} className={styles['table-header-cell']}>
                    {getTimeFormat(props?.durationMap?.[moment(day).format('YYYY-MM-DD')])}
                  </div>
                ))
              }
              <div className={styles['table-header-cell']}>
                {getTotalTimeFromDurationMap(props?.durationMap ?? {})}
              </div>

              {
                props?.needAction && (
                  <div className={styles['table-header-cell']}>
                  </div>
                )
              }
            </div>
          </div>
        </Col>
      </Row>

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

      <EditTimeSheet
        setVisibility={() => { setShowEditModal(false) }}
        visible={showEditModal}
        day={selectedGroup?.day}
        refetch={refetchGroups}
        total={selectedGroup?.total ?? 0}
        timesheetDetail={selectedGroup?.group ?? []}
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
