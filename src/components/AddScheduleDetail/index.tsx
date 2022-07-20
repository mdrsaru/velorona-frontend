import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Button, Col, DatePicker, Form, Input, message, Modal, Row, Select, Space } from "antd"
import { MutationWorkscheduleDetailCreateArgs, WorkscheduleDetail } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { UserData } from "../../pages/Client";
import { USER } from "../../pages/Employee";
import { notifyGraphqlError } from "../../utils/error";
import { useParams } from 'react-router';
import { WORKSCHEDULEDETAIL } from "../../pages/EmployeeSchedule";

interface IProps {
  visibility: boolean;
  setVisibility: any;
}

export const WORKSCHEDULE_DETAIL_CREATE = gql`
mutation WorkscheduleDetailCreate($input:WorkscheduleDetailCreateInput!){
  WorkscheduleDetailCreate(input:$input){
			id
      date
			timeDetail
			total
			workschedule_id
      workschedule{
        payrollAllocatedHours
    		payrollUsageHours
      }
			user_id
			user{
				id
				fullName
			}
		}
} 
`

const AddScheduleDetail = (props: IProps) => {
  const params = useParams();

  const [form] = Form.useForm();

  const [getWorkschedule] = useLazyQuery(
    WORKSCHEDULEDETAIL,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["updatedAt:ASC"],
          },
          query: {
            workschedule_id: params?.sid
          }
        },
      },
    }
  );

  const [createWorkschedule] = useMutation<GraphQLResponse<'WorkscheduleDetailCreate', WorkscheduleDetail>, MutationWorkscheduleDetailCreateArgs>(WORKSCHEDULE_DETAIL_CREATE, {

    onCompleted() {
      message.success({
        content: `New schedule is added successfully!`,
        className: "custom-message",
      });
      getWorkschedule({
        variables:{
          input:{
            paging: {
              order: ["updatedAt:ASC"],
            },
            query: {
              workschedule_id: params?.sid
            }
          }
        }
      })
      props?.setVisibility(false)

    },
    onError(err) {
      notifyGraphqlError(err)
    },
  });
  const onSubmitForm = (values: any) => {

    // createWorkschedule({
    //   variables: {
    //     input: {
    //       date: values?.date,
    //       startTime
    //       user_id: values?.user_id,
    //       workschedule_id: params?.sid,
    //     }
    //   }
    // })
  }

  const onCancel = () => {
    props?.setVisibility(false)
  }

  const { data: userData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {

        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  return (
    <Modal
      centered
      width={1000}
      footer={null}
      visible={props?.visibility}
      onCancel={() => props?.setVisibility(false)}
    >
      <div style={{ marginTop: '3rem' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Select Employee' name='user_id'>
                <Select placeholder='Select Employee'>
                  <Select.Option disabled>Select Employee</Select.Option>
                  {userData?.User?.data?.map((user, index) => {
                    return <Select.Option value={user?.id} key={index}>{user?.fullName}</Select.Option>
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Select date' name='date'>
                <DatePicker />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Select time Detail' name='timeDetail'>
                <Input type='text' placeholder='Enter time detail' />
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
      </div>
    </Modal>
  )
}

export default AddScheduleDetail