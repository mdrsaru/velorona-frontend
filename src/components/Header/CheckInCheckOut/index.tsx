import moment from 'moment';
import { useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal } from 'antd';

import { TIME_ENTRY_FIELDS } from '../../../gql/time-entries.gql';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { QueryTimeEntryArgs, TimeEntry, MutationTimeEntryUpdateArgs, TimeEntryPagingResult, EntryType } from '../../../interfaces/generated';
import { AUTH } from '../../../gql/auth.gql';
import { notifyGraphqlError } from '../../../utils/error';

import Digit from '../../../components/Digit';
import CheckInForm from '../CheckInForm';

import styles from './style.module.scss';

export const TIME_ENTRY = gql`
    ${TIME_ENTRY_FIELDS}
    query TimeEntry($input: TimeEntryQueryInput!) {
      TimeEntry(input: $input) {
        data {
          ...timeEntryFields
        }
        activeEntry {
          ...timeEntryFields
        }
      }
    }
`;

export const UPDATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FIELDS}
  mutation TimeEntryUpdate($input: TimeEntryUpdateInput!) {
    TimeEntryUpdate(input: $input) {
      ...timeEntryFields
    }
  }
`;

interface IProps{
  refetch?:any
}
const CheckInCheckOut = (props:IProps) => {
  const [activeEntry_id, setActiveEntry_id] = useState<string | null>(null)
  const [isCheckInVisible, setIsCheckInVisible] = useState(false)

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    reset,
  } = useStopwatch({ autoStart: false });

  const { data: authData } = useQuery(AUTH)

  const company_id = authData.AuthUser.company?.id as string;
  const entryType = authData.AuthUser?.user?.entryType as string;
  const afterStart = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');

  const startTimer = (id: string, date: string) => {
    const offset = new Date();
    const now = moment();
    const diff = now.diff(moment(date), 'seconds');
    const time = offset.setSeconds(offset.getSeconds() + diff)
    reset(new Date(time))
    setActiveEntry_id(id);
  }

  const { loading: timeEntryLoading } = useQuery<
    GraphQLResponse<'TimeEntry', TimeEntryPagingResult>,
    QueryTimeEntryArgs
  >(TIME_ENTRY, {
    variables: {
      input: {
        paging: {
          take: 1,
        },
        query: {
          entryType: EntryType.Cico,
          company_id,
        },
      }
    },
    onCompleted(response) {
      if (response.TimeEntry.activeEntry) {
        let startTime = response.TimeEntry.activeEntry?.startTime;
        if (startTime) {
          startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss');
          startTimer(response.TimeEntry.activeEntry.id, startTime);
        }
      }
    }
  })

  const [updateTimeEntry, { loading: updateLoading }] = useMutation<
    GraphQLResponse<'TimeEntryUpdate', TimeEntry>,
    MutationTimeEntryUpdateArgs
  >(UPDATE_TIME_ENTRY, {
    update: (cache, result: any) => {
      const data: any = cache.readQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id,
              afterStart,
              entryType,
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
      });

      const entries = data?.TimeEntry?.data ?? [];

      cache.writeQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              afterStart,
              entryType: authData?.user?.entryType,
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
        data: {
          TimeEntry: {
            activeEntry: null,
            data: [result, ...entries]
          }
        }
      });
    },
    onCompleted(response) {
      if (response.TimeEntryUpdate) {
        reset(undefined, false);
      }
      props?.refetch({
        input: {
          query: {
            company_id,
            afterStart,
            entryType,
          },
          paging: {
            order: ['startTime:DESC']
          }
        }
      })
    },
    onError: notifyGraphqlError,
  });

  const checkOut = () => {
    if (activeEntry_id) {
      updateTimeEntry({
        variables: {
          input: {
            id: activeEntry_id,
            company_id,
            endTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }
        }
      })
    }
  }

  const showCheckInModal = () => {
    setIsCheckInVisible(true);
  }

  const hideCheckInModal = () => {
    setIsCheckInVisible(false);
  }

  return (
    <>
      <div className={styles['cico']}>
        {
          isRunning ? (
            <div className={styles['check-out']}>
              <div className={styles['timer']}>
                <Digit value={hours} />:<Digit value={minutes} />:<Digit value={seconds} />
              </div>
              <Button onClick={checkOut} loading={updateLoading}>
                Check-out
              </Button>
            </div>
          ) : (
            <Button type="primary" onClick={showCheckInModal} disabled={timeEntryLoading}>
              Check-in
            </Button>
          )
        }

      </div>

      <Modal
        centered
        footer={null}
        destroyOnClose
        visible={isCheckInVisible}
        onCancel={hideCheckInModal}
        title={<h2 className="modal-title">Check in</h2>}
      >
        <CheckInForm
          startTimer={startTimer}
          hideCheckInModal={hideCheckInModal}
        />
      </Modal>
    </>
  )
}

export default CheckInCheckOut;
