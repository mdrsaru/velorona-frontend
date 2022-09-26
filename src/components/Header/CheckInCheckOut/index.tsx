import moment from 'moment';
import { useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Col, message, Modal, Row } from 'antd';

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

interface IProps {
  refetch?: any;
  refetchTimesheet?: any;
}
const CheckInCheckOut = (props: IProps) => {
  const [activeEntry_id, setActiveEntry_id] = useState<string | null>(null)
  const [isCheckInVisible, setIsCheckInVisible] = useState(false)
  const [breakStartTime, setBreakStartTime] = useState<string>()
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    reset,
  } = useStopwatch({ autoStart: false });

  const {
    seconds: breakSeconds,
    minutes: breakMinutes,
    hours: breakHours,
    isRunning: isBreakRunning,
    reset: breakReset,
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

  const startBreakTimer = (date: string) => {
    const offset = new Date();
    const now = moment();
    const diff = now.diff(moment(date), 'seconds');
    const time = offset.setSeconds(offset.getSeconds() + diff)
    breakReset(new Date(time))
  }

  const { loading: timeEntryLoading } = useQuery<
    GraphQLResponse<'TimeEntry', TimeEntryPagingResult>,
    QueryTimeEntryArgs
  >(TIME_ENTRY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
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
        let startBreakTime = response.TimeEntry.activeEntry?.startBreakTime;
        if (startTime) {
          startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss');
          startTimer(response.TimeEntry.activeEntry.id, startTime);
        }
        if (startBreakTime) {
          startBreakTime = moment(startBreakTime).utc().format('YYYY-MM-DDTHH:mm:ss');
          startBreakTimer(startBreakTime);
          setBreakStartTime(startBreakTime)
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
      props?.refetchTimesheet({
        input: {
          query: {
            company_id,
          },
          paging: {
            order: ['weekStartDate:DESC']
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

  const [addBreakTime] = useMutation<
    GraphQLResponse<'TimeEntryUpdate', TimeEntry>,
    MutationTimeEntryUpdateArgs
  >(UPDATE_TIME_ENTRY, {
    onCompleted(response) {
      if (response?.TimeEntryUpdate) {
        message.success({ content: `Break time added successfully`, className: 'custom-message' })
        breakReset(undefined, false);
      }
    },
    onError: notifyGraphqlError,
  });

  const [addStartBreakTime] = useMutation<
    GraphQLResponse<'TimeEntryUpdate', TimeEntry>,
    MutationTimeEntryUpdateArgs
  >(UPDATE_TIME_ENTRY, {
    onError: notifyGraphqlError,
  });
  const showCheckInModal = () => {
    setIsCheckInVisible(true);
  }

  const hideCheckInModal = () => {
    setIsCheckInVisible(false);
  }

  const handleAddBreakTime = () => {
    const date = moment().format('YYYY-MM-DD HH:mm:ss')
    startBreakTimer(date)
    addStartBreakTime({
      variables: {
        input: {
          id: activeEntry_id as string,
          company_id,
          startBreakTime: date
        },
      },
    })
  }

  const handleEndBreakTime = () => {
    let endDate = moment().format('YYYY-MM-DDTHH:mm:ss')

    const diff = moment(endDate).diff(breakStartTime, 'seconds');

    if (activeEntry_id) {
      addBreakTime({
        variables: {
          input: {
            id: activeEntry_id as string,
            company_id,
            breakTime: diff,
            startBreakTime: null
          },
        },
      })
    }
  }

  const today = moment().format('MM/DD/YYYY')
  return (
    <>
      <div className={styles['cico']}>
        <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>


          <Col xs={24} sm={24} md={12} lg={12}>
            <div className={styles['container']}>
              <Row>
                <Col xs={24} sm={24} md={12} lg={18}>
                  <p className={styles['title']}>Check-in</p>
                </Col>
                <Col>
                  <p className={styles['date']}>{today}</p>
                </Col>
              </Row>
              <Row>
                <Col className={`gutter-row ${styles['timer']}`} xs={24} sm={24} md={12} lg={18}>
                  <Digit value={hours} />:<Digit value={minutes} />:<Digit value={seconds} />
                </Col>
                <Col className={styles['timer']}>
                  {isRunning ?
                    <Button onClick={checkOut} loading={updateLoading}>
                      Check-out
                    </Button>
                    :
                    <Button onClick={showCheckInModal} loading={updateLoading}>
                      Check-in
                    </Button>
                  }
                </Col>
              </Row>
            </div>
          </Col>
          {isRunning &&
            <Col xs={24} sm={24} md={12} lg={11}>
              <div className={styles['container']}>
                <Row >
                  <Col xs={24} sm={24} md={12} lg={18}>
                    <p className={styles['title']}>Take Break</p>
                  </Col>
                  <Col>
                    <p className={styles['date']}>{today}</p>
                  </Col>
                </Row>
                <Row>
                  <Col className={`${styles['timer']}`} xs={24} sm={24} md={12} lg={18}>
                    <Digit value={breakHours} />:<Digit value={breakMinutes} />:<Digit value={breakSeconds} />
                  </Col>
                  <Col>
                    {isBreakRunning ?
                      <Button onClick={handleEndBreakTime} loading={updateLoading}>
                        End Break
                      </Button>
                      :

                      <Button type='primary' onClick={handleAddBreakTime} loading={updateLoading}>
                        Break
                      </Button>
                    }
                  </Col>
                </Row>
              </div>
            </Col>
          }
        </Row>
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
