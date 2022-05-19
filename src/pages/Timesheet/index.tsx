import { useState } from 'react';
import {
  Card,
  Col,
  Row,
  DatePicker,
  Modal,
  Form,
  Select,
  Button,
  message,
  Input,
  Collapse
} from 'antd';
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';

import { authVar } from '../../App/link';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { useStopwatch } from 'react-timer-hook';
import { notifyGraphqlError } from "../../utils/error";
import { PROJECT } from '../Project';
import { CLIENT } from '../Client';

import moment from 'moment';
import { TASK } from '../Tasks';
import { TimeEntryPagingResult } from '../../interfaces/generated';
import TimeSheetLoader from '../../components/Skeleton/TimeSheetLoader';

import NoContent from '../../components/NoContent';
import playBtn from '../../assets/images/play-circle.svg';
import WeeklyTimeSheet from './WeeklyTimesheet';

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

export const UPDATE_TIME_ENTRY = gql`
    mutation TimeEntryUpdate($input: TimeEntryUpdateInput!) {
      TimeEntryUpdate(input: $input) {
            id
            company_id
            endTime
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

const { Panel } = Collapse;

const computeDiff = (date: Date) => {
  const currentDate = new Date();
  const pastDate = new Date(date);
  const diff = (currentDate.getTime() - pastDate.getTime()) / 1000;
  return diff
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
}

interface TimeEntryResponseArray {
  TimeEntry: TimeEntryPagingResult
}


const Timesheet = () => {
  const { Option } = Select;
  const authData = authVar();
  const [form] = Form.useForm()
  const [timeEntryForm] = Form.useForm()
  const stopwatchOffset = new Date();
  const [UpdateTimeEntry] = useMutation(UPDATE_TIME_ENTRY);
  const [visible, setVisible] = useState(false);
  const [showDetailTimeEntry, setDetailVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [newTimeEntry, setTimeEntry] = useState({
    id: '',
    name: '',
    project: '',
    task: ''
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
        reset(stopwatchOffset)
      }
    },
  });

  const [newTimeSheet, setNewTimeSheet] = useState({
    clientLocation: timeEntryData?.TimeEntry?.activeEntry?.clientLocation,
    company: {
      id: timeEntryData?.TimeEntry?.activeEntry?.company?.id,
      name: timeEntryData?.TimeEntry?.activeEntry?.company?.name,
      __typename: 'Company'
    },
    createdAt: timeEntryData?.TimeEntry?.activeEntry?.createdAt,
    duration: '',
    endTime: '',
    id: timeEntryData?.TimeEntry?.activeEntry?.id,
    project: {
      id: timeEntryData?.TimeEntry?.activeEntry?.project?.id,
      name: timeEntryData?.TimeEntry?.activeEntry?.project?.name,
      __typename: 'Project'
    },
    startTime: timeEntryData?.TimeEntry?.activeEntry?.startTime,
    task: {
      id: timeEntryData?.TimeEntry?.activeEntry?.task?.id,
      name: timeEntryData?.TimeEntry?.activeEntry?.task?.name,
      __typename: 'Task'
    },
    __typename: 'TimeEntry'
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
  } = useStopwatch({ autoStart: showDetailTimeEntry });
  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY);

  const getKeys = () => {
    var vals: any = [];
    if (timeEntryData?.TimeEntry?.data) {
      for (var item of timeEntryData?.TimeEntry?.data) {
        if (!vals.includes(item?.task?.id)) {
          vals.push(item?.task?.id);
        }
      }
    }
    return vals
  }

  const filterData = () => {
    let grouped: any = {};
    timeEntryData?.TimeEntry?.data?.map((entry: any) => {
      grouped[entry?.task?.id] = grouped[entry?.task?.id] ?? [];
      return grouped[entry?.task?.id]?.push({
        name: entry?.task?.name,
        project: entry?.project?.name,
        project_id: entry?.project?.id,
        startTime: entry?.startTime,
        endTime: entry?.endTime,
        duration: entry?.duration
      })
    });
    return grouped
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

  const onFinish = (values: any) => {
    console.log("form values", values);
  };

  const onChangeClientSelect = (value: string) => {
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
    }).then(r => { })
  }

  const onChangeProjectSelect = (value: string) => {
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
    }).then(r => { })
  }

  const onSubmitForm = (values: any) => {
    setCurrentDate(new Date())
    if (!isRunning) {
      createTimeEntry({
        variables: {
          input: {
            startTime: moment(currentDate, "YYYY-MM-DD HH:mm:ss"),
            task_id: values.task,
            project_id: values.project,
            company_id: authData?.company?.id,
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          start();
          setNewTimeSheet(response?.data?.TimeEntryCreate)
          setTimeEntry({
            id: response?.data?.TimeEntryCreate?.id,
            name: response?.data?.TimeEntryCreate?.company?.name,
            project: response?.data?.TimeEntryCreate?.project?.name,
            task: response?.data?.TimeEntryCreate?.task?.name
          });
          setDetailVisible(true);
        }
      }).catch(notifyGraphqlError)
    } else {
      console.log('submit');
      stopTimer({
        variables: {
          input: {
            id: newTimeEntry?.id,
            endTime: moment(currentDate, "YYYY-MM-DD HH:mm:ss"),
            company_id: authData?.company?.id
          }
        }
      }).then((response) => {
        console.log(response)
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          reset(undefined, false)
          setDetailVisible(false);
          form.resetFields();
          message.success({ content: `Time Entry is updated successfully!`, className: 'custom-message' });
        }
      }).catch(notifyGraphqlError)
    }
  }

  const clickPlayButton = (entry: string) => {
    const timesheet = filterData()[entry][0];
    if (!isRunning) {
      createTimeEntry({
        variables: {
          input: {
            startTime: moment(new Date(), "YYYY-MM-DD HH:mm:ss"),
            task_id: entry,
            project_id: timesheet?.project_id,
            company_id: authData?.company?.id,
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          start();
          setTimeEntry({
            id: response?.data?.TimeEntryCreate?.id,
            name: response?.data?.TimeEntryCreate?.company?.name,
            project: response?.data?.TimeEntryCreate?.project?.name,
            task: response?.data?.TimeEntryCreate?.task?.name
          });
          setDetailVisible(true);
        }
      }).catch(notifyGraphqlError);
    } else {
      console.log('submit');
      stopTimer({
        variables: {
          input: {
            id: newTimeEntry?.id,
            endTime: moment(new Date(), "YYYY-MM-DD HH:mm:ss"),
            company_id: authData?.company?.id
          }
        }
      }).then((response) => {
        console.log(response)
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          reset(undefined, false)
          setDetailVisible(false);
          form.resetFields();
          message.success({ content: `Time Entry is updated successfully!`, className: 'custom-message' });
        }
      }).catch(notifyGraphqlError)
    }
  }

  return (
    <>
      {loading ? <TimeSheetLoader /> :
        <div className={styles['site-card-wrapper']}>
          <Card
            bordered={false}
            className={styles['form-row']}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmitForm}>

              {showDetailTimeEntry ?
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-header']}>
                    <b>
                      <span>{newTimeEntry?.name ?? timeEntryData?.TimeEntry?.activeEntry?.name}</span> :
                      &nbsp;{newTimeEntry?.project ?? timeEntryData?.TimeEntry?.activeEntry?.project?.name}
                    </b>
                  </Col>
                </Row> :
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col']}>
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
                              <b>{client?.name}</b> &nbsp; / &nbsp;
                            </span>
                            <span>{client?.email}</span>
                          </Option>))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col']}>
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
                          <Option value={project?.id} key={index}>
                            {project?.name}
                          </Option>))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>}

              <Row>
                <Col xs={24} sm={24} md={12} lg={16} xl={18} className={styles['task-col']}>
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
                          <Option value={task?.id} key={index}>
                            {task?.name}
                          </Option>)
                        )}
                      </Select>}
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={12} lg={8} xl={6} className={styles['time-start-col']}>
                  <Form.Item>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <div style={{ width: '50%' }}>
                        <div style={{ textAlign: 'center' }}>
                          <span>
                            {(hours > 9 ? hours : '0' + hours) + ':' +
                              (minutes > 9 ? minutes : '0' + minutes) + ':'
                              + (seconds > 9 ? seconds : '0' + seconds)}
                          </span>
                        </div>
                      </div> &nbsp; &nbsp; &nbsp; &nbsp;
                      <div style={{ width: '50%' }}>
                        {isRunning ?
                          <Button type="primary" htmlType="submit" danger>Stop</Button> :
                          <Button type="primary" htmlType="submit">Start</Button>}
                      </div>
                    </div>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
          <br />
          <Card
            bordered={false}
            className={styles['task-card']}>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col']}>
                <span className={styles['date-view']}>
                  {moment(new Date()).format('LL')}
                </span>
              </Col>
            </Row>
            <Row className={styles['task-div-header']}>
              <Col span={4} className={styles['task-header']}>Task</Col>
              <Col span={4} className={styles['client-header']}>Client: Project</Col>
              <Col span={4} className={styles['start-header']}>Start Time</Col>
              <Col span={4} className={styles['end-header']}>End Time</Col>
              <Col span={4} className={styles['total-header']}>Total</Col>
              <Col span={4}></Col>
            </Row>
            {timeEntryData?.TimeEntry?.data?.length === 0 && <NoContent title={"Time Entry"} />}
            <Form
              form={timeEntryForm}
              onFinish={onFinish}
              validateMessages={validateMessages}>
              <div className={styles['task-row']}>
                {getKeys() && getKeys()?.map((entry: any, index: number) => (
                  (filterData()[entry].length > 1) ?
                    <Collapse collapsible="header" ghost className={styles['task-div-list']} key={index}>
                      <Panel showArrow={false} header={
                        <Row className={styles['filter-task-list']}>
                          <Col span={4} className={styles['task-name']}>
                            <div>
                              {filterData()[entry].length > 1 &&
                                <p>
                                  {filterData()[entry].length}
                                </p>}
                            </div>
                            <Form.Item
                              name={`name${index}`}
                              rules={[{ required: true }]}>
                              <Input
                                type="text"
                                defaultValue={filterData()[entry][0]?.name ?? ''}
                                value={filterData()[entry][0]?.name ?? ''} />
                            </Form.Item>
                          </Col>

                          <Col span={4} className={styles['client-name']}>
                            <Form.Item
                              name={`client${index}`}
                              rules={[{ required: true }]}>
                              <Input type="text"
                                defaultValue={filterData()[entry][0]?.project ?? ''}
                                value={filterData()[entry][0]?.project ?? ''} />
                            </Form.Item>
                          </Col>

                          <Col span={4} className={styles['start-time']}>
                            <Form.Item
                              name={`start${index}`}
                              rules={[{ required: true }]}>
                              <Input type="text"
                                defaultValue={moment(filterData()[entry][0]?.startTime).format('LT')}
                                value={moment(filterData()[entry][0]?.startTime).format('LT')} />
                            </Form.Item>
                          </Col>

                          <Col span={4} className={styles['end-time']}>
                            <Form.Item
                              name={`end${index}`}
                              rules={[{ required: true }]}>
                              <Input type="text"
                                defaultValue={moment(filterData()[entry][0]?.endTime).format('LT')}
                                value={moment(filterData()[entry][0]?.endTime).format('LT')} />
                            </Form.Item>
                          </Col>

                          <Col span={4} className={styles['total-time']}>
                            <span>{getTimeFormat(filterData()[entry][0]?.duration) ?? 'N/A'}</span>
                          </Col>
                          <Col span={4} className={styles['play-button']} onClick={() => clickPlayButton(entry)}>
                            <img src={playBtn} alt="play Button" />
                          </Col>
                        </Row>
                      } key={index}>
                        {filterData()[entry].map((timeData: any, entryIndex: number) => {
                          return (
                            <Row key={entryIndex} className={styles['filter-task-list']}>
                              <Col span={4} className={styles['task-name']}>
                                <Form.Item
                                  name={`name${index}`}
                                  rules={[{ required: true }]}>
                                  <Input type="text" defaultValue={timeData?.name ?? ''} />
                                </Form.Item>
                              </Col>

                              <Col span={4} className={styles['client-name']}>
                                <Form.Item
                                  name={`client${index}`}
                                  rules={[{ required: true }]}>
                                  <Input type="text"
                                    defaultValue={timeData?.project ?? ''} />
                                </Form.Item>
                              </Col>

                              <Col span={4} className={styles['start-time']}>
                                <Form.Item
                                  name={`start${index}`}
                                  rules={[{ required: true }]}>
                                  <Input type="text"
                                    defaultValue={moment(timeData?.startTime).format('LT')} />
                                </Form.Item>
                              </Col>

                              <Col span={4} className={styles['end-time']}>
                                <Form.Item
                                  name={`end${index}`}
                                  rules={[{ required: true }]}>
                                  <Input type="text"
                                    defaultValue={moment(timeData?.endTime).format('LT')} />
                                </Form.Item>
                              </Col>

                              <Col span={4} className={styles['total-time']}>
                                <span>{getTimeFormat(timeData?.duration) ?? 'N/A'}</span>
                              </Col>
                              <Col span={4} className={styles['play-button']} onClick={() => clickPlayButton(entry)}>
                                <img src={playBtn} alt="play Button" />
                              </Col>
                            </Row>)
                        })}
                      </Panel>
                    </Collapse> :
                    <Row className={styles['task-div']}>
                      <Col span={4} className={styles['task-name']}>
                        <div>
                          {filterData()[entry].length > 1 &&
                            <p>
                              {filterData()[entry].length}
                            </p>}
                        </div>
                        <Form.Item
                          name={`name${index}`}
                          rules={[{ required: true }]}>
                          <Input type="text" defaultValue={filterData()[entry][0]?.name ?? ''} />
                        </Form.Item>
                      </Col>

                      <Col span={4} className={styles['client-name']}>
                        <Form.Item
                          name={`client${index}`}
                          rules={[{ required: true }]}>
                          <Input type="text" defaultValue={filterData()[entry][0]?.project ?? ''} />
                        </Form.Item>
                      </Col>

                      <Col span={4} className={styles['start-time']}>
                        <Form.Item
                          name={`start${index}`}
                          rules={[{ required: true }]}>
                          <Input type="text" defaultValue={moment(filterData()[entry][0]?.startTime).format('LT')} />
                        </Form.Item>
                      </Col>

                      <Col span={4} className={styles['end-time']}>
                        <Form.Item
                          name={`end${index}`}
                          rules={[{ required: true }]}>
                          <Input type="text" defaultValue={moment(filterData()[entry][0]?.endTime).format('LT')} />
                        </Form.Item>
                      </Col>

                      <Col span={4} className={styles['total-time']}>
                        <span>{getTimeFormat(filterData()[entry][0]?.duration) ?? 'N/A'}</span>
                      </Col>
                      <Col span={4} className={styles['play-button']} onClick={() => clickPlayButton(entry)}>
                        <img src={playBtn} alt="play Button" />
                      </Col>
                    </Row>
                ))}
              </div>
            </Form>
          </Card>
          <br />
          <Card
            bordered={false}
            style={{ padding: '2rem 1rem 2rem 1rem' }}>
            <Row>
              <Col span={12}>
                <div className={styles['timesheet']}>
                  My Timesheet
                </div>
              </Col>
              <Col span={12}>
                <div
                  className={styles['add-time-stamp']}
                  onClick={() => setVisible(true)}>
                  Add Project
                </div>
              </Col>
            </Row>
            <Row>
              <Col xs={12} sm={16} md={18} lg={20}>
                <div className={styles['data-picker']}>
                  <DatePicker.RangePicker style={{ width: '100%' }} />
                </div>
              </Col>
              <Col xs={6} sm={4} md={3} lg={2}>
                <div className={styles['next-icon']}>
                  <LeftOutlined />
                </div>
              </Col>
              <Col xs={6} sm={4} md={3} lg={2}>
                <div className={styles['next-icon']}>
                  <RightOutlined />
                </div>
              </Col>
              <Col span={24} className={styles['card-col-timesheet']}>
                <WeeklyTimeSheet />
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
            onCancel={() => setVisible(false)}
            okText={'Proceed'}
            width={1000}>
            <div className={styles['modal-title']}>Select Project</div>
            <div className={styles['form-modal']}>
              <Form
                form={form}
                layout="vertical">
                <Form.Item
                  name="client"
                  label="Client">
                  <Select placeholder="Select Client">
                    <Option value="client1">Client 1</Option>
                    <Option value="client2">Client 2</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="project"
                  label="Project">
                  <Select placeholder="Select Project">
                    <Option value="project1">Project 1</Option>
                    <Option value="project2">Project 2</Option>
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
