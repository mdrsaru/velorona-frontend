import { gql, useMutation } from "@apollo/client";
import { Button, Col, Form, message, Modal, Row, Space, Table, TimePicker } from "antd"
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { useState } from "react";
import moment from "moment";

import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { MutationWorkscheduleTimeDetailCreateArgs, MutationWorkscheduleTimeDetailDeleteArgs, WorkscheduleTimeDetail } from "../../../../interfaces/generated";
import { notifyGraphqlError } from "../../../../utils/error";


import deleteImg from '../../../../assets/images/delete_btn.svg';
import Label from "../../../../components/Label";

import ModalConfirm from "../../../../components/Modal";
import DeleteBody from "../../../../components/Delete";

import styles from './styles.module.scss'

interface IProps {
  visibility: boolean;
  setVisibility: any;
  workschedule: any;
  getWorkschedule:any;
}

export const WORKSCHEDULE_TIME_DETAIL_CREATE = gql`
mutation WorkscheduleTimeDetailCreate($input:WorkscheduleTimeDetailCreateInput!){
  WorkscheduleTimeDetailCreate(input:$input){
		id
		startTime
		endTime
		duration
		}
} 
`

export const WORKSCHEDULE_TIME_DETAIL_DELETE = gql`
  mutation WorkscheduleTimeDetailDelete($input: DeleteInput!) {
    WorkscheduleTimeDetailDelete(input: $input) {
      id
      startTime
      endTime
    }
  }
`;
const AddTimeInterval = (props: IProps) => {

  const [deleteVisibility, setDeleteVisibility] = useState<boolean>(false);

  const [timeIntervalId, setTimeIntervalId] = useState<any>()

  const workschedule = props?.workschedule?.WorkscheduleDetail?.data?.[0];
  const [createWorkscheduleTimeEntry] = useMutation<GraphQLResponse<'WorkscheduleTimeDetailCreate', WorkscheduleTimeDetail>, MutationWorkscheduleTimeDetailCreateArgs>(WORKSCHEDULE_TIME_DETAIL_CREATE, {

    onCompleted() {
      message.success({
        content: `New schedule is added successfully!`,
        className: "custom-message",
      });
      props?.getWorkschedule({
        variables: {
            input: {
                paging: {
                    order: ["updatedAt:ASC"],
                },
                query: {
                    id: workschedule?.id
                }
            },
        },
    })

      props?.setVisibility(false)

    },
    onError(err) {
      notifyGraphqlError(err)
    },
  });

  const [timeIntervalDelete, { loading }] = useMutation<GraphQLResponse<'WorkscheduleTimeDetailDelete',
    WorkscheduleTimeDetail>,
    MutationWorkscheduleTimeDetailDeleteArgs>(WORKSCHEDULE_TIME_DETAIL_DELETE, {
      onCompleted() {
        message.success({
          content: `Attached Timesheet is deleted successfully!`,
          className: "custom-message",
        });
        setDeleteVisibility(false);
      },
      onError(err) {
        setDeleteVisibility(false);
        notifyGraphqlError(err);
      }
    })


  const deleteTimeInterval = () => {
    timeIntervalDelete({
      variables: {
        input: {
          id: timeIntervalId
        }
      }
    })
  }

  const columns = [

    {
      title: "Start Time",
      dataIndex: "startTime",
      render: (startTime: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {moment(startTime).format('HH:SS')}
        </span>
      },
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      render: (endTime: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {moment(endTime).format('HH:SS')}
        </span>
      },
    },
    {
      title: "",
      render: (timeInterval: any) => {
        return <span style={{ cursor: 'pointer' }} >
          <DeleteOutlined onClick={() => {
            setDeleteVisibility(true);
            setTimeIntervalId(timeInterval?.id);
          }} />
        </span>
      },
    },
  ];
  const format = 'HH:mm';
  const handleSubmit = (values: any) => {
    createWorkscheduleTimeEntry({
      variables: {
        input: {
          startTime: values?.startTime,
          endTime: values?.endTime,
          workschedule_detail_id: workschedule?.id
        }
      }
    })
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
      >

        <p className={styles.fullName}>{workschedule?.user?.fullName}</p>
        <p>{moment(workschedule?.date).format('MMM DD,YYYY')}</p>

        <p className={styles.title}>Work schedule</p>
        <Table
          dataSource={workschedule?.workscheduleTimeDetail}
          columns={columns}
          pagination={false}
        />
        <br />
        <Form onFinish={handleSubmit}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={11}
              style={{ marginRight: '2.2rem' }}>
              <Label label={'Select start time'} />
              <Form.Item name='startTime'
                rules={[{
                  required: true,
                  message: 'Start Time required'
                }]}
              >

                <TimePicker placeholder={'Enter time'} format={format} />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={12}>
              <Label label={'Select end time'} />
              <Form.Item name='endTime'
                rules={[{
                  required: true,
                  message: 'End Time required'
                }]}
              >
                <TimePicker placeholder={'Enter time'} format={format} />
              </Form.Item>
            </Col>
          </Row>
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
      </Modal>

      <ModalConfirm
        visibility={deleteVisibility}
        setModalVisibility={setDeleteVisibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        closable
        modalBody={
          <DeleteBody
            title={
              <>
                Are you sure you want to delete it?{" "}
                {/* <strong> {project?.name}</strong> */}
              </>
            }
            subText={`All the data associated with this will be deleted permanently.`}
          />
        }
        onOkClick={deleteTimeInterval}
      />
    </>
  )
}

export default AddTimeInterval