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
  Button, message
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

import styles from "./style.module.scss";


export const CREATE_TIMESHEET = gql`
    mutation TimesheetCreate($input: TimesheetCreateInput!) {
        TimesheetCreate(input: $input) {
            id
            project {
                id
                name
            }
            approver {
                id
                fullName
            }
            company{
                id
                name
            }
            created_by
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
            paging {
                total
                startIndex
                endIndex
                hasNextPage
            }
            data {
                id
                clientLocation
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


const Timesheet = () => {
  let navigate = useNavigate();
  const authData = authVar();
  const { Option } = Select;
  const [form] = Form.useForm();
  const { data: timesheetData } = useQuery(TIMESHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
        }
      }
    }
  });
  const [CreateTimesheet] = useMutation(CREATE_TIMESHEET);
  const [UpdateTimesheet] = useMutation(UPDATE_TIMESHEET);
  const [visible, setVisible] = useState(false);
  const [showDetailTimeSheet, setDetailVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    reset
  } = useStopwatch({ autoStart: false });
  const columns = [
    {
      title: 'Project Name',
      key: 'project',
    },
    {
      title: 'Company',
      key: 'company',
    },
    {
      title: 'Location',
      dataIndex: 'clientLocation',
      key: 'clientLocation',
    },
    {
      title: 'Approved by',
      dataIndex: 'time_period',
      key: 'time_period',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']} onClick={(e) => {
          navigate(routes.detailTimesheet.path(authData?.company?.code ?? '', record?.key))
        }}>
          <PlusCircleOutlined /> &nbsp; &nbsp; <span>Add</span>
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
            created_by: ''
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          console.log(response);
           start();
          setDetailVisible(true);
        }
      }).catch(notifyGraphqlError)
    } else {
      UpdateTimesheet({
        variables: {
          input: {
            id: '',
            end: moment(currentDate, "YYYY-MM-DD HH:mm:ss"),
            company_id: authData?.company?.id
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          reset(undefined, false)
          message.success({content: `Timesheet is updated successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError)
    }
  }

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false} className={styles.formRow}>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row>
            {showDetailTimeSheet ?
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <b>Vellorum: Website Design</b>
              </Col>:
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
              </Col>}
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
          </Row>
          <Row justify="center">
            <Col xs={24} sm={24} md={12} lg={16} xl={18} className={styles.taskCol}>
              <Form.Item name="task" label="Task" rules={[{ required: false, message: 'Choose the task' }]}>
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
            <Table dataSource={timesheetData?.Timesheet?.data} columns={columns}/>
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
