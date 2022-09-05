import { Fragment, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactToPrint from 'react-to-print';
import { Button, Card, Col,  Row } from 'antd';
import { DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { useLazyQuery, useQuery } from '@apollo/client';
import moment from 'moment';
import _ from 'lodash';

import { downloadCSV, getWeekDays } from '../../../../utils/common';
import PageHeader from '../../../../components/PageHeader';
import AddWorkscheduleEmployee from '../../../../components/AddWorkscheduleEmployee';
import { authVar } from '../../../../App/link';
import { USER } from '../../../Employee';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import { WORKSCHEDULEDETAIL } from '../../../EmployeeSchedule';
import { WORKSCHEDULE } from '../../../Schedule';
import { QueryUserArgs, UserPagingResult } from '../../../../interfaces/generated';
import AddNewWorkscheduleDetail from '../../../Schedule/DetailSchedule/AddNewWorkscheduleDetail';
import AddTimeInterval from '../../../Schedule/DetailSchedule/AddTimeInterval';

import styles from './style.module.scss';

const ScheduleDetailReport = () => {
  const componentRef = useRef() as React.MutableRefObject<HTMLInputElement>;

  const params = useParams();
  const loggedInUser = authVar();
  const [showEmployee, setEmployeeShow] = useState(false);
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

  const tableHeader = () => {
    let title: Array<{ label: string; key: string; subKey?: string }> = [
      { label: 'Employee Name', key: 'username' },
      { label: 'Designation', key: 'designation' },
    ];

    weekDays.map((day: any, index: number) =>
      title.push({
        label: `${moment(day).format('ddd, MMM D').replace(',', '-')}`,
        key: 'timeSheetBody',
        subKey: `${index}`,
      })
    );
    title.push({ label: 'Total', key: 'total' });

    return title;
  };

  const tableBody = () => {
    const tableRows = [];

    for (const property in groups) {
      const username = groups && groups[property][0]?.user?.fullName;
      const designation = groups && (groups[property][0]?.user?.designation ?? '-');
      const total = getTotalSchedule(groups[property]);
      const timeSheetBodyPart =
        groups &&
        Object.keys(groups).map((key) => {
          return weekDays.map(
            (day) =>
              groups[property] &&
              groups[property]?.map((data: any) => {
                return (
                  day === moment(data?.schedule_date).format('YYYY-MM-DD') &&
                  data?.workscheduleTimeDetail?.length > 0 &&
                  data?.workscheduleTimeDetail?.map(
                    (timeData: any) => `${moment(timeData?.startTime).utc().format('HH:mm') || ''}-${
                        moment(timeData?.endTime).utc().format('HH:mm') || ''
                      }`
                  )[0]
                );
              })[0]
          );
        }); 
      const timeSheetBody = timeSheetBodyPart[0]?.map((item:string)=>item || '-');
      tableRows.push({ username, designation, total, timeSheetBody: Object.assign({}, timeSheetBody) });
    }
    return tableRows;
  };

  const downloadReport = () => {
    const csvHeader = tableHeader();
    const csvBody = tableBody();
    downloadCSV(csvBody, csvHeader, 'ScheduleTable.csv');
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
          <Row className='container-row'>
            <Col span={24}>
              <div ref={componentRef} className={styles['detail-table']}>
                <table className={styles['main-table']}>
                  <thead>
                    <tr className={styles['table-header']}>
                      <th>Employee</th>
                      <th>Designation</th>

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
                            <td>{groups[key]?.[0]?.user?.fullName}</td>
                            <td>{(groups[key]?.[0]?.user?.designation && `${groups[key]?.[0]?.user?.designation}`) ?? '-'}</td>
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
              {/* <ReactToPrint
                                    trigger={() =>
                                        <Button
                                            type="link"
                                            icon={<PrinterOutlined />}
                                        >
                                            Print Schedule
                                        </Button>}
                                    content={() => componentRef.current}
                                /> */}
            </Col>
            {/* <Col>
            <br />
              <Button icon={<DownloadOutlined />} onClick={downloadReport}> Download</Button>
            </Col> */}
          </Row>
        </Card>

        <AddTimeInterval
          visibility={addTimeInterval}
          setVisibility={setAddTimeInterval}
          workschedule={workscheduleDetailByIdData}
          getWorkschedule={getWorkschedule}
          setEmployee={setEmployee}
        />

        <AddNewWorkscheduleDetail
          visibility={showAddNewTimeInterval}
          setVisibility={setShowAddNewTimeInterval}
          getWorkschedule={getWorkschedule}
          employeeName={addNewTimeInterval?.employeeName}
          employeeId={addNewTimeInterval?.employeeId}
          providedData={addNewTimeInterval?.providedData}
          refetch={refetchWorkscheduleDetail}
          setEmployee={setEmployee}
        />

        <AddWorkscheduleEmployee visibility={showEmployee} setVisibility={setEmployeeShow} setEmployee={setEmployee} />
      </div>
    </>
  );
};

export default ScheduleDetailReport;
