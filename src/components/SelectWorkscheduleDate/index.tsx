
import { gql, useMutation } from "@apollo/client";
import { Form, Modal, Row, Col, Button, Space, Select, message } from "antd"
import {  useState } from "react";

import styles from './styles.module.scss'
import { notifyGraphqlError } from "../../utils/error";
import { useParams } from 'react-router-dom';

interface IProps {
  visibility: boolean;
  setVisibility: any;
  workschedule: any;
  employeeId: string;
  startDate: any;
  refetch: any;
  setEmployee:any;
}


export const WORKSCHEDULE_DETAIL_BULK_CREATE = gql`
  mutation WorkscheduleDetailBulkCreate($input: WorkscheduleDetailBulkCreateInput!) {
    WorkscheduleDetailBulkCreate(input: $input) 
  }
`;

const SelectWorkscheduleDate = (props: IProps) => {
  const [form] = Form.useForm();
  const params = useParams()

  const [id, setWorkschedule] = useState('');


  const [workscheduleDetailBulkCreate] = useMutation(WORKSCHEDULE_DETAIL_BULK_CREATE, {
    onCompleted() {
      message.success({
        content: `Workschedule Detail is deleted successfully!`,
        className: "custom-message",
      });
      props?.refetch({
        input: {
          paging: {
            order: ["updatedAt:ASC"],
          },
          query: {
            workschedule_id: params?.sid
          }
        },

      })
      props.setEmployee('')

    },
    onError(err) {
      notifyGraphqlError(err);
    }
  })

  const handleSelectChange = (value: any) => {
    setWorkschedule(value)
  }
  const onSubmitForm = () => {

    workscheduleDetailBulkCreate({
      variables: {
        input: {
          user_id: props.employeeId,
          workschedule_id: params.sid,
          copy_workschedule_id: id,
          schedule_date: props?.startDate
        }
      }
    })

    props?.setVisibility(false)

  }

  const onCancel = () => {
    props?.setVisibility(false)
  }
  return (
    <>
      <Modal
        centered
        width={1000}
        footer={null}
        visible={props?.visibility}
        onCancel={() => props?.setVisibility(false)}
        okText='Add Employee'
        cancelText='Add '
      >
        <div style={{ marginTop: '10px' }}>
          <div className={styles['title-div']}>
            <span className={styles["title"]}>
              Select Schedule Date
            </span>
          </div>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}>

            <Form.Item
              label="Choose Project"
              name="project"
              rules={[{
                required: true,
                message: 'Choose the project'
              }]}
            >
              <Select onChange={handleSelectChange}>
                {props?.workschedule?.map((schedule: any, index: number) => {
                  return (
                    <Select.Option value={schedule?.id} key={index}>{schedule.startDate} - {schedule.endDate}</Select.Option>
                  )
                })}
              </Select>
            </Form.Item>
            <Row justify="end">
              <Col style={{ padding: '0 1rem 1rem 0' }}>
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit">
                      Continue
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </>
  )
}

export default SelectWorkscheduleDate
