import { useState } from 'react';
import { Modal, Row, Col, Button, TimePicker } from 'antd';
import { CloseOutlined } from "@ant-design/icons";
import { Form, Input } from 'antd';
import moment, { Moment } from 'moment';

import { gql, useMutation } from '@apollo/client';
import { CREATE_TIME_ENTRY, getTimeFormat } from '..';
import { getTotalTimeForADay } from '../DetailTimesheet';
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
  timesheetDetail: any
}

const EditTimeSheet = (props: IProps) => {
  const [form] = Form.useForm();
  const authData = authVar();
  const [updateTimeEntry] = useMutation(UPDATE_TIME_ENTRY);
  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY);
  const [totalDuration, setTotalDuration] = useState(0);
  function disabledDate(current: Moment) {
    return current && current.isSame("2022-05-24");
  }

  const onChangeTime = (time: Moment, id: string, type: string) => {
    let formData: {
      id: '' | string,
      company_id: '' | string,
      startTime?: Moment,
      endTime?: Moment
    } = {
      id: id ?? '',
      company_id: authData?.company?.id ?? ''
    }
    type === 'start' ? formData['startTime'] = time : formData['endTime'] = time;

    updateTimeEntry({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  };

  const onCreateTimeEntry = (time: Moment, taskId: string, projectId: string) => {
    const startTime = form.getFieldValue('start-time');
    createTimeEntry({
      variables: {
        input: {
          startTime: moment(startTime, "YYYY-MM-DD HH:mm:ss"),
          endTime: moment(time, "YYYY-MM-DD HH:mm:ss"),
          task_id: taskId,
          project_id: projectId,
          company_id: authData?.company?.id,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
      setTotalDuration(response?.data?.TimeEntryCreate?.duration)
    }).catch(notifyGraphqlError)
  }


  return (
    <Modal
      centered
      visible={props?.visible}
      closeIcon={[
        <div
          onClick={props?.setVisibility}
          key={1}>
          <span className={styles['close-icon-div']}>
            <CloseOutlined />
          </span>
        </div>
      ]}
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
                {props?.day}, {new Date().getFullYear()}
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
              {getTotalTimeForADay(props?.timesheetDetail?.entries[props?.day])}
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
              name="timesheet-form">
              {props?.timesheetDetail?.entries[props?.day] ?
                props?.timesheetDetail?.entries[props?.day]?.map((entry: any, index: number) => (
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
                          disabledDate={disabledDate}
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
                          disabledDate={disabledDate}
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
                <Button type="primary" onClick={props?.setVisibility}>
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
