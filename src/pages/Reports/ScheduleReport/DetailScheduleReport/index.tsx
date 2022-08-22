import _ from 'lodash';
import moment from 'moment';
import { Fragment, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Button, Card, Col, Row } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';
import { useLazyQuery, useQuery } from '@apollo/client';

import { getWeekDays } from '../../../../utils/common';
import PageHeader from '../../../../components/PageHeader';
import { WORKSCHEDULEDETAIL } from '../../../EmployeeSchedule';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import { QueryUserArgs, UserPagingResult } from '../../../../interfaces/generated';
import { USER } from '../../../Employee';
import { WORKSCHEDULE } from '../../../Schedule';
import { authVar } from '../../../../App/link';

import styles from './style.module.scss';

const ScheduleDetailReport = () => {
  const componentRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const params = useParams();
  const loggedInUser = authVar();
  const [addTimeInterval, setAddTimeInterval] = useState(false);
  const [showAddNewTimeInterval, setShowAddNewTimeInterval] = useState(false);
  const [addNewTimeInterval, setAddNewTimeInterval] = useState<any>({
    employeeName: '',
    providedDate: '',
    employeeId: '',
  });
  const [workscheduleId, setWorkscheduleId] = useState('');
  const [employee, setEmployee] = useState('');

  const { data: workscheduleData } = useQuery(WORKSCHEDULE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:DESC'],
        },
        query: {
          company_id: loggedInUser?.company?.id,
          id: params?.sid,
        },
      },
    },
  });

  const { data: workscheduleDetailData, refetch: refetchWorkscheduleDetail } = useQuery(WORKSCHEDULEDETAIL, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:ASC'],
        },
        query: {
          workschedule_id: params?.sid,
        },
      },
    },
  });

  const { data: employeeData } = useQuery<GraphQLResponse<'User', UserPagingResult>, QueryUserArgs>(USER, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:DESC'],
        },
        query: {
          id: employee,
        },
      },
    },
  });

  const [getWorkschedule, { data: workscheduleDetailByIdData }] = useLazyQuery(WORKSCHEDULEDETAIL, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:ASC'],
        },
        query: {
          id: workscheduleId,
        },
      },
    },
  });

  const startDate = workscheduleData?.Workschedule?.data?.[0]?.startDate;
  const weekDays = getWeekDays(startDate);
  const workscheduleDetail = workscheduleDetailData?.WorkscheduleDetail?.data;
  const groups: any = _.groupBy(workscheduleDetail, 'user.fullName');

  const handleChange = (id: any) => {
    setWorkscheduleId(id);
    setAddTimeInterval(!addTimeInterval);
    getWorkschedule({
      variables: {
        input: {
          paging: {
            order: ['updatedAt:ASC'],
          },
          query: {
            id: id,
          },
        },
      },
    });
  };

  const handleNewTimeIntervalAddition = (id: number) => {
    setShowAddNewTimeInterval(true);
    // setEmployee('')
    setAddNewTimeInterval({
      employeeId: employeeData?.User?.data?.[0]?.id,
      employeeName: employeeData?.User?.data?.[0]?.fullName,
      providedData: weekDays[id],
    });
  };

  const handleNewWorkschedule = (id: string, fullName: string, day: Date) => {
    setShowAddNewTimeInterval(true);
    setAddNewTimeInterval({
      employeeId: id,
      employeeName: fullName,
      providedData: day,
    });
  };

  const getTotalSchedule = (group: any) => {
    let count = 0;
    if (group?.length > 0) {
      for (let index in group) {
        count += group[index].duration;
      }
    }
    let hour = (count / 3600).toFixed(2);
    return hour;
  };

  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <PageHeader
            title={`Scheduling ( ${moment(workscheduleData?.Workschedule?.data?.[0]?.startDate).format(
              'MMM DD'
            )} -${moment(workscheduleData?.Workschedule?.data?.[0]?.endDate).format('MMM DD')} )`}
          />
          <Row className='container-row' gutter={[10, 10]}>
            <Col span={24}>
              <div ref={componentRef} className={styles['detail-table']}>
                <table className={styles['main-table']}>
                  <thead>
                    <tr className={styles['table-header']}>
                      <th>Employee</th>
                      {weekDays.map((day: any, index: number) => (
                        <th key={index}>{moment(day).format('ddd, MMM D')}</th>
                      ))}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups &&
                      Object.keys(groups).map(function (key, index) {
                        return (
                          <tr key={index}>
                            <td>
                              {groups[key]?.[0]?.user?.fullName}
                              <br />
                              <span>
                                {groups[key]?.[0]?.user?.designation && `(${groups[key]?.[0]?.user?.designation})`}
                              </span>
                            </td>
                            {weekDays.map((day: any, index: number) => (
                              <td key={index}>
                                {groups[key] &&
                                  groups[key]?.map((data: any, index: number) => (
                                    <Fragment key={index}>
                                      {day === moment(data?.schedule_date).format('YYYY-MM-DD') &&
                                        data?.workscheduleTimeDetail?.length > 0 &&
                                        data?.workscheduleTimeDetail?.map((timeData: any, index: number) => (
                                          <Fragment key={index}>
                                            <span onClick={() => handleChange(data?.id)} style={{ cursor: 'pointer' }}>
                                              {moment(timeData?.startTime).utc().format('HH:mm')} -
                                              {moment(timeData?.endTime).utc().format('HH:mm')}
                                            </span>
                                            <br />
                                          </Fragment>
                                        ))}
                                    </Fragment>
                                  ))}
                                {!groups[key]?.some(
                                  (data: any, index: any) => moment(data?.schedule_date).format('YYYY-MM-DD') === day
                                ) && (
                                  <span
                                    onClick={() =>
                                      handleNewWorkschedule(
                                        groups[key]?.[0]?.user?.id,
                                        groups[key]?.[0]?.user?.fullName,
                                        day
                                      )
                                    }
                                    style={{ cursor: 'pointer' }}
                                  >
                                    {' '}
                                    -{' '}
                                  </span>
                                )}
                              </td>
                            ))}
                            <td key={index}>{getTotalSchedule(groups[key])}</td>
                          </tr>
                        );
                      })}
                    {employeeData?.User?.data?.[0]?.fullName && (
                      <tr>
                        <td>{employeeData?.User?.data?.[0]?.fullName}</td>
                        {Array.from(Array(7)).map((num: number, index) => (
                          <td
                            key={index}
                            onClick={() => handleNewTimeIntervalAddition(index)}
                            style={{ cursor: 'pointer' }}
                          >
                            -
                          </td>
                        ))}
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Col>
            <Col span={24}>
              <ReactToPrint
                trigger={() => (
                  <Button type='link' icon={<PrinterOutlined />}>
                    Print Schedule
                  </Button>
                )}
                content={() => componentRef.current}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default ScheduleDetailReport;
