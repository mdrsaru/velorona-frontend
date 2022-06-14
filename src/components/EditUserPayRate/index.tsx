import { Button, Col, Form, InputNumber, message, Modal, Row, Select, Space } from "antd"
import { CloseOutlined } from "@ant-design/icons"

import { gql, useMutation, useQuery } from "@apollo/client"
import { PROJECT } from "../../pages/Project"
import { authVar } from "../../App/link"
import { MutationUserPayRateUpdateArgs, UserPayRate } from "../../interfaces/generated"
import { GraphQLResponse } from "../../interfaces/graphql.interface"
import styles from "../UserPayRate/styles.module.scss"

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  id?: string
  userPayRateData: any;
}


export const USER_PAYRATE_UPDATE = gql`
  mutation UserPayRateUpdate($input: UserPayRateUpdateInput!) {
    UserPayRateUpdate(input: $input) {
      id
      project{
      id
      name
      client{
      id 
      name
      }
      }
      amount
      
    }
  }
`;

const EditUserPayRateModal = (props: IProps) => {
  const loggedInUser = authVar()
  const user = props.data
  const { userPayRateData } = props;

  const { data: projectData } = useQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [form] = Form.useForm();

  const [userPayRateUpdate] = useMutation<
    GraphQLResponse<'UserPayRateUpdate', UserPayRate>, MutationUserPayRateUpdateArgs
  >(USER_PAYRATE_UPDATE, {

    onCompleted() {
      message.success({
        content: `User pay rate updated successfully!`,
        className: "custom-message",
      });
      props.setVisibility(false)
    },
    onError(err) {
      return message.error('You can not add pay rate to already existing project')

    }
  })

  const onSubmitForm = (values: any) => {

    userPayRateUpdate({
      variables: {
        input: {
          id: props?.id as string,
          project_id: values.project_id,
          amount: values.amount,
        }
      }
    })
  };

  const onCancel = () => {
    props.setVisibility(!props.visibility)
  }

  if (!userPayRateData?.UserPayRate?.data) {
    return null
  }

  return (
    <Modal
      centered
      visible={props?.visibility}
      className={styles['user-pay-rate']}
      closeIcon={[
        <div onClick={() => props?.setVisibility(false)} key={2}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      width={869}
      footer={null}>
      <div className={styles["modal-body"]}>
        <div>
          <span className={styles["title"]}>
            Edit PayRate
          </span>
        </div>

        <div className={styles.employeeDetailDiv}>
          <p className={styles.employeeName}>
            {user?.fullName}
          </p>
        </div>
        <Form
          form={form}
          layout="vertical"
          name="user-payrate-form"
          onFinish={onSubmitForm}
          initialValues={{
            project_id: userPayRateData?.UserPayRate?.data?.[0]?.project?.id,
            amount: userPayRateData?.UserPayRate?.data?.[0]?.amount
          }}
        >
          <Row gutter={[24, 0]}>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item
                label="Project Name"
                name="project_id">
                <Select placeholder="Select Project">
                  {projectData?.Project?.data?.map((project: any, index: number) => (
                    <Select.Option value={project?.id} key={index}>
                      {project?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={24}
              lg={24}>
              <Form.Item
                label="Payrate"
                name="amount">
                <InputNumber
                  addonBefore="$ "
                  addonAfter="Hr"
                  placeholder="Enter payrate"
                  autoComplete="off"
                  style={{ width: '100%' }} />
              </Form.Item>
            </Col>



          </Row>
          <Row justify="end">
            <Col style={{ padding: '0 1rem 1rem 0' }}>
              <Form.Item name="action-btn">
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
};

export default EditUserPayRateModal;
