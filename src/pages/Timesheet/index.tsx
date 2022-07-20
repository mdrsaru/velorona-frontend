import _ from 'lodash'
import moment from 'moment'
import findIndex from 'lodash/findIndex';
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { gql, useMutation, useQuery } from '@apollo/client'
import { useStopwatch } from 'react-timer-hook'
import {
  Card,
  Col,
  Row,
  Modal,
  Table,
  Form,
  Select,
  message,
  Collapse,
  Input,
} from 'antd'
import {
  CloseOutlined,
} from '@ant-design/icons'

import { PROJECT } from '../Project'
import { authVar } from '../../App/link'
import constants from '../../config/constants'
import routes from "../../config/routes"
import { getTotalTimeForADay } from './DetailTimesheet'
import { TIME_ENTRY_FIELDS } from '../../gql/time-entries.gql';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { Timesheet as ITimesheet, TimeEntryPagingResult, TimeEntry as ITimeEntry, EntryType } from '../../interfaces/generated';

import { notifyGraphqlError } from "../../utils/error"
import TimeSheetLoader from '../../components/Skeleton/TimeSheetLoader'
import TimeEntry from './TimeEntry'
import NoContent from '../../components/NoContent'
import TimerCard from '../../components/TimerCard'
import TimeDuration from '../../components/TimeDuration'

import styles from './style.module.scss'

type ITodayGroupedEntries = {
  description: string | null | undefined;
  project_id: string;
  entries: ITimeEntry[];
};

export const CREATE_TIME_ENTRY = gql`
    ${TIME_ENTRY_FIELDS}
    mutation TimeEntryCreate($input: TimeEntryCreateInput!) {
      TimeEntryCreate(input: $input) {
        ...timeEntryFields
      }
    }
`
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

export const TIME_WEEKLY = gql`
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
      status
      durationFormat
      invoicedDuration
      invoicedDurationFormat
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
}`;

const UPDATE_TIME_ENTRY = gql`
    ${TIME_ENTRY_FIELDS}
    mutation TimeEntryUpdate($input: TimeEntryUpdateInput!) {
      TimeEntryUpdate(input: $input) {
        ...timeEntryFields
      }
    }
`

const { Panel } = Collapse;

export const computeDiff = (date: Date) => {
  const currentDate = new Date()
  const pastDate = new Date(date)
  return (currentDate.getTime() - pastDate.getTime()) / 1000
};

export const getTimeFormat = (seconds: any) => {
  let second = parseInt(seconds, 10)
  let sec_num = Math.abs(second)
  let hours: any = Math.floor(sec_num / 3600)
  let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60)
  let secs: any = sec_num - (hours * 3600) - (minutes * 60)

  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (secs < 10) { secs = "0" + secs; }
  return hours + ':' + minutes + ':' + secs
};

// const getHours = (seconds: any) => {
//   const sec = parseInt(seconds, 10);
//   let sec_num = Math.abs(sec);
//   return Math.floor(sec_num / 3600);
// }

const Timesheet = () => {
  const { Option } = Select
  const authData = authVar()
  let navigate = useNavigate()
  const [form] = Form.useForm()
  const [timeEntryForm] = Form.useForm()
  let stopwatchOffset = new Date()
  const [visible, setVisible] = useState(false)
  const [showDetailTimeEntry, setDetailVisible] = useState<boolean>(false)
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }> ({
    skip: 0,
    currentPage: 1,
  });
  const company_id = authData?.company?.id;
  const entryType = authData?.user?.type;

  const columns = [
    {
      title: 'Week',
      key: 'week',
      render: (record: any) =>
        <div>
          {moment(record?.weekStartDate).format('LL')} - {moment(record?.weekEndDate).format('LL')}
        </div>
    },
    {
      title: 'Client',
      key: 'client',
      render: (record: any) =>
        <div>
          {record?.client?.name}
        </div>
    },
    {
      title: 'Total Hours',
      key: 'duration',
      render: (record: any) =>
        <TimeDuration duration = {record.duration}/>
    },
    {
      title: 'Invoiced Time',
      render: (timesheet: ITimesheet) => {
        if (timesheet.invoicedDuration) {
          return timesheet.invoicedDurationFormat;
        }

        return '-';
      }
    },
    {
      title: 'Total Expense',
      dataIndex: 'totalExpense',
      render: (totalExpense: number) => {
        return `$${totalExpense}`
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div
          className={styles['dropdown-menu']}
          onClick={(e) => {
            navigate(routes.detailTimesheet.path(authData?.company?.code ?? '', record?.id))
          }}>
          <span>View Details</span>
        </div>
    }
  ]

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    })
  };

  const {
    data: timeWeeklyEntryData,
    loading: loadTimesheetWeekly,
    refetch: refetchTimeWeekly 
  } = useQuery(TIME_WEEKLY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id,
        },
        paging: {
          order: ['weekStartDate:DESC']
        }
      }
    }
  });

  const [newTimeEntry, setTimeEntry] = useState({
    id: '',
    name: '',
    project: '',
    description: '',
    client: ''
  });

  const { data: projectData } = useQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id,
          client_id: ''
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  });

  const { loading, data: timeEntryData } = useQuery<GraphQLResponse<'TimeEntry', TimeEntryPagingResult>>(TIME_ENTRY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id,
          afterStart: moment().startOf('day'),
          entryType,
        },
        paging: {
          order: ['startTime:DESC']
        }
      }
    },
    onCompleted: (timeEntry) => {
      if (timeEntry?.TimeEntry?.activeEntry) {
        setDetailVisible(true)
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + computeDiff(timeEntry?.TimeEntry?.activeEntry?.startTime))
        setTimeEntry({
          id: timeEntry?.TimeEntry?.activeEntry?.id,
          name: timeEntry?.TimeEntry?.activeEntry?.company?.name,
          project: timeEntry?.TimeEntry?.activeEntry?.project?.name,
          description: timeEntry?.TimeEntry?.activeEntry?.description ?? '',
          client: timeEntry?.TimeEntry?.activeEntry?.project?.client?.name
        })
        reset(stopwatchOffset)
      }
    },
  });

  const entries = timeEntryData?.TimeEntry?.data ?? [];
  const todayGroupedEntries: ITodayGroupedEntries[] = useMemo(() => groupByDescriptionAndProject(entries), [entries]);

  const [updateTimeEntry, { loading: updatingTimeEntry }] = useMutation(UPDATE_TIME_ENTRY, {
    update: (cache, result: any) => {
      const data: any = cache.readQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id,
              afterStart: moment().startOf('day'),
              entryType,
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
      });

      const entries = data?.TimeEntry?.data ?? [];
      const newEntry = result.data.TimeEntryUpdate;

      cache.writeQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id,
              entryType,
              afterStart: moment().startOf('day'),
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
        data: {
          TimeEntry: {
            activeEntry: null,
            data: [...entries, newEntry]
          }
        }
      });
    },
    onCompleted: () => {
      reset(undefined, false)
      setDetailVisible(false);
      refetchTimeWeekly({
        input: {
          query: {
            company_id,
          },
          paging: {
            order: ['weekStartDate:DESC']
          }
        }
      })
      form.resetFields();
      message.success({
        content: `Time Entry is updated successfully!`,
        className: 'custom-message'
      });
    },
    onError: notifyGraphqlError,
  });

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    reset
  } = useStopwatch({
    autoStart: showDetailTimeEntry,
    offsetTimestamp: new Date()
  });

  const [createTimeEntry, { loading: creatingTimeEntry }] = useMutation(CREATE_TIME_ENTRY, {
    onCompleted: (response: any) => {
      start();
      setTimeEntry({
        id: response?.TimeEntryCreate?.id,
        name: response?.TimeEntryCreate?.company?.name,
        project: response?.TimeEntryCreate?.project?.name,
        description: response?.TimeEntryCreate?.description,
        client: response?.TimeEntryCreate?.project?.client?.name
      });
      setDetailVisible(true)
    }
  });

  /* eslint-disable no-template-curly-in-string */
  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const createTimeEntries = (values: any) => {
    stopwatchOffset = new Date()
    createTimeEntry({
      variables: {
        input: {
          startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          description: values.description,
          project_id: values.project,
          company_id,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const submitStopTimer = () => {
    stopwatchOffset = new Date()
    updateTimeEntry({
      variables: {
        input: {
          id: newTimeEntry?.id,
          endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          company_id,
        }
      }
    })
  }

  const onSubmitForm = (values: any) => {
    !isRunning ? createTimeEntries(values) : submitStopTimer();
  }

  const clickPlayButton = (entry: ITimeEntry) => {
    form.resetFields()
    !isRunning ? createTimeEntries({ description: entry.description, project: entry?.project?.id }) : submitStopTimer();
  }

  const getStartTime = (entries: any): any => {
    const minStartDate = entries.map((entry: any) => { return entry?.startTime })
    return _.min(minStartDate)
  }

  const getEndTime = (entries: any): any => {
    const maxEndDate = entries.map((entry: any) => { return entry?.endTime })
    return _.max(maxEndDate)
  }

  return (
    <>
      {loading ? <TimeSheetLoader /> :
        <div className={styles['site-card-wrapper']}>
          {/* TimeEntry Form */}
          {
            authData?.user?.type !== 'CICO' && (
              <Card
                bordered={false}
                className={styles['form-row']}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onSubmitForm}>

                  {showDetailTimeEntry ?
                    <Row>
                      <Col className={styles['form-col-header']} xs={24} sm={24} md={12} lg={12}>
                        <b>
                          <span>
                            {newTimeEntry?.name ?? timeEntryData?.TimeEntry?.activeEntry?.description}
                          </span> :
                          &nbsp;
                          {newTimeEntry?.project ?? timeEntryData?.TimeEntry?.activeEntry?.project?.name}
                        </b>
                      </Col>
                    </Row> :
                    <Row>
                      <Col className={styles['form-col']} xs={24} sm={24} md={12} lg={12}>
                        <Form.Item
                          name="project"
                          label="Project"
                          rules={[{
                            required: true,
                            message: 'Choose the project'
                          }]}>
                          <Select
                            placeholder="Select Project"
                          >
                            {
                              projectData && projectData?.Project?.data.map((project: any, index: number) => (
                                <Option
                                  value={project?.id}
                                  key={index}>
                                  {project?.name}
                                </Option>
                              ))
                            }
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>}

                  <Row>
                    <Col className={styles['description-col']} xs={24} sm={24} md={12} lg={12} xl={16}>
                      <Form.Item
                        name="description"
                        label="Description"
                        rules={[{
                          required: !showDetailTimeEntry,
                        }]}
                      >
                        {
                          showDetailTimeEntry ? (
                            <div className={styles['timesheet-description']}>
                              {newTimeEntry?.description}
                            </div> 
                          ) : <Input />
                        }
                      </Form.Item>
                    </Col>
                    <Col className={styles['time-start-col']} xs={24} sm={24} md={12} lg={12} xl={8}>
                      <TimerCard 
                        hours={hours} 
                        minutes={minutes} 
                        seconds={seconds} 
                        isRunning={isRunning} 
                        disabled={creatingTimeEntry ?? updatingTimeEntry}
                      />
                    </Col>
                  </Row>
                </Form>
              </Card>
            )
          }

          <br />

          {/* Today's TimeEntries Listing */}
          <Card
            bordered={false}
            className={styles['task-card']}>
            <Row>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}
                className={styles['form-col']}>
                <span className={styles['date-view']}>
                  {moment(new Date()).format('LL')}
                </span>
              </Col>
            </Row>
            <Row className={styles['task-div-header']}>
              {
                entryType !== EntryType.Cico && (
                  <Col
                    xs={24}
                    sm={24}
                    md={6}
                    lg={6}
                    xl={6}
                    className={styles['task-header']}
                  >
                    Description
                  </Col>
                )
              }
              <Col
                xs={0}
                sm={0}
                md={entryType !== EntryType.Cico ? 7 : 13}
                lg={entryType !== EntryType.Cico ? 7 : 13}
                xl={entryType !== EntryType.Cico ? 7 : 13}
                className={styles['client-header']}>
                Client: Project
              </Col>
              <Col
                xs={0}
                sm={0}
                md={3}
                lg={3}
                xl={3}
                className={styles['start-header']}>
                Start Time
              </Col>
              <Col
                xs={0}
                sm={0}
                md={3}
                lg={3}
                xl={3}
                className={styles['end-header']}>
                End Time
              </Col>
              <Col
                xs={0}
                sm={0}
                md={3}
                lg={3}
                xl={3}
                className={styles['total-header']}>
                Total
              </Col>
              <Col
                xs={0}
                sm={0}
                md={2}
                lg={2}
                xl={2}></Col>
            </Row>

            {timeEntryData?.TimeEntry?.data?.length === 0
              &&
              <NoContent
                title='Time entry Not Added!'
                subtitle='There are no entries added at the moment' />}

            <Form
              form={timeEntryForm}
              validateMessages={validateMessages}
            >
              <div className={styles['task-row']}>
                {
                  todayGroupedEntries.map((groupedEntry, index: number) => (
                    groupedEntry.entries.length > 1 ? (
                      <Collapse
                        ghost
                        key={`${groupedEntry.project_id} - ${groupedEntry.description}`}
                        collapsible="header"
                        className={styles['task-div-list']}
                      >
                        <Panel 
                          key={`${groupedEntry.project_id} - ${groupedEntry.description}`}
                          showArrow={false} 
                          header={
                            <TimeEntry
                              rowClassName="filter-task-list"
                              length={groupedEntry.entries?.length}
                              clickPlayButton={() => clickPlayButton(groupedEntry.entries[0])} 
                              timeEntry={groupedEntry.entries[0]}
                              minStartTime={getStartTime(groupedEntry.entries)}
                              maxEndTime={getEndTime(groupedEntry.entries)}
                              totalDuration={getTotalTimeForADay(groupedEntry.entries)}
                            />
                          } 
                        >
                          {
                            groupedEntry.entries.map((entry: any, entryIndex: number) => {
                              return (
                                <TimeEntry
                                  key={entry.id}
                                  rowClassName="filter-task-list"
                                  timeEntry={entry}
                                  length={entry?.length}
                                  clickPlayButton={() => clickPlayButton(entry)} 
                                />
                                )
                            })
                          }
                        </Panel>
                      </Collapse> 
                    ) : (
                      <span key={index}>
                        <TimeEntry
                          rowClassName={'task-div'}
                          length={groupedEntry.entries?.length}
                          clickPlayButton={() => clickPlayButton(groupedEntry.entries[0])} 
                          timeEntry={groupedEntry.entries[0]}
                          minStartTime={groupedEntry.entries[0]?.startTime}
                          maxEndTime={groupedEntry.entries[0]?.endTime}
                        />
                      </span>
                    )
                ))
                }
              </div>
            </Form>
          </Card>

          <br />

          {/* Weekly's Timesheet Listing */}
          <Card
            bordered={false}
            className={styles['weekly-timesheet-card']}>
            <Row>
              <Col span={12}>
                <div className={styles['timesheet']}>
                  My Timesheet
                </div>
              </Col>
              <Col span={12}>
                {/* <div
                  className={styles['add-time-stamp']}
                  onClick={() => setVisible(true)}>
                  Add Project
                </div> */}
              </Col>
            </Row>
            <Row>
              <Col
                xs={12}
                sm={16}
                md={18}
                lg={20}>
                <div className={styles['data-picker']}>
                  {/* <DatePicker.RangePicker style={{ width: '100%' }} /> */}
                </div>
              </Col>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}>
                {/* <div className={styles['next-icon']}>
                  <LeftOutlined />
                </div> */}
              </Col>
              <Col
                xs={6}
                sm={4}
                md={3}
                lg={2}>
                {/* <div className={styles['next-icon']}>
                  <RightOutlined />
                </div> */}
              </Col>
              <Col
                span={24}
                className={styles['card-col-timesheet']}>
                <Table
                  loading={loadTimesheetWeekly}
                  dataSource={timeWeeklyEntryData?.Timesheet?.data}
                  columns={columns}
                  rowKey={record => record?.id}
                  pagination={{
                    current: pagingInput.currentPage,
                    onChange: changePage,
                    total: timeWeeklyEntryData?.Timesheet?.paging?.total,
                    pageSize: constants.paging.perPage
                  }}
                />
              </Col>
            </Row>
          </Card>

          <Modal
            title=""
            centered
            visible={visible}
            closeIcon={[
              <div onClick={() => setVisible(false)} key={1}>
                <span className={styles['close-icon-div']}>
                  <CloseOutlined />
                </span>
              </div>
            ]}
            onOk={() => setVisible(false)}
            key={1}
            onCancel={() => setVisible(false)}
            okText={'Proceed'}
            width={1000}>
            <div className={styles['modal-title']}>
              Select Project
            </div>
            <div className={styles['form-modal']}>
              <Form
                form={form}
                layout="vertical">
                <Form.Item
                  name="client"
                  label="Client">
                  <Select placeholder="Select Client">
                    <Option value="client1">
                      Client 1
                    </Option>
                    <Option value="client2">
                      Client 2
                    </Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="project"
                  label="Project">
                  <Select placeholder="Select Project">
                    <Option value="project1">
                      Project 1
                    </Option>
                    <Option value="project2">
                      Project 2
                    </Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </Modal>
        </div>}
    </>
  )
}

function groupByDescriptionAndProject(entries: ITimeEntry[]) {
  const grouped: ITodayGroupedEntries[] = [];

  for(let entry of entries) {
    const project_id = entry.project_id;
    const description = entry.description;

    const foundIndex = findIndex(grouped, {
      description,
      project_id,
    });

    if(foundIndex >= 0) {
      grouped[foundIndex].entries.push(entry);
    } else {
      grouped.push({
        description,
        project_id,
        entries: [entry],
      });
    }
  }

  return grouped;
}


export default Timesheet;
