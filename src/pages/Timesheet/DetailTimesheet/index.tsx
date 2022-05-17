import { Card, Col, Row, Button, Space, Input } from "antd";
import { ArrowLeftOutlined, CloseCircleOutlined } from "@ant-design/icons";
import moment from 'moment';

import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { useNavigate, useParams } from "react-router-dom";
import { authVar } from '../../../App/link';
import _ from 'lodash';

import styles from "../style.module.scss";
import { useState } from "react";
import WeeklyTimeSheet from "../WeeklyTimesheet";
import AppLoader from "../../../components/Skeleton/AppLoader";

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


function getPreviousMonday() {
  var date = new Date();
  var day = date.getDay();
  var prevMonday = new Date();
  date.getDay() === 0 ? prevMonday.setDate(date.getDate() - 7) :
    prevMonday.setDate(date.getDate() - (day - 1))
  return prevMonday;
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
    onCompleted: (weeklyData) => {
      groupByDate()
    }
  });

  console.log(timeSheetWeekly)

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

  function groupByTimeEntry(array: any) {
    const monthDate = (entry: any) => moment(entry?.startTime).format('ddd, MMM D');
    const result = _.groupBy(array, monthDate);
    return result
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
                    {timeSheetWeekly?.map((date: any, index: number) =>
                      <div className={styles['table-header-cell']} key={index}>
                        Mon, April 4
                      </div>)}
                    <div className={styles['table-header-cell']}>
                      Total
                    </div>
                  </div>
                  <div className={styles["resp-table-body"]}>
                    <div className={styles["table-body-cell"]}>
                      Data 1
                    </div>
                    <div className={styles["table-body-cell"]}>
                      Database Design
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <Input value={"20:30:44"} />
                    </div>
                    <div className={styles["table-body-cell"]}>
                      <span>40:00:00 </span> &nbsp; &nbsp; <CloseCircleOutlined />
                    </div>
                  </div>
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
