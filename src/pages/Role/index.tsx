import { Card, Col, Row, Modal, Form, Input, message } from "antd";
// import { Link } from "react-router-dom";

import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { IRole } from "../../interfaces/IRole";

import { useMediaQuery } from "../../utils/responsive";
// import routes from "../../config/routes";

import { notifyGraphqlError } from "../../utils/error";
import styles from "./style.module.scss";

export const ROLES = gql`
  query Role {
    Role {
      data {
        id
        name
      }
    }
  }
`

const ROLE_CREATE = gql`
  mutation RoleCreate($input: RoleCreateInput!) {
      RoleCreate(input: $input) {
          id
          name
          createdAt 
      }
  }
`

const Role = () => {
  const [form] = Form.useForm();
  const screenWidth: number[] = useMediaQuery();
  const { data: rolesData } = useQuery(ROLES);
  const [createRole] = useMutation(ROLE_CREATE);
  const [visible, setVisible] = useState(false);

  const  handleSubmit = (values: {title: string, description: string}) => {
    createRole({
      variables: {
        input: {
          name: values.title,
          description: values.description
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.RoleCreate) {
        message.success(`New Role is created successfully!`).then(r => {});
        setVisible(false)
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles.mainDiv}>
      <div className={styles['role-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['role-col']}>
              <h1>Roles</h1>
            </Col>
            <Col span={12} className={styles['role-col']}>
              {/*<div className={styles['add-new-role']}>*/}
              {/*  <Link to={routes.role.path} onClick={() => setVisible(true)}>Add New Role</Link>*/}
              {/*</div>*/}
            </Col>
          </Row>
          <Row gutter={16}>
            {rolesData && rolesData.Role.data.map((role: IRole, index:number) => (
              <Col xs={24} sm={12} md={8} lg={screenWidth[0] < 1450 ? 8: 4} key={index}>
                <Card className={styles['role-name-col']}>
                  {role.name}
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </div>
      <Modal
        centered
        visible={visible}
        okText="Create Role"
        onOk={form.submit}
        onCancel={() => setVisible(false)}
        width={1000}>
        <div className={styles['modal-title']}>
          <p>Add New Role</p>
        </div>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Role Title" name="title" rules={[{required: true, message: 'Enter a role name.'}]}>
            <Input placeholder="Enter a role title" autoComplete="off"/>
          </Form.Item>
          <Form.Item label="Description" name="description" rules={[{required: true, message: 'Role description is required.'}]}>
            <Input placeholder="Enter role description" autoComplete="off"/>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Role;
