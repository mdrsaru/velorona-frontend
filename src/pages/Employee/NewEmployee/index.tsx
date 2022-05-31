import React from "react";

import { Button, Card, Col, Form, Input, message, Row, Select, Space, Upload } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { mediaServices } from '../../../services/MediaService';
import constants, { roles_user } from "../../../config/constants";

import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import routes from "../../../config/routes";
import { User, UserPagingResult } from "../../../interfaces/generated";
import { USER } from "../index";

import styles from "../style.module.scss";

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
          email
          phone
          firstName
          middleName
          lastName
          fullName
          status
          activeClient {
              id
              name
          }
          address {
              city
              streetAddress
              zipcode
              state
          }
          company {
              id
              name
          }
          roles {
              id
              name
          }
      }
  }
`
interface UserResponse {
  UserCreate: User
}

interface UserResponseArray {
  User: UserPagingResult
}

const NewEmployee = () => {
  const navigate = useNavigate();
  const authData = authVar();

  const [userCreate] = useMutation<UserResponse>(USER_CREATE, {
    update(cache, { data }) {
      const userResponse = data?.UserCreate;
      const existingUser = cache.readQuery<UserResponseArray>({
        query: USER,
        variables: {
          input: {
            query: {
              role: constants.roles.Employee
            },
            paging: {
              order: ['updatedAt:DESC']
            }
          }
        }
      });
      if (existingUser && userResponse) {
        cache.writeQuery({
          query: USER,
          data: {
            User: {
              data: [...existingUser?.User?.data, userResponse]
            }
          }
        })
      }
    }
  })
  const [changeProfilePictureInput] = useMutation(CHANGE_PROFILE_IMAGE);
  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelAddEmployee = () => {
    navigate(-1);
  }

  const redirectTo = (role: string, user: string) => {
    role === constants?.roles?.Employee ?
      navigate(routes.attachClient.path(authData?.company?.code ?? "", user ?? "")) :
      navigate(routes.employee.path(authData?.company?.code ?? ''));
    message.success({
      content: `New Employee is created successfully!`,
      className: 'custom-message'
    });
  }

  const onSubmitForm = (values: any) => {
    let key = 'employee'
    message.loading({ content: "New employee adding in progress..", key, className: 'custom-message' })
    userCreate({
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
      if (response.errors) {
        return notifyGraphqlError((response.errors), key)
      } else if (response?.data) {
        const user = response?.data?.UserCreate?.id;
        if (values?.upload) {
          const formData = new FormData();
          formData.append('file', values?.upload[0]?.originFileObj)
          mediaServices.uploadProfileImage(formData).then((res: any) => {
            const avatar = res?.data?.id;
            message.loading({ content: "Uploading user's profile image..", key, className: 'custom-message' })
            changeProfilePictureInput({
              variables: {
                input: {
                  id: user,
                  avatar_id: avatar
                }
              }
            }).then((imageRes) => {
              if (imageRes.errors) {
                return notifyGraphqlError((response.errors), key)
              } else {
                redirectTo(values?.roles, user);
              }
            }).catch(notifyGraphqlError)
          })
        } else {
          redirectTo(values?.roles, user);
        }
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['employee-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New Employee
            </h1>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Employee Information</p>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item
                label="First Name"
                name='firstName'
                rules={[{
                  required: true,
                  message: 'Please enter the firstname'
                }]}>
                <Input placeholder="Enter firstname" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item
                label="Middle Name"
                name='middleName'>
                <Input placeholder="Enter middle name" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item
                label="Last Name"
                name='lastName'
                rules={[{
                  required: true,
                  message: 'Please select the lastname'
                }]}>
                <Input placeholder="Enter lastname" autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                label="Email"
                name='email'
                rules={[{
                  type: 'email',
                  message: 'The input is not valid E-mail!'
                }, {
                  required: true,
                  message: 'Please input your E-mail!'
                }]}>
                <Input placeholder="Enter your email" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                label="Phone Number"
                name='phone'
                rules={[{
                  required: true,
                  message: 'Please input your phone number!'
                }, {
                  max: 10,
                  message: "Phone number should be less than 10 digits"
                }]}>
                <Input placeholder="Enter your phone number" autoComplete="off" />
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
              <Form.Item
                label="State"
                name='state'
                rules={[{
                  required: true,
                  message: 'Please enter your state!'
                }]}>
                <Input placeholder="Enter the state name" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item
                label="City"
                name='city'
                rules={[{
                  required: true,
                  message: 'Please enter your city!'
                }]}>
                <Input placeholder="Enter city name" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item
                label="Street Address"
                name='streetAddress'
                rules={[{
                  required: true,
                  message: 'Please enter your street address!'
                }]}>
                <Input placeholder="Enter street address" name='street' autoComplete="off" />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                label="Apartment/Suite"
                name='apartment'>
                <Input
                  placeholder="Enter your apartment no"
                  name=''
                  autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                label="Zip Code"
                name='zipcode'>
                <Input placeholder="Enter the zipcode" autoComplete="off" />
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
              <Form.Item
                name="roles"
                label="Role"
                rules={[{
                  required: true,
                  message: 'Please enter role!'
                }]}>
                <Select placeholder="Employee">
                  {roles_user?.map((role: string, index: number) => (
                    <Option value={role} key={index}>{role}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                name="status"
                label="Employee Status"
                rules={[{
                  required: true,
                  message: 'Please select the status'
                }]}>
                <Select placeholder="Select status">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">In Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item
                name="upload"
                label="Upload Profile Image"
                valuePropName="fileList"
                getValueFromEvent={normFile}>
                <Upload
                  name="profileImg"
                  maxCount={1}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Col style={{ padding: '0 1rem 1rem 0' }}>
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
