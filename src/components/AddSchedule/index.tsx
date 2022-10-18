import { gql, useMutation } from "@apollo/client";
import { Button, Col, DatePicker, Form, message, Modal, Row, Select, Space } from "antd"
import { MutationWorkscheduleCreateArgs, Workschedule } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { notifyGraphqlError } from "../../utils/error";
import { authVar } from "../../App/link";
import moment from "moment";

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
      form.resetFields();
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

    const diff = values?.endDate.diff(values?.startDate);
    const diffDuration = moment.duration(diff);

    if (diffDuration.asDays() > 7 || diffDuration.asDays() < 6) {
      form.setFields([
        {
          name: 'endDate',
          errors: ["Week days should be of 7 days"],
        },
      ]);
      return
    }
    createWorkschedule({
      variables: {
        input: {
          startDate: values?.startDate,
          endDate: values?.endDate,
          company_id: loggedInUser?.company?.id as string,
          status: 'Open',
        }
      }
    })
  }

  const onCancel = () => {
    props?.setVisibility(false)
  }

  function disabledStartDate(value: any) {
    return (
      value.isBefore(moment().subtract(1, "day")) ||
      value.format("YYYY-MM-DD") !==
      moment(value).startOf("isoWeek").format("YYYY-MM-DD")
    );
  }
  function disabledEndDate(value: any) {
    const enabledDays = value?.isBefore(moment().subtract(1, "day")) ||
      value.format("YYYY-MM-DD") !==
      moment(value).endOf("isoWeek").format("YYYY-MM-DD")

    return (enabledDays);
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
                <DatePicker placeholder='Select start date' disabledDate={disabledStartDate} />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item label='Select end date' name='endDate'>
                <DatePicker placeholder='Select end date' disabledDate={disabledEndDate} />
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
