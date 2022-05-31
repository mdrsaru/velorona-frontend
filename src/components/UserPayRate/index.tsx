import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Select, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import styles from "./styles.module.scss";
import { gql, useMutation, useQuery } from "@apollo/client";
import { PROJECT } from "../../pages/Project";
import { authVar } from "../../App/link";
import { UserPayRate } from "../../interfaces/generated";
import constants from "../../config/constants";
import { notifyGraphqlError } from "../../utils/error";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
}


export const USER_PAYRATE_CREATE = gql`
  mutation UserPayRateCreate($input: UserPayRateCreateInput!) {
    UserPayRateCreate(input: $input) {
      id
    }
  }
`;

interface UserPayRateResponse {
  UserPayRateCreate: UserPayRate
}
const UserPayRateModal = (props: IProps) => {
  const loggedInUser = authVar();
  const [form] = Form.useForm();
  const user = props.data;
  console.log(user);

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

  console.log(projectData);

  const [UserPayRateCreate] = useMutation<UserPayRateResponse>(USER_PAYRATE_CREATE,{
    onCompleted(){
      message.success({
        content: `User pay rate added successfully!`,
        className: "custom-message",
      });
      props.setVisibility(false)
    },
    onError(err){
        return notifyGraphqlError(err);
      
    }
  })

  const onSubmitForm = (values:any) => {
    console.log(values,'values')
    UserPayRateCreate({
      variables: {
        input: {
        user_id:user.id,
        project_id:values.project_id,
        amount:values.payRate,
        company_id:loggedInUser.company?.id
        }
      }
    })
  };

  const onCancel = () => {
  props.setVisibility(!props.visibility)
  }
  return (
    <>
      <Modal
        centered
        visible={props?.visibility}
        closeIcon={[
          <div onClick={() => props?.setVisibility(false)}>
            <span className={styles["close-icon-div"]}>
              <CloseOutlined />
            </span>
          </div>,
        ]}
        width={869}
        okButtonProps={{ style: { display: 'none' } }}
        cancelButtonProps= {{ style: { display: 'none' } }}
      >
        <div className={styles["modal-body"]}>
          <div>
            <span className={styles["title"]}>Add Payrate</span>
          </div>

          <div className={styles.employeeDetailDiv}>
            <p className={styles.employeeName}>{user?.fullName}</p>
          </div>
          <Form form={form} layout="vertical" onFinish={onSubmitForm}>
            <Row>
            <Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>
                <Form.Item label="Project Name" name="project_id">
                  <Select placeholder="Select State">
                    {projectData?.Project?.data?.map((project: any, index: number) => (
                      <Select.Option value={project?.id} key={index}>
                        {project?.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
                </Col>
              <Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>

                <Form.Item label="Payrate" name="payRate">
                <InputNumber addonBefore="$ " addonAfter="Hr" placeholder="Enter payrate" autoComplete="off" style={{ width: '100%' }} />
                </Form.Item>
             </Col>
              
         
          
            </Row>
            <Row justify="end">
            <Col style={{ padding: '0 1rem 1rem 0' }}>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button" onClick={onCancel}>Cancel</Button>
                  <Button type="primary" htmlType="submit">Continue</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
          </Form>
        </div>
      </Modal>
    </>
  );
};

export default UserPayRateModal;
