import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Table,
  DatePicker,
  Modal,
  Form,
  Select,
  Button,
  message,
  Input
} from 'antd';
import {
  CloseOutlined,
  LeftOutlined,
  PlusCircleOutlined,
  RightOutlined
} from '@ant-design/icons';

import routes from "../../config/routes";
import { useNavigate } from "react-router-dom";
import { authVar } from "../../App/link";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useStopwatch } from 'react-timer-hook';
import { notifyGraphqlError } from "../../utils/error";
import { PROJECT } from "../Project";
import { CLIENT } from "../Client";

import moment from "moment";
import { TASK } from "../Tasks";
import { TimeEntryPagingResult } from "../../interfaces/generated";
import TimeSheetLoader from "../../components/Skeleton/TimeSheetLoader";

import styles from "./style.module.scss";
import NoContent from "../../components/NoContent";

export const CREATE_TIME_ENTRY = gql`
    mutation TimeEntryCreate($input: TimeEntryCreateInput!) {
      TimeEntryCreate(input: $input) {
            id
            startTime
            endTime
            createdAt
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
            end
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
        }
    }
`;

const computeDiff = (date: Date) => {
  const currentDate = new Date();
  const pastDate = new Date(date);
  const diff = (currentDate.getTime() - pastDate.getTime()) / 1000;
  return diff
};

const getTimeFormat = (seconds: any) => {
  let second = parseInt(seconds, 10); 
  let sec_num = Math.abs(second);
  let hours: any = Math.floor(sec_num / 3600);
  let minutes: any = Math.floor((sec_num - (hours * 3600)) / 60);
  let secs: any = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (secs < 10) {secs = "0"+secs;}
  return hours+':'+minutes+':'+secs;
}

interface TimeEntryResponseArray {
  TimeEntry: TimeEntryPagingResult
}


const Timesheet = () => {
  const { Option } = Select;
  const authData = authVar();
  let navigate = useNavigate();
  const [form] = Form.useForm();
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

  const columns = [
    {
      title: 'Project Name',
      key: 'project',
      render: (record: any) =>
        <div>
          {record?.project?.name}
        </div>
    },
    {
      title: 'Company',
      key: 'company',
      render: (record: any) =>
        <div>
          {record?.company?.name}
        </div>
    },
    {
      title: 'Location',
      key: 'clientLocation',
      render: (record: any) =>
        <div>
          {record?.clientLocation ?? <span className={styles['null-span']}>N/A</span>}
        </div>
    },
    {
      title: 'Approved by',
      key: 'approver',
      render: (record: any) =>
        <div>
          {record?.approver ?? <span className={styles['null-span']}>N/A</span>}
        </div>
    },
    {
      title: 'Created At',
      key: 'createdAt',
      render: (record: any) =>
        <div>
          {moment(record?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
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
          <PlusCircleOutlined /> &nbsp; &nbsp; <span>Edit</span>
        </div>,
    },
  ];

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
      console.log("On Complete Trigger", timeEntry?.TimeEntry?.data[0]?.end)
      if (timeEntry?.TimeEntry?.data[0]?.end === null) {
        setDetailVisible(true)
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + computeDiff(timeEntry?.TimeEntry?.data[0]?.startTime))
        setTimeEntry({
          id: timeEntry?.TimeEntry?.data[0]?.id,
          name: timeEntry?.TimeEntry?.data[0]?.company?.name,
          project: timeEntry?.TimeEntry?.data[0]?.project?.name,
          task: timeEntry?.TimeEntry?.data[0]?.task?.name
        })
        reset(stopwatchOffset)
      }
    },
  });



  const [CreateTimeEntry] = useMutation(CREATE_TIME_ENTRY, {
    update(cache, { data }) {
      const response = data?.TimeEntryCreate;
      const timeEntry = cache.readQuery<TimeEntryResponseArray>({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
            },
            paging: {
              order: ['createdAt:DESC']
            }
          }
        }
      });
      if (timeEntry) {
        let arrayData = timeEntry?.TimeEntry?.data
        console.log('arrayData', arrayData?.length, [...arrayData, response].length);
        cache.writeQuery({
          query: TIME_ENTRY,
          data: {
            TimeEntry: {
              data: [response, ...arrayData]
            }
          }
        })
      }
    }
  })

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
    console.log(values);
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
      CreateTimeEntry({
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
      UpdateTimeEntry({
        variables: {
          input: {
            id: newTimeEntry?.id,
            end: moment(currentDate, "YYYY-MM-DD HH:mm:ss"),
            company_id: authData?.company?.id
          }
        }
      }).then((response) => {
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
            className={styles.formRow}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmitForm}>

              {showDetailTimeEntry ?
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12} className={styles.formColHeader}>
                    <b>
                      <span>{newTimeEntry?.name ?? timeEntryData?.TimeEntry?.data[0]?.name}</span> :
                      &nbsp;{newTimeEntry?.project ?? timeEntryData?.TimeEntry?.data[0]?.project?.name}
                    </b>
                  </Col>
                </Row> :
                <Row>
                  <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
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

                  <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
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
                <Col xs={24} sm={24} md={12} lg={16} xl={18} className={styles.taskCol}>
                  <Form.Item
                    name="task"
                    label="Task"
                    rules={[{
                      required: !showDetailTimeEntry, 
                      message: 'Choose the task'
                    }]}>
                    {showDetailTimeEntry ?
                      <div className={styles['timesheetTask']}>
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

                <Col xs={24} sm={24} md={12} lg={8} xl={6} className={styles.timeStartCol}>
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
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <span className={styles['date-view']}>
                  April 26, 2022
                  </span>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <div className={styles['task-div-header']}>
                  <div className={styles['task-header']}>Task</div>
                  <div className={styles['client-header']}>Client: Project</div>
                  <div className={styles['start-header']}>Start Time</div>
                  <div className={styles['end-header']}>End Time</div>
                  <div className={styles['total-header']}>Total</div>
                </div>
              </Col>
            </Row>
            {timeEntryData?.TimeEntry?.data?.length === 0 && <NoContent title={"Time Entry"}/>}
            <Form
              onFinish={onFinish}
              validateMessages={validateMessages}>
                {timeEntryData && timeEntryData?.TimeEntry?.data.map((entry: any, index: number) => (
                    <Row className={styles['task-row']} key={index}>
                      <Col span={24} className={styles['task-div-list']}>
                        <div className={styles['task-name']}>
                          <Form.Item
                            name={`name${index}`}
                            rules={[{ required: true }]}>
                            <Input type="text" defaultValue={entry?.task?.name ?? ''} />
                          </Form.Item>
                        </div>
    
                        <div className={styles['client-name']}>
                          <Form.Item
                            name={`client${index}`}
                            rules={[{ required: true }]}>
                            <Input type="text" defaultValue={entry?.project?.name ?? ''} />
                          </Form.Item>
                        </div>
    
                        <div className={styles['start-time']}>
                          <Form.Item
                            name={`start${index}`}
                            rules={[{ required: true }]}>
                            <Input type="text" defaultValue={moment(entry?.startTime).format('LT')} />
                          </Form.Item>
                        </div>
    
                        <div className={styles['end-time']}>
                        <Form.Item
                          name={`end${index}`}
                          rules={[{ required: true }]}>
                          <Input type="text" defaultValue={moment(entry?.end).format('LT')} />
                        </Form.Item>
                        </div>
    
                        <div className={styles['total-time']}>
                        <span>{getTimeFormat(entry?.duration)}</span>
                        </div>
    
                      </Col>
                  </Row>
                ))}
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
                <Table
                  dataSource={timeEntryData?.TimeEntry?.data}
                  columns={columns}
                  rowKey={record => record?.id}
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
