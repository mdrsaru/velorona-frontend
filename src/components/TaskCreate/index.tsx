import { useMutation } from "@apollo/client";
import { Button, Col, Form, Input, message, Modal, Row, Space } from "antd"
import { authVar } from "../../App/link";
import { MutationTaskCreateArgs, Task, TaskStatus } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { notifyGraphqlError } from "../../utils/error";
import {TASK_CREATE} from '../../pages/Project/AddTasks'

interface IProps{
visibility:boolean;
setVisibility:any;
projectId:string;
getTask:any
}
const TaskCreateModal = (props:IProps) =>{
    const [form] = Form.useForm();
    const loggedInUser = authVar()
    const {getTask} = props;
    const [createTask] = useMutation<GraphQLResponse<'TaskCreate',Task>,MutationTaskCreateArgs>(TASK_CREATE, {
     
        onCompleted() {
          message.success({
            content: `New task is added successfully!`,
            className: "custom-message",
          });
          getTask({
            variables: {
              input: {
                query: {
                  company_id: loggedInUser?.company?.id as string,
                  project_id: props?.projectId,
                  created_by:loggedInUser?.user?.id,
                },
                paging: {
                  order: ['updatedAt:DESC']
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
        createTask({
          variables: {
            input: {
              name: values?.name,
              status: TaskStatus.UnScheduled,
              company_id: loggedInUser?.company?.id as string,
              project_id: props?.projectId,
            },
          },
        });
      };
      const onCancel = () => {
        props.setVisibility(!props.visibility)
      }
return(
    <>
     <Modal
        centered
        width={1000}
        footer={null}
        visible={props?.visibility}
        onCancel={()=>props?.setVisibility(false)}
      >
         <div style={{marginTop:'3rem'}}>
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
              <Form.Item
                label="Task Name"
                name="name">
                <Input
                  placeholder="Enter the Name of the Task"
                  autoComplete="off"
                />
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
    </>
)
}

export default TaskCreateModal

