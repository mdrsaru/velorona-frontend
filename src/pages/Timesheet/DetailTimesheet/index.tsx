import { Card, Col, Row, Button, Space, Input, message } from 'antd';
import {
  ArrowLeftOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import { authVar } from '../../../App/link';
import _ from 'lodash';

import { notifyGraphqlError } from "../../../utils/error";
import { useState } from 'react';
import AppLoader from '../../../components/Skeleton/AppLoader';
import { getTimeFormat } from '..';
import deleteImg from "../../../assets/images/delete_btn.svg";
import ModalConfirm from '../../../components/Modal';

import styles from '../style.module.scss';

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

export const TIMESHEET_SUBMIT = gql`
  mutation TimesheetSubmit($input: TimesheetSubmitInput!) {
    TimesheetSubmit(input: $input) {
      id
      isSubmitted
      lastSubmittedAt
      approver {
        id
        fullName
        email
      }
    }
  }
`

export const TIME_ENTRY_BULK_DELETE = gql`
  mutation TimeEntryBulkDelete($input: TimeEntryBulkDeleteInput!) {
    TimeEntryBulkDelete(input: $input) {
      id
    }
  }
`

const deleteBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div>
        <img src={deleteImg} alt="confirm" />
      </div><br />
      <p>
        <strong> Are you sure you want to delete the current time entry?</strong>
      </p>
      <p className={styles['warning-text']}>
        Your current time tracking will be deleted.
      </p>
    </div>
  )
}

function getWeekDays(date: any) {
  return Array(7).fill(new Date(date)).map((el, idx) => new Date(el.setDate(el.getDate() - el.getDay() + idx + 1)))
}


const DetailTimesheet = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();
  const [selectedEntries, setCurrentEntries] = useState('');
  const [submitTimesheet] = useMutation(TIMESHEET_SUBMIT);
  const [timeSheetWeekly, setTimeSheetWeekly] = useState([]);
  const [visibility, setVisibility] = useState<boolean>(false);
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

  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }

  const [deleteBulkTimeEntry] = useMutation(TIME_ENTRY_BULK_DELETE, {
    onCompleted: (response: any) => {
      const newTimeSheets = timeSheetWeekly.filter((entry: any) => { return entry?.id !== selectedEntries });
      setTimeSheetWeekly(newTimeSheets);
      setModalVisibility(false);
      message.success({ content: `Time entry is deleted successfully!`, className: 'custom-message' });
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

  const getTotalTimeForADay = (entries: any) => {
    let sum = 0;
    if (entries) {
      const durations = entries.map((data: any) => data?.duration)
      sum = durations.reduce((entry1: any, entry2: any) => {
        return entry1 + entry2;
      }, 0);
    };
    return getTimeFormat(sum)
  }

  const getTotalTimeByTask = (entries: any) => {
    let durations: any = [];
    const data = Object.values(entries);
    data.forEach((tasks: any) => {
      tasks.forEach((data: any) => { durations.push(data?.duration) })
    });
    let sum = durations.reduce((entry1: any, entry2: any) => { return entry1 + entry2 }, 0);
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
  };

  const onSubmitTimesheet = () => {
    submitTimesheet({
      variables: {
        input: {
          id: timeSheetDetail?.Timesheet?.data[0]?.id,
          company_id: authData?.company?.id
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data) {
        message.success({ content: `Timesheet is submitted successfully!`, className: 'custom-message' });
      }
    }).catch(notifyGraphqlError)
  }

  const onDeleteBulkTimeEntry = () => {
    if (selectedEntries) {
      const taskEntries: any = timeSheetWeekly.filter((entry: any) => { return entry?.id === selectedEntries });
      const arrayEntries = Object.values(taskEntries[0]?.entries).map((timesheet: any) => {
        return timesheet.map((data:any) => {
          return data?.id
        })
      })
      deleteBulkTimeEntry({
        variables: {
          input: {
            ids: arrayEntries.flat(),
            company_id: authData?.company?.id
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        }
      }).catch(notifyGraphqlError)
    }
  }

  return (
    <>
      {loadWeekly ? <AppLoader /> :
        <div className={styles['site-card-wrapper']}>
          <Card
            bordered={false}
            className={styles['timesheet-card']}>
            <Row className={styles['card-header']}>
              <Col span={24} className={styles['form-col-detail']}>
                <ArrowLeftOutlined onClick={() => navigate(-1)} />
                &nbsp; &nbsp;
                <span> My Timesheet</span>
              </Col>
            </Row>

            <Row className={styles['card-body']}>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>Candidate Name</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.user?.email}</div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>Time Period</div>
                  <div>Mon-Sun</div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>Total Expense</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.totalExpense ?? 'N/A'}</div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>Approver/Manager</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.approver?.fullName ?? 'N/A'}</div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>Status</div>
                  <div>{timeSheetDetail?.Timesheet?.data[0]?.status}</div>
                </div>
              </Col>
              <Col xs={24} sm={24} md={24} lg={12} xl={12}>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>
                    Project Name
                  </div>
                  <div>
                    {timeSheetDetail?.Timesheet?.data[0]?.project?.name ?? 'N/A'}
                  </div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>
                    Client Name
                  </div>
                  <div>
                    Araniko College Pvt Ltd
                  </div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>
                    Client Location
                  </div>
                  <div>
                    {timeSheetDetail?.Timesheet?.data[0]?.clientLocation ?? 'N/A'}
                  </div>
                </div>
                <div className={styles['timesheet-div']}>
                  <div className={styles.header}>
                    Last Submitted
                  </div>
                  <div>
                    {moment(timeSheetDetail?.Timesheet?.data[0]?.weekEndDate).format('L')}
                  </div>
                </div>
                <div className={styles['timesheet-div']}>
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
            <Row className={styles['timesheet-detail']}>
              <Col span={12} className={styles['form-col1']}>
                <span>
                  Time Entry Details
                </span>
              </Col>
              <Col span={12} className={styles['form-col1']}>
                <span className={styles['add-entry']}>
                  Add New Time Entry
                </span>
              </Col>
            </Row>
            <Row>
              <Col span={24} className={styles['form-col']}>
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
                          <Input type="text" value={getTotalTimeForADay(timesheet?.entries[moment(day).format('ddd, MMM D')])} />
                        </div>
                      )}
                      <div className={styles["table-body-cell"]}>
                        <span>{getTotalTimeByTask(timesheet?.entries)} </span>
                        &nbsp; &nbsp; <CloseCircleOutlined onClick={() => {
                          setModalVisibility(true);
                          setCurrentEntries(timesheet?.id)
                        }} />
                      </div>
                    </div>)}
                </div>
              </Col>
            </Row>
            <br />
            <Row justify={"end"}>
              <Col className={styles['form-col']}>
                <Space>
                  <Button type="primary" htmlType="button">
                    Save and Exit
                  </Button>
                  <Button type="default" htmlType="button" onClick={onSubmitTimesheet}>
                    Submit
                  </Button>
                </Space>
              </Col>
            </Row>
            <br />
          </Card>
        </div>
      }
      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        onOkClick={() => onDeleteBulkTimeEntry()}
        modalBody={deleteBody} />
    </>
  )
}
export default DetailTimesheet;
