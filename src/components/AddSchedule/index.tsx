import { gql, useMutation } from "@apollo/client";
import { Button, Col, DatePicker, Form, message, Modal, Row, Select, Space } from "antd"
import { MutationWorkscheduleCreateArgs, Workschedule } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { notifyGraphqlError } from "../../utils/error";
import { authVar } from "../../App/link";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  refetchWorkschedule: any;
}

export const WORKSCHEDULE_DETAIL_CREATE = gql`
mutation WorkscheduleCreate($input:WorkscheduleCreateInput!){
  WorkscheduleCreate(input:$input){
			id
      startDate
      endDate
      payrollAllocatedHours
		  payrollUsageHours
      status
      company{
      id 
      name 
      }
		}
} 
`

const AddSchedule = (props: IProps) => {
  const loggedInUser = authVar()
  const [form] = Form.useForm();

  const [createWorkschedule] = useMutation<GraphQLResponse<'WorkscheduleCreate', Workschedule>, MutationWorkscheduleCreateArgs>(WORKSCHEDULE_DETAIL_CREATE, {

    onCompleted() {
      message.success({
        content: `New schedule is added successfully!`,
        className: "custom-message",
      });
      props?.refetchWorkschedule({
        variables: {
          input: {
            paging: {
              order: ["updatedAt:ASC"],
            },
            query: {
              company_id: loggedInUser?.company?.id as string
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
    createWorkschedule({
      variables: {
        input: {
          startDate: values?.startDate,
          endDate: values?.endDate,
          company_id: loggedInUser?.company?.id as string,
          status: values?.status,
        }
      }
    })
  }

  const onCancel = () => {
    props?.setVisibility(false)
  }

  return (
    <Modal
      centered
      width={1000}
      footer={null}
      visible={props?.visibility}
      onCancel={() => props?.setVisibility(false)}
    >
      <h1>Add scheduling</h1>
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
              <Form.Item label='Select start date' name='startDate'>
                <DatePicker placeholder='Select start date' />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Select end date' name='endDate'>
                <DatePicker placeholder='Select end date' />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Enter status' name='status'>
                <Select placeholder='Select status'>
                  <Select.Option value='Open'>Open</Select.Option>
                  <Select.Option value='Closed'>Closed</Select.Option>
                </Select>
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

export default AddSchedule
