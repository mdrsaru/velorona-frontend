import React  from "react";

import { Button, Card, Col, Form, Input, message, Row, Select, Space, Upload } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { mediaServices } from '../../../services/MediaService';
import { roles_user } from "../../../config/constants";

import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import styles from "../style.module.scss";
import routes from "../../../config/routes";
import { User } from "../../../interfaces/graphql";

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

export const CHANGE_PROFILE_IMAGE = gql`
  mutation ChangeProfilePicture($input: ChangeProfilePictureInput!) {
    ChangeProfilePicture(input: $input) {
      id
      firstName
      lastName
    }
  }
`

export const USER_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
      UserCreate(input: $input) {
          id
          firstName
      }
  }
`
interface UserResponse {
  UserCreate: User
}

const NewEmployee = () => {
  const navigate = useNavigate();
  const authData = authVar();
  const [UserCreate] = useMutation<UserResponse>(USER_CREATE);
  const [ChangeProfilePictureInput] = useMutation(CHANGE_PROFILE_IMAGE);
  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelAddEmployee = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
    message.loading({content: "New employee adding in progress..", className: 'custom-message'}).then(() =>
    UserCreate({
      variables: {
        input: {
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          status: values.status,
          company_id: authData?.company?.id,
          roles: [values?.roles],
          address: {
            streetAddress: values.streetAddress,
            state: values.state,
            city: values.city,
            zipcode: values.zipcode
          }
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data) {
        if (values?.upload) {
          const formData = new FormData();
          formData.append('file', values?.upload[0]?.originFileObj)
          mediaServices.uploadProfileImage(formData).then((res: any) => {
              const user = response?.data?.UserCreate?.id;
              const avatar = res?.data?.id;
              message.loading({content: "Uploading user's profile image..", className: 'custom-message'}).then(() =>
              ChangeProfilePictureInput({
                variables: {
                  input: {
                    id: user,
                    avatar_id: avatar
                  }
                }}).then((imageRes) => {
                if(imageRes.errors) {
                  return notifyGraphqlError((response.errors))
                } else {
                  navigate(routes.attachClient.path(authData?.company?.code ?? "", user ?? ""));
                }
              }).catch(notifyGraphqlError))
            })
        } else {
          navigate(routes.attachClient.path(authData?.company?.code ?? "", response?.data?.UserCreate?.id) ?? "")
        }
      }
    }).catch(notifyGraphqlError))
  }

  return(
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['employee-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Employee</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Employee Information</p>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="First Name" name='firstName' rules={[{ required: true, message: 'Please enter the firstname' }]}>
                <Input placeholder="Enter firstname" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="Middle Name" name='middleName'>
                <Input placeholder="Enter middle name" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="Last Name" name='lastName' rules={[{ required: true, message: 'Please select the lastname' }]}>
                <Input placeholder="Enter lastname" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Email" name='email'  rules={[{type: 'email', message: 'The input is not valid E-mail!',},
                {required: true, message: 'Please input your E-mail!'},]}>
                <Input placeholder="Enter your email" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Phone Number" name='phone' rules={[{ required: true, message: 'Please input your phone number!' },
                {max: 10, message: "Phone number should be less than 10 digits"}]}>
                <Input placeholder="Enter your phone number" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Address</p>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="State" name='state'>
                <Input placeholder="Enter the state name" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="City" name='city'>
                <Input placeholder="Enter city name" autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="Street Address" name='streetAddress' rules={[{ required: true, message: 'Please enter your street address!' }]}>
                <Input placeholder="Enter street address" name='street' autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Apartment/Suite" name='apartment'>
                <Input placeholder="Enter your apartment no" name='' autoComplete="off"/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Zip Code" name='zipcode'>
                 <Input placeholder="Enter the zipcode" autoComplete="off"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Employee Roles</p>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="roles" label="Role" rules={[{ required: true, message: 'Please enter role!' }]}>
                <Select placeholder="Employee">
                  {roles_user?.map((role: string, index:number) => (
                    <Option value={role} key={index}>{role}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="status" label="Employee Status" rules={[{ required: true, message: 'Please select the status' }]}>
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">In Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="upload" label="Upload Profile Image" valuePropName="fileList" getValueFromEvent={normFile}>
                <Upload name="profileImg" maxCount={1}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col style={{padding: '0 1rem 1rem 0'}}>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button" onClick={cancelAddEmployee}>Cancel</Button>
                  <Button type="primary" htmlType="submit">Continue</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
export default NewEmployee
