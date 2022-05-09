import React from 'react';
import { Card, Col, DatePicker, Row, Button, Space, Input } from "antd";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined, CloseCircleOutlined } from "@ant-design/icons";
import moment from 'moment';

import { gql, useQuery } from '@apollo/client';
import { useNavigate, useParams } from "react-router-dom";
import { authVar } from '../../../App/link';
import { TIME_ENTRY } from '../index';
// import _ from 'lodash';

import styles from "../style.module.scss";


// function getPreviousMonday() {
//   var date = new Date();
//   var day = date.getDay();
//   var prevMonday = new Date();
//   date.getDay() === 0 ? prevMonday.setDate(date.getDate() - 7) : prevMonday.setDate(date.getDate() - (day - 1))
//   return prevMonday;
// }

export const TIME_ENTRY_WEEKLY_DETAILS = gql`
query TimesheetWeeklyDetails($input: TimeEntryWeeklyDetailsInput!) {
  TimeEntryWeeklyDetails(input: $input) {
    id
    startTime
    duration
    endTime
    project {
      id
    }
  }
}
`


const DetailTimesheet = () => {
  let params = useParams();
  const navigate = useNavigate();
  const authData = authVar();
  const { data: timeEntryData } = useQuery(TIME_ENTRY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          id: params?.id
        },
        paging: {
          order: ['createdAt:DESC']
        }
      }
    }
  });

  // const { data: timeEntryWeeklyDetails } = useQuery(TIME_ENTRY_WEEKLY_DETAILS, {
  //   variables: {
  //     input: {
  //       company_id: authData?.company?.id ?? '',
  //     }
  //   }
  // });

  // function getDaysInMonth(month: any, year: any, day: any) {
  //   var date = new Date(year, month, day);
  //   var days = [];
  //   while (date.getMonth() === month) {
  //     days.push(new Date(date));
  //     date.setDate(date.getDate() + 1);
  //   }
  //   return days;
  // }

  // function groupByDate() {
  //   let filteredDates = []
  //   filteredDates = timeEntryWeeklyDetails?.TimeEntryWeeklyDetails.filter((data: any) =>
  //     moment(data?.start).format('l') >= moment(getPreviousMonday()).format('l')
  //   )
  //   const monthDate = (entry: any) => moment(entry?.start, 'MMM Do').format('l');
  //   const result = _.groupBy(filteredDates, monthDate);
  //   console.log(result);
  //   let array = Object.keys(result).map((key) => [result[key]]);
  //   return array
  // }

  return (
    <div className={styles['site-card-wrapper']}>
      <Card
        bordered={false}
        className={styles.timesheetCard}>
        <Row className={styles.cardHeader}>
          <Col span={24} className={styles.formColDetail}>
            <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; &nbsp; <span> My Timesheet</span>
          </Col>
        </Row>

        <Row className={styles.cardBody}>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Candidate Name</div>
              <div>{timeEntryData?.TimeEntry?.data[0]?.company?.name}</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Time Period</div>
              <div>Mon-Sun</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Total Expense</div>
              <div>$600</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Approver/Manager</div>
              <div>Thomas Holland</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Status</div>
              <div>Open</div>
            </div>
          </Col>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>
                Project Name
              </div>
              <div>
                {timeEntryData?.TimeEntry?.data[0]?.project?.name}
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
                {timeEntryData?.TimeEntry?.data[0]?.clientLocation ?? 'N/A'}
              </div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>
                Last Submitted
              </div>
              <div>
                {moment(timeEntryData?.TimeEntry?.data[0]?.endTime).format('L')}
              </div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>
                Last Approved
              </div>
              <div>
                {timeEntryData?.TimeEntry?.data[0]?.approver ?? 'N/A'}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
      <br />
      <Card bordered={false}>
        <Row className={styles.timeSheetDetail}>
          <Col span={6} className={styles.formCol1}>
            <span>Time Entry Details</span>
          </Col>
          <Col span={12}>
            <div className={styles['data-picker']}>
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </div>
          </Col>
          <Col span={3}>
            <div className={styles['next-icon']}>
              <LeftOutlined />
            </div>
          </Col>
          <Col span={3}>
            <div className={styles['next-icon']}>
              <RightOutlined />
            </div>
          </Col>
        </Row>
        <Row>
          <Col
            span={24}
            className={styles.formCol}>
            <div className={styles['resp-table']}>
              <div className={styles["resp-table-header"]}>
                <div className={styles['table-header-cell']}>
                  Header 1
                </div>
                <div className={styles['table-header-cell']}>
                  Header 2
                </div>
                <div className={styles['table-header-cell']}>
                  Header 3
                </div>
                <div className={styles['table-header-cell']}>
                  Header 4
                </div>
                <div className={styles['table-header-cell']}>
                  Header 5
                </div>
                <div className={styles['table-header-cell']}>
                  Header 6
                </div>
                <div className={styles['table-header-cell']}>
                  Header 7
                </div>
                <div className={styles['table-header-cell']}>
                  Header 8
                </div>
                <div className={styles['table-header-cell']}>
                  Header 9
                </div>
              </div>
              <div className={styles["resp-table-body"]}>
                <div className={styles["table-body-cell"]}>
                  Data 1
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
  )
}
export default DetailTimesheet;
