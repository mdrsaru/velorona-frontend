import { Button, Card, Col, Input, Form, InputNumber, Row, Select, Space, Upload, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import styles from "../style.module.scss";
import {gql, useMutation} from "@apollo/client";
import {notifyGraphqlError} from "../../../utils/error";
import routes from "../../../config/routes";

interface ItemProps {
  label: string;
  value: string;
}

const options: ItemProps[] = [];

for (let i = 10; i < 36; i++) {
  const value = i.toString(36) + i;
  options.push({
    label: `Long Label: ${value}`,
    value,
  });
}

const TASK_CREATE = gql`
    mutation TaskCreate($input: TaskCreateInput!) {
        TaskCreate(input: $input) {
            id
            name
        }
    }
`


const AddTasks = () => {
  let params = useParams();
  const loggedInUser = authVar();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [TaskCreate] = useMutation(TASK_CREATE);
  const { Option } = Select;

  const selectProps = {
    placeholder:"Select Employees",
    mode: 'multiple' as const,
    style: { width: '100%' },
    options,
    onChange: (newValue: string[]) => {
    },
    maxTagCount: 'responsive' as const
  }

  const onSubmitForm = (values: any) => {
    message.loading({content: "Adding task in progress..", className: 'custom-message'}).then(() =>
      TaskCreate({
        variables: {
          input: {
            name: values?.name,
            company_id: loggedInUser?.company?.id,
            manager_id: values?.taskManager,
            status: values?.status,
            project_id: params?.pid
          }
        }
      }).then((response) => {
        if(response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data?.TaskCreate) {
          navigate(routes.projects.path(loggedInUser?.company?.code ?? ''))
          message.success({content: `New task is added successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError))
  }


  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Tasks</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row className={styles['add-task-row']}>
            <Col span={24} className={styles['form-col-task']}>
              <Form.Item label="Task Name" name='name'>
                <InputNumber placeholder="Enter the Name of the Task" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col span={24} className={styles['form-col-task']}>
              <Form.Item label="Description Name" name='description'>
                <Input.TextArea />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-task']}>
              <Form.Item name="assignmentFile" label="Assignment Files" style={{ position: 'relative' }}>
                <div className={styles['upload-file']}>
                  <div>
                    <span>
                      Attach your files here
                    </span>
                  </div>
                  <div className={styles['browse-file']}>
                    <Upload name="assignmentFile" maxCount={1}>
                      <span>Browse</span>
                    </Upload>
                  </div>
                </div>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-task']}>
              <Form.Item name="assignee" label="Tasks Assigned to"
                         style={{ position: 'relative' }}>
                <Select {...selectProps} dropdownStyle={{ maxHeight: 100, overflowY: 'hidden' }}>
                  <Option value={1}>Employee 1</Option>
                  <Option value={2}>Employee 2</Option>
                  <Option value={3}>Employee 3</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-task']}>
              <Form.Item name="taskManager" label="Task Manager" rules={[{ required: true,
                message: 'Choose the task manager' }]}>
                <Select
                  showArrow
                  mode="multiple"
                  placeholder="Select Task Manager">
                    <Option value={''}>hello</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles['form-col-task']}>
              <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Choose the status' }]}>
                <Select placeholder="Select status">
                  <Option value={'active'}>Active</Option>
                  <Option value={'inactive'}>Inactive</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col className={styles['form-submit']}>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Create Tasks</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}

export default AddTasks;
