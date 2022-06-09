import { useState } from "react";

import { Button, Card, Col, Form, Input, message, Row, Select, Space, Upload } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import constants, { roles_user } from "../../../config/constants";

import type { UploadProps } from 'antd';
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import routes from "../../../config/routes";
import { MutationChangeProfilePictureArgs, MutationUserCreateArgs, User, UserPagingResult } from "../../../interfaces/generated";
import { USER } from "../index";
import { STATE_CITIES, USA_STATES } from "../../../utils/cities";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";

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
      avatar{
        id
        url
        name
      }
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
        archived
        avatar_id
        avatar {
          id
          url
          name
        }
        activeClient {
          id
          name
        }
        address {
          city
          streetAddress
          zipcode
          state
          aptOrSuite
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
interface UserResponseArray {
  User: UserPagingResult
}

const NewEmployee = () => {
  let key = 'employee'
  const navigate = useNavigate();
  const authData = authVar();
  const [cities, setCountryCities] = useState<string[]>([]);
  const [fileData, setFile] = useState({
    id: '',
    name: ''
  })
  const [changeProfilePictureInput] = useMutation<
    GraphQLResponse<'ChangeProfilePicture', User>,
    MutationChangeProfilePictureArgs
  >(CHANGE_PROFILE_IMAGE);
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
      content: `New User is created successfully!`,
      className: 'custom-message'
    });
  }

  const props: UploadProps = {
    name: 'file',
    action: `${constants.apiUrl}/v1/media/upload`,
    maxCount: 1,
    headers: {
      'authorization': authData?.token ? `Bearer ${authData?.token}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        setFile({
          name: info?.file?.name,
          id: info?.file?.response?.data?.id
        })
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
  };

  const setState = (data: string) => {
    setCountryCities(STATE_CITIES[data]);
  }

  const [userCreate] = useMutation<GraphQLResponse<'UserCreate', User>,
    MutationUserCreateArgs
  >(USER_CREATE, {
    onCompleted: (response) => {
      const user = response?.UserCreate;
      if (fileData?.id) {
        message.loading({
          content: "Uploading user's profile image..",
          key,
          className: 'custom-message'
        })
        changeProfilePictureInput({
          variables: {
            input: {
              id: user?.id,
              avatar_id: fileData?.id
            }
          }
        }).catch(notifyGraphqlError)
        navigate(-1);
      } else {
        redirectTo(user?.roles[0]?.name, user?.id);
      }
    },
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
  const onSubmitForm = (values: any) => {
    message.loading({
      content: "New employee adding in progress..",
      key,
      className: 'custom-message'
    })
    userCreate({
      variables: {
        input: {
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          status: values.status,
          company_id: authData?.company?.id as string,
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
      };
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col
            span={12}
            className={styles['employee-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New User
            </h1>
          </Col>
        </Row>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmitForm}>
          <Row gutter={[32, 0]}>
            <Col className={styles['form-header']}>
              <p>Employee Information</p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}>
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
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}>
              <Form.Item
                label="Middle Name"
                name='middleName'>
                <Input placeholder="Enter middle name" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className={styles.formCol}>
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
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
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
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                label="Phone Number"
                name='phone'
                rules={[{
                  required: true,
                  message: 'Please input your phone number!'
                }, {
                  max: 11,
                  message: "Phone number should be less than 11 digits"
                }]}>
                <Input placeholder="Enter your phone number" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col className={styles['form-header']}>
              <p>Address</p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}>
              <Form.Item
                label="State"
                name='state'
                rules={[{
                  required: true,
                  message: 'Please enter your state!'
                }]}>
                <Select
                  showSearch
                  placeholder={'Select the state'} onChange={setState}>
                  {USA_STATES?.map((state: any, index: number) =>
                    <Select.Option value={state?.name} key={index}>
                      {state?.name}
                    </Select.Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}>
              <Form.Item
                label="City"
                name='city'
                rules={[{
                  required: true,
                  message: 'Please enter your city!'
                }]}>
                <Select
                  showSearch
                  placeholder={'Select the city'}>
                  {cities?.map((city: string, index: number) =>
                    <Select.Option value={city} key={index}>
                      {city}
                    </Select.Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}>
              <Form.Item
                label="Street Address"
                name='streetAddress'
                rules={[{
                  required: true,
                  message: 'Please enter your street address!'
                }]}>
                <Input
                  placeholder="Enter street address"
                  name='street'
                  autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Apartment/Suite"
                name='apartment'>
                <Input
                  placeholder="Enter your apartment no"
                  name=''
                  autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                label="Zip Code"
                name='zipcode'
                rules={[{
                  required: true,
                  message: 'Please select the zipcode'
                }]}>
                <Input placeholder="Enter the zipcode" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col className={styles['form-header']}>
              <p>Employee Roles</p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                name="roles"
                label="Role"
                rules={[{
                  required: true,
                  message: 'Please enter role!'
                }]}>
                <Select placeholder="Employee">
                  {roles_user?.map((role: string, index: number) => (
                    <Option value={role} key={index}>
                      {role}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                name="status"
                label="User Status"
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
            <Col
              xs={24}
              sm={24}
              md={12}
              lg={12}>
              <Form.Item
                name="upload"
                label="Upload Profile Image"
                valuePropName="filelist"
                getValueFromEvent={normFile}
                style={{ position: "relative" }}>
                <div className={styles["upload-file"]}>
                  <div>
                    <span>
                      {fileData?.name ? fileData?.name : " Attach your files here"}
                    </span>
                  </div>
                  <div className={styles["browse-file"]}>
                    <Upload {...props}>
                      Click to Upload
                    </Upload>
                  </div>
                </div>
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
                    onClick={cancelAddEmployee}>
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
      </Card>
    </div >
  )
}
export default NewEmployee
