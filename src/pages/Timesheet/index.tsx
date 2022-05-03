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
import { gql, useMutation, useQuery } from "@apollo/client";
import { useStopwatch } from 'react-timer-hook';
import { notifyGraphqlError } from "../../utils/error";
import { PROJECT } from "../Project";
import { CLIENT } from "../Client";

import moment from "moment";
import { TASK } from "../Tasks";

import { TimesheetPagingResult } from "../../interfaces/generated";
import styles from "./style.module.scss";

export const CREATE_TIMESHEET = gql`
    mutation TimesheetCreate($input: TimesheetCreateInput!) {
        TimesheetCreate(input: $input) {
            id
            start
            end
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
            approver {
                firstName
            }
            project {
                id
                name
            }
        }
    }
`

export const UPDATE_TIMESHEET = gql`
    mutation TimesheetUpdate($input: TimesheetUpdateInput!) {
        TimesheetUpdate(input: $input) {
            id
            company_id
        }
    }
`

export const TIMESHEET = gql`
    query Timesheet($input: TimesheetQueryInput!) {
        Timesheet(input: $input) {
            data {
                id
                start
                end
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
                approver {
                    firstName
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
  const futureDate = new Date(2028, 0, 1, 12, 0, 0);
  const diff = futureDate.getTime() - currentDate.getTime();
  return diff / (1000 * 60 * 60 * 24);
};

interface TimesheetResponseArray {
  Timesheet: TimesheetPagingResult
}


const Timesheet = () => {
  const { Option } = Select;
  const authData = authVar();
  let navigate = useNavigate();
  const [form] = Form.useForm();
  const stopwatchOffset = new Date();
  const [UpdateTimesheet] = useMutation(UPDATE_TIMESHEET);
  const [visible, setVisible] = useState(false);
  const [showDetailTimeSheet, setDetailVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [newTimeSheet, setTimesheet] = useState({
    id: '',
    name: '',
    project: ''
  });

  const columns = [
    {
      title: 'Project Name',
      key: 'project',
      render: (record:any) =>
        <div>
          {record?.project?.name}
        </div>
    },
    {
      title: 'Company',
      key: 'company',
      render: (record:any) =>
        <div>
          {record?.company?.name}
        </div>
    },
    {
      title: 'Location',
      key: 'clientLocation',
      render: (record:any) =>
        <div>
          {record?.clientLocation ?? <span className={styles['null-span']}>N/A</span>}
        </div>
    },
    {
      title: 'Approved by',
      key: 'approver',
      render: (record:any) =>
        <div>
          {record?.approver ?? <span className={styles['null-span']}>N/A</span>}
        </div>
    },
    {
      title: 'Created At',
      key: 'createdAt',
      render: (record:any) =>
        <div>
          {moment(record?.createdAt).format('MMMM Do YYYY, h:mm:ss a')}
        </div>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']} onClick={(e) => {
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

  const { data: projectData } = useQuery(PROJECT, {
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

  const { data: taskData } = useQuery(TASK, {
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

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    reset
  } = useStopwatch({ autoStart: showDetailTimeSheet, offsetTimestamp: stopwatchOffset});

  const { data: timesheetData } = useQuery(TIMESHEET, {
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
        },
        paging: {
          order: ['createdAt:DESC']
        }
      }
    },
    onCompleted: (timesheet) => {
      if (timesheet?.Timesheet?.data[0]?.end === null) {
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + computeDiff(timesheet?.Timesheet?.data[0]?.start))
        setDetailVisible(true)
        setTimesheet({
          id: timesheet?.Timesheet?.data[0]?.id,
          name: timesheet?.Timesheet?.data[0]?.company?.name,
          project: timesheet?.Timesheet?.data[0]?.project?.name
        })
        reset(stopwatchOffset)
      }
    },
  });



  const [CreateTimesheet] = useMutation(CREATE_TIMESHEET, {
    update(cache, {data}) {
      const response = data?.TimesheetCreate;
      const timeSheets = cache.readQuery<TimesheetResponseArray>({
        query: TIMESHEET,
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
      if (timeSheets) {
        let arrayData = timeSheets?.Timesheet?.data
        console.log('arrayData',  arrayData?.length, [...arrayData, response].length);
        cache.writeQuery({
          query: TIMESHEET,
          data: {
            Timesheet: {
              data: [response, ...arrayData]
            }
          }
        })
      }
    }})

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

  const onSubmitForm = (values: any) => {
    setCurrentDate(new Date())
    if (!isRunning) {
      CreateTimesheet({
        variables: {
          input: {
            start: moment(currentDate, "YYYY-MM-DD HH:mm:ss"),
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
          setTimesheet({
            id: response?.data?.TimesheetCreate?.id,
            name: response?.data?.TimesheetCreate?.company?.name,
            project: response?.data?.TimesheetCreate?.project?.name
          });
          setDetailVisible(true);
        }
      }).catch(notifyGraphqlError)
    } else {
      UpdateTimesheet({
        variables: {
          input: {
            id: newTimeSheet?.id,
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
          message.success({content: `Timesheet is updated successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError)
    }
  }

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false} className={styles.formRow}>
        {timesheetData &&
          <Form form={form} layout="vertical" onFinish={onSubmitForm} initialValues={{
            task: showDetailTimeSheet ? timesheetData?.Timesheet?.data[0]?.task?.id : taskData?.Task?.data[0]?.id}}>
            {showDetailTimeSheet ?
              <Row>
                <Col xs={24} sm={24} md={12} lg={12} className={styles.formColHeader}>
                  <b>
                    <span>{newTimeSheet?.name ?? timesheetData?.Timesheet?.data[0]?.name}</span> :
                    &nbsp;{newTimeSheet?.project ?? timesheetData?.Timesheet?.data[0]?.project?.name}
                  </b>
                </Col>
              </Row>:
              <Row>
                <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                  <Form.Item name="client" label="Client" rules={[{ required: true, message: 'Choose the client' }]}>
                    <Select placeholder="Select Client">
                      {clientData && clientData?.Client?.data.map((client: any, index:number) => (
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
                  <Form.Item name="project" label="Project" rules={[{ required: true, message: 'Choose the project' }]}>
                    <Select placeholder="Select Project">
                      {projectData && projectData?.Project?.data.map((project: any, index: number) => (
                        <Option value={project?.id} key={index}>
                          {project?.name}
                        </Option>)
                      )}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>}
            <Row>
              <Col xs={24} sm={24} md={12} lg={16} xl={18} className={styles.taskCol}>
                <Form.Item name="task" label="Task" rules={[{ required: true, message: 'Choose the task' }]}>
                  <Select placeholder="Select Task">
                    {taskData && taskData?.Task?.data.map((task: any, index: number) => (
                      <Option value={task?.id} key={index}>
                        {task?.name}
                      </Option>)
                    )}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={8} xl={6} className={styles.timeStartCol}>
                <Form.Item>
                  <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div style={{width: '50%'}}>
                      <div style={{textAlign: 'center'}}>
                        <span>
                          {(hours > 9 ? hours : '0' + hours) + ':' +
                            (minutes > 9 ? minutes : '0' + minutes) + ':'
                            + (seconds > 9 ? seconds : '0' + seconds)}
                        </span>
                      </div>
                    </div>&nbsp; &nbsp; &nbsp; &nbsp;
                    <div style={{width: '50%'}}>
                      {isRunning ?
                        <Button type="primary" htmlType="submit" danger>Stop</Button> :
                        <Button type="primary" htmlType="submit">Start</Button>}
                    </div>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
      </Card>
      <br/>
      <Card bordered={false} className={styles['task-card']}>
        <Row>
          <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
            <span className={styles['date-view']}>April 26, 2022</span>
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
        <Form
          onFinish={onFinish}
          validateMessages={validateMessages}
          initialValues={{
            name: "Homepage Design",
            client: "Vellorum: Website Design",
            start: '9:25PM',
            end: '12:20PM',
            total: ''
          }}>
          <Row className={styles['task-row']}>
            <Col span={24} className={styles['task-div-list']}>
              <div className={styles['task-name']}>
                <Form.Item name="name" rules={[{ required: true }]}>
                  <Input type="text" value="Homepage Design"/>
                </Form.Item>
              </div>
              <div className={styles['client-name']}>
                <Form.Item name="client" rules={[{ required: true }]}>
                  <Input type="text" value="Homepage Design"/>
                </Form.Item>
              </div>
              <div className={styles['start-time']}>
                <Form.Item name="start" rules={[{ required: true }]}>
                  <Input type="text" value="Homepage Design"/>
                </Form.Item>
              </div>
              <div className={styles['end-time']}>
                <Form.Item name="end" rules={[{ required: true }]}>
                  <Input type="text" value="Homepage Design"/>
                </Form.Item>
              </div>
              <div className={styles['total-time']}>
                <span>00:05:00</span>
              </div>
            </Col>
          </Row>
        </Form>
      </Card>
      <br/>
      <Card bordered={false} style={{padding: '2rem 1rem 2rem 1rem'}}>
        <Row>
          <Col span={12}>
            <div className={styles['timesheet']}>My Timesheet</div>
          </Col>
          <Col span={12}>
            <div className={styles['add-time-stamp']} onClick={() => setVisible(true)}>
              Add Project
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={16} md={18} lg={20}>
            <div className={styles['data-picker']}><DatePicker.RangePicker style={{ width: '100%' }} /></div>
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
            <Table dataSource={timesheetData?.Timesheet?.data} columns={columns} rowKey={record => record?.id}/>
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
          <Form form={form} layout="vertical">
            <Form.Item name="client" label="Client">
              <Select placeholder="Select Client">
                <Option value="client1">Client 1</Option>
                <Option value="client2">Client 2</Option>
              </Select>
            </Form.Item>
            <Form.Item name="project" label="Project">
              <Select placeholder="Select Project">
                <Option value="project1">Project 1</Option>
                <Option value="project2">Project 2</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default Timesheet;
