import { gql, useMutation, useQuery } from "@apollo/client";
import { Button, Col, Form, message, Modal, Row, Space, Table, TimePicker } from "antd"
import DeleteOutlined from "@ant-design/icons/lib/icons/DeleteOutlined";
import { useState } from "react";
import moment from "moment";

import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { MutationWorkscheduleTimeDetailCreateArgs, MutationWorkscheduleTimeDetailDeleteArgs, QueryWorkscheduleTimeDetailArgs, WorkscheduleTimeDetail, WorkscheduleTimeDetailPagingResult } from "../../../../interfaces/generated";
import { notifyGraphqlError } from "../../../../utils/error";


import deleteImg from '../../../../assets/images/delete_btn.svg';
import Label from "../../../../components/Label";

import ModalConfirm from "../../../../components/Modal";
import DeleteBody from "../../../../components/Delete";

import styles from './styles.module.scss'
import { useForm } from 'antd/lib/form/Form';

interface IProps {
  visibility: boolean;
  setVisibility: any;
  workschedule: any;
  getWorkschedule: any;
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
export const WORKSCHEDULE_TIME_DETAIL = gql`
  query WorkscheduleTimeDetail($input: WorkscheduleTimeDetailQueryInput!) {
    WorkscheduleTimeDetail(input: $input) {
      paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
    data {
			id
			duration
			startTime
      endTime
    workschedule_detail_id
  }
    }
  }
`;

export const WORKSCHEDULE_DETAIL_DELETE = gql`
  mutation WorkscheduleDetailDelete($input: DeleteInput!) {
    WorkscheduleDetailDelete(input: $input) {
      id
     workschedule_id
    }
  }
`;

const AddTimeInterval = (props: IProps) => {
  const [form] = useForm()
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

  const { data: workscheduleTimeDetail, refetch: refetchWorkscheduleTimeDetail } = useQuery<
    GraphQLResponse<'WorkscheduleTimeDetail', WorkscheduleTimeDetailPagingResult>,
    QueryWorkscheduleTimeDetailArgs
  >(WORKSCHEDULE_TIME_DETAIL, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          workschedule_detail_id: workschedule?.id
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const [workscheduleDetailDelete] = useMutation(WORKSCHEDULE_DETAIL_DELETE, {
    onCompleted() {
      setDeleteVisibility(false);

    },
    onError(err) {
      setDeleteVisibility(false);
      notifyGraphqlError(err);
    }
  })

  const [timeIntervalDelete] = useMutation<GraphQLResponse<'WorkscheduleTimeDetailDelete',
    WorkscheduleTimeDetail>,
    MutationWorkscheduleTimeDetailDeleteArgs>(WORKSCHEDULE_TIME_DETAIL_DELETE, {
      onCompleted() {
        message.success({
          content: `Attached Timesheet is deleted successfully!`,
          className: "custom-message",
        });
        refetchWorkscheduleTimeDetail({
          input: {
            query: {
              workschedule_detail_id: workschedule?.id
            },
          }
        }).then((timeInterval) => {
          if (!timeInterval?.data?.WorkscheduleTimeDetail?.data?.length) {
            workscheduleDetailDelete({
              variables: {
                input: {
                  id: workschedule?.id
                }
              }
            })
          }
        })
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
          {moment(startTime).format('HH:mm')}
        </span>
      },
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      render: (endTime: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {moment(endTime).format('HH:mm')}
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
    form.resetFields()
    if (Date.parse(values?.endTime) < Date.parse(values?.startTime)) {
      return message.error('End time cannot be less than start time')
    }
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
          dataSource={workscheduleTimeDetail?.WorkscheduleTimeDetail?.data}
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