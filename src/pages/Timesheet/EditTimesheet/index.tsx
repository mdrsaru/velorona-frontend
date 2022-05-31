import { useEffect, useState } from 'react';
import { Modal, Row, Col, Button, TimePicker, message } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input } from 'antd';
import moment, { Moment } from 'moment';

import { gql, useMutation } from '@apollo/client';
import { CREATE_TIME_ENTRY, getTimeFormat } from '..';
import { notifyGraphqlError } from '../../../utils/error';
import { authVar } from '../../../App/link';
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
  timesheetDetail: any
}

const EditTimeSheet = (props: IProps) => {
  const [form] = Form.useForm();
  const authData = authVar();
  const [updateTimeEntry] = useMutation(UPDATE_TIME_ENTRY);
  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY);
  const [totalDuration, setTotalDuration] = useState<number>(0);
  const [timeEntryId, setTimeEntry] = useState('');

  useEffect(() => {
    setTotalDuration(props?.total)
  }, [props?.total])
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
    type === 'start' ? formData['startTime'] = newTime : formData['endTime'] = newTime;

    updateTimeEntry({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
      setTotalDuration(response?.data?.TimeEntryUpdate?.duration)
    }).catch(notifyGraphqlError)
  };

  const onCreateTimeEntry = (time: Moment, taskId: string, projectId: string, type: string) => {
    if (type === 'start') {
      createTimeEntry({
        variables: {
          input: {
            startTime: moment(props?.day).format('YYYY-MM-DD') + moment(time).format(' HH:mm:ss'),
            task_id: taskId,
            project_id: projectId,
            company_id: authData?.company?.id,
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        }
        setTimeEntry(response?.data?.TimeEntryCreate?.id)

      }).catch(notifyGraphqlError)
    } else {
      onChangeTime(time, timeEntryId, type)
    }
  }

  const resetForm = () => {
    let data = form.getFieldsValue(['start-time', 'end-time']);
    if (data['start-time'] && !data['end-time']) {
      message.error('Update the end-time before closing.');
    } else {
      form.resetFields();
      setTotalDuration(0);
      props?.setVisibility()
    }

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
              {props?.timesheetDetail?.entries[moment(props?.day).format('ddd, MMM D')] ?
                props?.timesheetDetail?.entries[moment(props?.day).format('ddd, MMM D')]?.map((entry: any, index: number) => (
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
                          defaultValue={moment(entry?.startTime, 'h:mm:ss A')} />
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
                          defaultValue={moment(entry?.endTime, 'h:mm:ss A')} />
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
                        onChange={(event: any) =>
                          onCreateTimeEntry(
                            event,
                            props?.timesheetDetail?.id,
                            props?.timesheetDetail?.project_id,
                            'start'
                          )
                        }
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
                            props?.timesheetDetail?.project_id,
                            'end'
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
