import { useState } from 'react';
import {
  Card,
  Col,
  Row,
  // DatePicker,
  Modal,
  Table,
  Form,
  Select,
  Button,
  message,
  Collapse
} from 'antd';
import {
  CloseOutlined,
  // LeftOutlined,
  // RightOutlined
} from '@ant-design/icons';

import moment from 'moment';
import _ from 'lodash';
import { authVar } from '../../App/link';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useStopwatch } from 'react-timer-hook';
import constants from '../../config/constants';

import routes from "../../config/routes";
import { useNavigate } from 'react-router-dom';
import { notifyGraphqlError } from "../../utils/error";

import { PROJECT } from '../Project';
import { CLIENT } from '../Client';
import { TASK } from '../Tasks';
import TimeSheetLoader from '../../components/Skeleton/TimeSheetLoader';
import TimeEntry from './TimeEntry';
import NoContent from '../../components/NoContent';

import styles from './style.module.scss';

export const STOP_TIMER = gql`
  mutation TimeEntryStop($input: TimeEntryStopInput!) {
    TimeEntryStop(input: $input) {
      id
      startTime
      endTime
      duration
    }
  }
`

export const CREATE_TIME_ENTRY = gql`
    mutation TimeEntryCreate($input: TimeEntryCreateInput!) {
      TimeEntryCreate(input: $input) {
          id
          startTime
          endTime
          createdAt
          duration
          task_id
          clientLocation
          task {
            id 
            name
          }
          company {
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
export const TIME_ENTRY = gql`
    query TimeEntry($input: TimeEntryQueryInput!) {
      TimeEntry(input: $input) {
            data {
                id
                startTime
                endTime
                createdAt
                duration
                clientLocation
                task_id
                task {
                    id 
                    name
                }
                company {
                    id
                    name
                }
                project {
                    id
                    name
                }
            }
            activeEntry {
              id
              id
              startTime
              endTime
              createdAt
              duration
              clientLocation
              task {
                  id 
                  name
              }
              company {
                  id
                  name
              }
              project {
                  id
                  name
              }
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

const { Panel } = Collapse;

const computeDiff = (date: Date) => {
  const currentDate = new Date();
  const pastDate = new Date(date);
  return (currentDate.getTime() - pastDate.getTime()) / 1000;
};

export const getTimeFormat = (seconds: any) => {
  let second = parseInt(seconds, 10);
  let sec_num = Math.abs(second);
  let hours: any = Math.floor(sec_num / 3600);
  let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
  let secs: any = sec_num - (hours * 3600) - (minutes * 60);

  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (secs < 10) { secs = "0" + secs; }
  return hours + ':' + minutes + ':' + secs;
};

const getHours = (seconds: any) => {
  const sec = parseInt(seconds, 10);
  let sec_num = Math.abs(sec);
  return Math.floor(sec_num / 3600);
}

const Timesheet = () => {
  const { Option } = Select;
  const authData = authVar();
  let navigate = useNavigate();
  const [form] = Form.useForm()
  const [timeEntryForm] = Form.useForm()
  const stopwatchOffset = new Date();
  const [visible, setVisible] = useState(false);
  const [showDetailTimeEntry, setDetailVisible] = useState<boolean>(false);
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>
    ({
      skip: 0,
      currentPage: 1,
    });


  const columns = [
    {
      title: 'Week',
      key: 'week',
      render: (record: any) =>
        <div>
          {record?.weekStartDate} - {record?.weekEndDate}
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
        <div>
          {getHours(record?.duration)}
        </div>
    },
    {
      title: 'Total Expense',
      key: 'totalExpense',
      render: (record: any) =>
        <div>
          {record?.totalExpense}
        </div>
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
        </div>,
    },
  ];

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const {
    data: timeWeeklyEntryData,
    loading: loadTimesheetWeekly,
    refetch: refetchTimeWeekly } = useQuery(TIME_WEEKLY, {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id
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
    task: ''
  });

  const [newTimeSheet, setNewTimeSheet] = useState({
    clientLocation: '',
    company: {
      id: '',
      name: '',
      __typename: 'Company'
    },
    createdAt: '',
    duration: '',
    endTime: '',
    id: '',
    project: {
      id: '',
      name: '',
      __typename: 'Project'
    },
    task_id: '',
    startTime: '',
    task: {
      id: '',
      name: '',
      __typename: 'Task'
    },
    __typename: 'TimeEntry'
  });

  const { data: clientData } = useQuery(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const [getProject, { data: projectData }] = useLazyQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          client_id: ''
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  });

  const { loading, data: timeEntryData } = useQuery(TIME_ENTRY, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          afterStart: moment().startOf('day')
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
          task: timeEntry?.TimeEntry?.activeEntry?.task?.name
        })
        setNewTimeSheet({
          clientLocation: timeEntry?.TimeEntry?.activeEntry?.clientLocation,
          company: {
            id: timeEntry?.TimeEntry?.activeEntry?.company?.id,
            name: timeEntry?.TimeEntry?.activeEntry?.company?.name,
            __typename: 'Company'
          },
          createdAt: timeEntry?.TimeEntry?.activeEntry?.createdAt,
          duration: '',
          endTime: '',
          id: timeEntry?.TimeEntry?.activeEntry?.id,
          project: {
            id: timeEntry?.TimeEntry?.activeEntry?.project?.id,
            name: timeEntry?.TimeEntry?.activeEntry?.project?.name,
            __typename: 'Project'
          },
          startTime: timeEntry?.TimeEntry?.activeEntry?.startTime,
          task_id: timeEntry?.TimeEntry?.activeEntry?.task?.id,
          task: {
            id: timeEntry?.TimeEntry?.activeEntry?.task?.id,
            name: timeEntry?.TimeEntry?.activeEntry?.task?.name,
            __typename: 'Task'
          },
          __typename: 'TimeEntry'
        })
        reset(stopwatchOffset)
      }
    },
  });


  const [stopTimer] = useMutation(STOP_TIMER, {
    update: (cache, result: any) => {
      newTimeSheet['endTime'] = result?.data?.TimeEntryStop?.endTime
      newTimeSheet['duration'] = result?.data?.TimeEntryStop?.duration

      const data: any = cache.readQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              afterStart: moment().startOf('day')
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
      });

      cache.writeQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              afterStart: moment().startOf('day')
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
        data: {
          TimeEntry: {
            activeEntry: null,
            data: [...data?.TimeEntry?.data, newTimeSheet]
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
            company_id: authData?.company?.id
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
    }
  })

  const [getTask, { data: taskData }] = useLazyQuery(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          project_id: ''
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

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

  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY, {
    onCompleted: (response: any) => {
      start();
      setNewTimeSheet(response?.TimeEntryCreate)
      setTimeEntry({
        id: response?.TimeEntryCreate?.id,
        name: response?.TimeEntryCreate?.company?.name,
        project: response?.TimeEntryCreate?.project?.name,
        task: response?.TimeEntryCreate?.task?.name
      });
      setDetailVisible(true);
    }
  });

  const getKeys = () => {
    const vals: any = [];
    for (const item of (timeEntryData?.TimeEntry?.data ?? [])) {
      if (!vals.includes(item?.task?.id)) {
        vals.push(item?.task?.id);
      }
    };
    return vals
  }

  const filterData = () => {
    const tasks = _.groupBy(timeEntryData?.TimeEntry?.data, 'task_id');
    return tasks;
  }

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

  const onChangeClientSelect = (value: string) => {
    form.resetFields(['project', 'task'])
    getProject({
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id,
            client_id: value
          },
          paging: {
            order: ['updatedAt:DESC']
          }
        }
      }
    });
  }

  const onChangeProjectSelect = (value: string) => {
    form.resetFields(['task']);
    getTask({
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id,
            project_id: value
          },
          paging: {
            order: ['updatedAt:DESC']
          }
        }
      }
    });
  }

  const createTimeEntries = (values: any) => {
    createTimeEntry({
      variables: {
        input: {
          startTime: moment(stopwatchOffset, "YYYY-MM-DD HH:mm:ss"),
          task_id: values.task,
          project_id: values.project,
          company_id: authData?.company?.id,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const submitStopTimer = () => {
    stopTimer({
      variables: {
        input: {
          id: newTimeEntry?.id,
          endTime: moment(stopwatchOffset, "YYYY-MM-DD HH:mm:ss"),
          company_id: authData?.company?.id
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const onSubmitForm = (values: any) => {
    !isRunning ? createTimeEntries(values) : submitStopTimer();
  }

  const clickPlayButton = (entry: string) => {
    const timesheet = filterData()[entry][0];
    !isRunning ? createTimeEntries({ task: entry, project: timesheet?.project?.id }) : submitStopTimer();
  }

  return (
    <>
      {loading ? <TimeSheetLoader /> :
        <div className={styles['site-card-wrapper']}>
          {/* TimeEntry Form */}
          <Card
            bordered={false}
            className={styles['form-row']}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmitForm}>

              {showDetailTimeEntry ?
                <Row>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    className={styles['form-col-header']}>
                    <b>
                      <span>
                        {newTimeEntry?.name ?? timeEntryData?.TimeEntry?.activeEntry?.name}
                      </span> :
                      &nbsp;
                      {newTimeEntry?.project ?? timeEntryData?.TimeEntry?.activeEntry?.project?.name}
                    </b>
                  </Col>
                </Row> :
                <Row>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    className={styles['form-col']}>
                    <Form.Item
                      name="client"
                      label="Client"
                      rules={[{
                        required: true,
                        message: 'Choose the client'
                      }]}>
                      <Select
                        placeholder="Select Client"
                        onChange={onChangeClientSelect}>
                        {clientData && clientData?.Client?.data.map((client: any, index: number) => (
                          <Option value={client?.id} key={index}>
                            <span>
                              {client?.name} &nbsp; / &nbsp;
                            </span>
                            <span>{client?.email}</span>
                          </Option>))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    className={styles['form-col']}>
                    <Form.Item
                      name="project"
                      label="Project"
                      rules={[{
                        required: true,
                        message: 'Choose the project'
                      }]}>
                      <Select
                        placeholder="Select Project"
                        onChange={onChangeProjectSelect}>
                        {projectData && projectData?.Project?.data.map((project: any, index: number) => (
                          <Option
                            value={project?.id}
                            key={index}>
                            {project?.name}
                          </Option>))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>}

              <Row>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={16}
                  xl={18}
                  className={styles['task-col']}>
                  <Form.Item
                    name="task"
                    label="Task"
                    rules={[{
                      required: !showDetailTimeEntry,
                      message: 'Choose the task'
                    }]}>
                    {showDetailTimeEntry ?
                      <div className={styles['timesheet-task']}>
                        {newTimeEntry?.task}
                      </div> :
                      <Select placeholder="Select Task">
                        {taskData && taskData?.Task?.data.map((task: any, index: number) => (
                          <Option
                            value={task?.id}
                            key={index}>
                            {task?.name}
                          </Option>)
                        )}
                      </Select>}
                  </Form.Item>
                </Col>
                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={8}
                  xl={6}
                  className={styles['time-start-col']}>
                  <Form.Item>
                    <div className={styles['timer-div']}>
                      <div>
                        <span>
                          {(hours > 9 ? hours : '0' + hours) + ':' +
                            (minutes > 9 ? minutes : '0' + minutes) + ':'
                            + (seconds > 9 ? seconds : '0' + seconds)}
                        </span>
                      </div>
                      &nbsp; &nbsp; &nbsp; &nbsp;
                      <div>
                        {isRunning ?
                          <Button
                            type="primary"
                            htmlType="submit"
                            danger>
                            Stop
                          </Button> :
                          <Button
                            type="primary"
                            htmlType="submit">
                            Start
                          </Button>}
                      </div>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>

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
              <Col
                span={6}
                className={styles['task-header']}>
                Task
              </Col>
              <Col
                span={4}
                className={styles['client-header']}>
                Client: Project
              </Col>
              <Col
                span={3}
                className={styles['start-header']}>
                Start Time
              </Col>
              <Col
                span={3}
                className={styles['end-header']}>
                End Time
              </Col>
              <Col
                span={4}
                className={styles['total-header']}>
                Total
              </Col>
              <Col span={4}></Col>
            </Row>

            {timeEntryData?.TimeEntry?.data?.length === 0
              &&
              <NoContent
                title='TimeEntry Not Added!'
                subtitle='There is no entries added at the moment' />}

            <Form
              form={timeEntryForm}
              validateMessages={validateMessages}>
              <div className={styles['task-row']}>
                {getKeys() && getKeys()?.map((entry: any, index: number) => (

                  (filterData()[entry].length > 1) ?
                    <Collapse
                      collapsible="header"
                      ghost
                      className={styles['task-div-list']}
                      key={index}>
                      <Panel showArrow={false} header={
                        <TimeEntry
                          rowClassName={'filter-task-list'}
                          index={index}
                          data={{
                            project: filterData()[entry][0]?.project?.name,
                            name: filterData()[entry][0]?.task?.name,
                            startTime: filterData()[entry][0]?.startTime,
                            endTime: filterData()[entry][0]?.endTime,
                            duration: filterData()[entry][0]?.duration
                          }}
                          length={filterData()[entry]?.length}
                          clickPlayButton={() => clickPlayButton(entry)} />} key={index}>
                        {filterData()[entry].map((timeData: any, entryIndex: number) => {
                          return (
                            <TimeEntry
                              key={entryIndex}
                              rowClassName={'filter-task-list'}
                              index={index}
                              data={{
                                project: timeData?.project?.name,
                                name: timeData?.task?.name,
                                startTime: timeData?.startTime,
                                endTime: timeData?.endTime,
                                duration: timeData?.duration
                              }}
                              length={timeData?.length}
                              clickPlayButton={() => clickPlayButton(entry)} />)
                        })}
                      </Panel>
                    </Collapse> :
                    <span key={index}>
                      <TimeEntry
                        rowClassName={'task-div'}
                        index={index}
                        data={{
                          project: filterData()[entry][0]?.project?.name,
                          name: filterData()[entry][0]?.task?.name,
                          startTime: filterData()[entry][0]?.startTime,
                          endTime: filterData()[entry][0]?.endTime,
                          duration: filterData()[entry][0]?.duration
                        }}
                        length={filterData()[entry]?.length}
                        clickPlayButton={() => clickPlayButton(entry)} />
                    </span>
                ))}
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

export default Timesheet;
