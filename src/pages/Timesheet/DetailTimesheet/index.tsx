import { Card, Col, Row, Button, Space, Input } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { authVar } from '../../../App/link';
import _ from 'lodash';

import { useState } from 'react';
import AppLoader from '../../../components/Skeleton/AppLoader';

import styles from '../style.module.scss';
import { getTimeFormat } from '..';

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
			status
      approver {
        createdAt
        fullName
      }
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
}
`

export const TIME_ENTRY_WEEKLY_DETAILS = gql`
query TimesheetWeeklyDetails($input: TimeEntryWeeklyDetailsInput!) {
  TimeEntryWeeklyDetails(input: $input) {
    id
    startTime
    endTime
    duration
    task_id
    task {
      id
      name
    }
    project {
      id
      name
    }
  }
}
`

function getWeekDays(date: any) {
  return Array(7).fill(new Date(date)).map((el, idx) => new Date(el.setDate(el.getDate() - el.getDay() + idx + 1)))
}


const DetailTimesheet = () => {
  let params = useParams();
  const navigate = useNavigate();
  const authData = authVar();
  const [timeSheetWeekly, setTimeSheetWeekly] = useState([]);
  const [getWeeklyTimeEntry, { loading: loadWeekly, data: timeEntryWeeklyDetails }] = useLazyQuery(TIME_ENTRY_WEEKLY_DETAILS, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        company_id: authData?.company?.id ?? '',
        startTime: '',
        endTime: ''
      }
    },
    onCompleted: () => {
      groupByDate()
    }
  });

  const { data: timeSheetDetail } = useQuery(TIME_SHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          id: params?.id,
          user_id: authData?.user?.id
        },
        paging: {
          order: ['createdAt:DESC']
        }
      }
    },
    onCompleted: (timeData) => {
      getWeeklyTimeEntry({
        variables: {
          input: {
            company_id: authData?.company?.id ?? '',
            startTime: timeData?.Timesheet?.data[0]?.weekStartDate,
            endTime: timeData?.Timesheet?.data[0]?.weekEndDate
          }
        }
      }).then(r => { })
    }
  });

  function getTotalTime(entries: any) {
    let sum = 0
    console.log(entries);
    if (entries) {
      const durations = entries.map((data: any, index: number) => data?.duration)
      sum = durations.reduce((entry1: any, entry2: any) => {
        console.log('Duration', entry1);
        return entry1 + entry2
      }, 0);
      console.log('sum', sum);
    }
    return getTimeFormat(sum)
  }


  function groupByTimeEntry(array: any) {
    const monthDate = (entry: any) => moment(entry?.startTime).format('ddd, MMM D');
    return _.groupBy(array, monthDate);
  }

  function groupByDate() {
    let grouped: any = [];
    const tasks = _.groupBy(timeEntryWeeklyDetails?.TimeEntryWeeklyDetails, 'task_id');
    for (const [key, value] of Object.entries(tasks)) {
      grouped.push({
        id: key,
        name: value[0]?.task?.name,
        project: value[0]?.project?.name,
        entries: groupByTimeEntry(value)
      })
    }
    setTimeSheetWeekly(grouped)
  }
  console.log(timeSheetWeekly);

  return (
    <>
      {loadWeekly ? <AppLoader /> :
        <div className={styles['site-card-wrapper']}>
          <Card
            bordered={false}
            className={styles.timesheetCard}>
            <Row className={styles.cardHeader}>
              <Col span={24} className={styles.formColDetail}>
                <ArrowLeftOutlined onClick={() => navigate(-1)} />
                &nbsp; &nbsp;
                <span> My Timesheet</span>
              </Col>
            </Row>

            <Row className={styles.cardBody}>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>Candidate Name</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.user?.email}</div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>Time Period</div>
                  <div>Mon-Sun</div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>Total Expense</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.totalExpense ?? 'N/A'}</div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>Approver/Manager</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.approver?.fullName ?? 'N/A'}</div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>Status</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.status}</div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>
                    Project Name
                  </div>
                  <div>
                    {timeSheetDetail?.Timesheet?.data[0]?.project?.name ?? 'N/A'}
                  </div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>
                    Client Name
                  </div>
                  <div>
                    Araniko College Pvt Ltd
                  </div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>
                    Client Location
                  </div>
                  <div>
                    {timeSheetDetail?.Timesheet?.data[0]?.clientLocation ?? 'N/A'}
                  </div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>
                    Last Submitted
                  </div>
                  <div>
                    {moment(timeSheetDetail?.Timesheet?.data[0]?.weekEndDate).format('L')}
                  </div>
                </div>
                <div className={styles.timesheetDiv}>
                  <div className={styles.header}>
                    Last Approved
                  </div>
                  <div>
                    {timeSheetDetail?.Timesheet?.data[0]?.approver?.createdAt ?? 'N/A'}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
          <br />
          <Card bordered={false}>
            <Row className={styles.timeSheetDetail}>
              <Col span={24} className={styles.formCol1}>
                <span>Time Entry Details</span>
              </Col>
              <Col span={24} className={styles.formCol1}>
                <span></span>
              </Col>
            </Row>
            <Row>
              <Col span={24} className={styles.formCol}>
                <div className={styles['resp-table']}>
                  <div className={styles["resp-table-header"]}>
                    <div className={styles['table-header-cell']}>
                      Project Name
                    </div>
                    <div className={styles['table-header-cell']}>
                      Task
                    </div>
                    {getWeekDays(timeSheetDetail?.Timesheet?.data[0]?.weekStartDate).map((day: any, index: number) =>
                      <div className={styles['table-header-cell']} key={index}>
                        {moment(day).format('ddd, MMM D')}
                      </div>)}
                    <div className={styles['table-header-cell']}>
                      Total
                    </div>
                  </div>
                  {timeSheetWeekly?.map((timesheet: any, index: number) =>
                    <div className={styles["resp-table-body"]} key={index}>
                      <div className={styles["table-body-cell"]}>
                        {timesheet?.project}
                      </div>
                      <div className={styles["table-body-cell"]}>
                        {timesheet?.name}
                      </div>
                      {getWeekDays(timeSheetDetail?.Timesheet?.data[0]?.weekStartDate).map((day: any, timeIndex: number) =>
                        <div className={styles["table-body-cell"]} key={timeIndex}>
                          <Input value={getTotalTime(timesheet?.entries[moment(day).format('ddd, MMM D')])} />
                        </div>
                      )}
                      <div className={styles["table-body-cell"]}>
                        <span>40:00:00 </span> &nbsp; &nbsp; <CloseCircleOutlined />
                      </div>
                    </div>)}
                </div>
              </Col>
            </Row>
            <br />
            <Row justify={"end"}>
              <Col className={styles.formCol}>
                <Space>
                  <Button type="primary" htmlType="button">
                    Save and Exit
                  </Button>
                  <Button type="default" htmlType="button">
                    Submit
                  </Button>
                </Space>
              </Col>
            </Row>
            <br />
          </Card>
        </div>
      }
    </>
  )
}
export default DetailTimesheet;
