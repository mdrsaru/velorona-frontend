import { useEffect, useState } from 'react';
import { Modal, Row, Col, Button, TimePicker } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input } from 'antd';
import moment, { Moment } from 'moment';

import { gql, useMutation } from '@apollo/client';
import { CREATE_TIME_ENTRY, getTimeFormat } from '..';
import { notifyGraphqlError } from '../../../utils/error';
import { authVar } from '../../../App/link';
import { TimeEntry } from '../../../interfaces/generated';
import { getTotalTimeForADay } from '../DetailTimesheet';

import styles from "./style.module.scss";


export const UPDATE_TIME_ENTRY = gql`
    mutation TimeEntryUpdate($input: TimeEntryUpdateInput!) {
      TimeEntryUpdate(input: $input) {
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
    }
`

interface IProps {
  visible: boolean,
  setVisibility: () => void,
  day: string,
  total: number;
  refetch: any;
  timesheetDetail: any
}

const EditTimeSheet = (props: IProps) => {
  const [form] = Form.useForm();
  const authData = authVar();
  const [newEntries, setNewEntries] = useState<any>([]);
  const [updateTimeEntry] = useMutation(UPDATE_TIME_ENTRY, {
    onCompleted: (response) => {
      let total = getTotalTimeForADay(newEntries)
      total = newEntries.length === 1 ? response?.TimeEntryUpdate?.duration : total + response?.TimeEntryUpdate?.duration
      setTotalDuration(total)
      props?.refetch()
    }
  });
  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY, {
    onCompleted: (response) => {
      setTotalDuration(response?.TimeEntryCreate?.duration)
    }
  });
  const [totalDuration, setTotalDuration] = useState<number>(0)

  useEffect(() => {
    setTotalDuration(props?.total)
    setNewEntries(props?.timesheetDetail?.entries[moment(props?.day).format('ddd, MMM D')])
  }, [props?.total, props?.day, props?.timesheetDetail?.entries])

  getTotalTimeForADay(newEntries)

  const onChangeTime = (time: Moment, id: string, type: string) => {
    let formData: {
      id: '' | string,
      company_id: '' | string,
      startTime?: string,
      endTime?: string
    } = {
      id: id ?? '',
      company_id: authData?.company?.id ?? ''
    }
    let newTime = moment(props?.day).format('YYYY-MM-DD') + moment(time).format(' HH:mm:ss')
    type === 'start' ? formData['startTime'] = newTime : formData['endTime'] = newTime
    updateTimeEntry({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      };
      let entries = newEntries.filter((entry: TimeEntry) => entry?.id !== id);
      setNewEntries([...entries, response?.data?.TimeEntryUpdate])
    }).catch(notifyGraphqlError)
  };

  const onCreateTimeEntry = (time: Moment, taskId: string, projectId: string) => {
    const startTime = form.getFieldValue(['start-time']);
    createTimeEntry({
      variables: {
        input: {
          startTime: moment(props?.day).format('YYYY-MM-DD') + moment(startTime).format(' HH:mm:ss'),
          endTime: moment(props?.day).format('YYYY-MM-DD') + moment(time).format(' HH:mm:ss'),
          task_id: taskId,
          project_id: projectId,
          company_id: authData?.company?.id,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      };
    }).catch(notifyGraphqlError)

  }

  const resetForm = () => {
    props?.refetch()
    form.resetFields()
    setTotalDuration(0)
    props?.setVisibility()
  };

  return (
    <Modal
      centered
      visible={props?.visible}
      closeIcon={[
        <div
          onClick={resetForm}
          key={1}>
          <span className={styles['close-icon-div']}>
            <CloseOutlined />
          </span>
        </div>
      ]}
      destroyOnClose
      footer={null}
      width={869}>
      <div className={styles['modal-body']}>
        <div>
          <span className={styles['edit-title']}>
            Edit Time
          </span>
        </div>
        <br /><br />
        <Row className={styles["edit-modal"]}>
          <Col span={18}>
            <div>
              <span>
                {moment(props?.day).format('ddd, MMM D')}, {new Date().getFullYear()}
              </span>
            </div>
            <br />
            <div className={styles['subtitle']}>
              <span className={styles['title']}>
                {props?.timesheetDetail?.project}:
              </span>
              &nbsp;{props?.timesheetDetail?.name}
            </div>
          </Col>

          <Col
            span={6}
            className={styles['subtitle1']}>
            <div>
              {getTimeFormat(totalDuration)}
            </div>
          </Col>
        </Row>

        <Row>
          <Col
            span={24}
            className={styles['dynamic-form']}>
            <Form
              form={form}
              layout="vertical"
              onFinish={resetForm}
              name="timesheet-form">
              {newEntries ?
                newEntries?.map((entry: TimeEntry, index: number) => (
                  <Row
                    key={index}
                    className={styles['form-div']}
                    gutter={[16, 16]}>

                    <Col span={8}>
                      <Form.Item
                        name={`task-${index}`}
                        label={`Task`}>
                        <Input
                          placeholder="task name"
                          defaultValue={entry?.task?.name}
                          disabled />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        name={`start-time-${index}`}
                        label={`Start Time`}
                        rules={[
                          {
                            required: true,
                            message: 'Enter Start Time!',
                          },
                        ]}>
                        <TimePicker
                          use12Hours
                          format="h:mm:ss A"
                          onChange={(event: any) => onChangeTime(event, entry?.id, 'start')}
                          defaultValue={moment.utc(entry?.startTime)} 
                        />
                      </Form.Item>
                    </Col>

                    <Col span={6}>
                      <Form.Item
                        name={`end-time-${index}`}
                        label={`End Time`}
                        rules={[
                          {
                            required: true,
                            message: 'Enter End Time!'
                          }
                        ]}>
                        <TimePicker
                          use12Hours
                          format="h:mm:ss A"
                          onChange={(event: any) => onChangeTime(event, entry?.id, 'end')}
                          defaultValue={moment.utc(entry?.endTime)} />
                      </Form.Item>
                    </Col>

                    <Col
                      span={4}
                      className={styles['total-count']}>
                      <div>
                        {getTimeFormat(entry?.duration)}
                      </div>
                    </Col>
                  </Row>
                )) :
                <Row
                  className={styles['form-div']}
                  gutter={[16, 16]}>

                  <Col span={8}>
                    <Form.Item
                      name={'task'}
                      label={'Task'}>
                      <Input
                        placeholder='task name'
                        defaultValue={props?.timesheetDetail?.name}
                        disabled />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      name={'start-time'}
                      label={'Start Time'}
                      rules={[
                        {
                          required: true,
                          message: 'Enter Start Time!'
                        },
                      ]}>
                      <TimePicker
                        use12Hours
                        format='h:mm:ss A'
                      />
                    </Form.Item>
                  </Col>

                  <Col span={6}>
                    <Form.Item
                      name={'end-time'}
                      label={'End Time'}
                      rules={[
                        {
                          required: true,
                          message: 'Enter End Time!'
                        }
                      ]}>
                      <TimePicker
                        use12Hours
                        onChange={(event: any) =>
                          onCreateTimeEntry(
                            event,
                            props?.timesheetDetail?.id,
                            props?.timesheetDetail?.project_id
                          )
                        }
                        format='h:mm:ss A'
                      />
                    </Form.Item>
                  </Col>
                  <Col
                    span={4}
                    className={styles['total-count']}>
                    <div>
                      {getTimeFormat(totalDuration)}
                    </div>
                  </Col>
                </Row>}
              <br /> <br />
              <Form.Item style={{ float: 'right' }}>
                <Button type="primary" htmlType='submit'>
                  Exit
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </div>
    </Modal>
  )
}

export default EditTimeSheet;
