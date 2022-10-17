import { useState } from "react";

import { Button, Card, Checkbox, Col, DatePicker, Form, Input, message, Row, Select, Space, Upload } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import constants, { plans, roles_user, subscriptionStatus } from "../../../config/constants";

import type { UploadProps } from 'antd';
import { useNavigate } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import routes from "../../../config/routes";
import { MutationChangeProfilePictureArgs, MutationUserCreateArgs, User, UserPagingResult, EntryType, RoleName, QueryUserArgs, UserStatus } from "../../../interfaces/generated";
import { USER } from "../index";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { checkSubscriptions } from "../../../utils/common";

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
  const [fileData, setFile] = useState({
    id: '',
    name: ''
  })
  const [skipClient, setSkipClient] = useState(false)

  const _subscriptionStatus = authData?.company?.subscriptionStatus ?? ''
  
  const canAccess = checkSubscriptions({
    userSubscription:_subscriptionStatus,
    expectedSubscription: [subscriptionStatus.active,subscriptionStatus.trialing]
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
      (!skipClient ?
        navigate(routes.attachClient.path(authData?.company?.code ?? "", user ?? ""))
        :
        navigate(routes.user.path(authData?.company?.code ?? '')))
      :
      navigate(routes.user.path(authData?.company?.code ?? ''))
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

  const { data: managerData } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(
    USER,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            role: RoleName.TaskManager,
            company_id: authData?.company?.id
          }
        },
      },
    }
  );

  const [userCreate, { loading: creatingUser }] = useMutation<GraphQLResponse<'UserCreate', User>,
    MutationUserCreateArgs
  >(USER_CREATE, {
    onCompleted: (response) => {
      const user = response?.UserCreate;
      if (fileData?.id) {
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

    userCreate({
      variables: {
        input: {
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          designation: values.designation,
          status: UserStatus.InvitationSent,
          manager_id: values.manager_id,
          company_id: authData?.company?.id as string,
          roles: [values?.roles],
          entryType: values?.entryType,
          startDate: values?.startDate,
          endDate: values?.endDate,
          timesheet_attachment: values?.timesheet_attachment,
          address: {
            country: values.country,
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

  const [role, setRole] = useState('')
  const [manager, setManager] = useState('')
  const handleChange = (value: any) => {
    setRole(value)
  }

  const handleManagerChange = (value: any) => {
    setManager(value)
  }
  const handleSkipClient = (e: any) => {
    setSkipClient(e.target.checked)
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
          scrollToFirstError
          onFinish={onSubmitForm}>
          <Row gutter={[32, 0]}>
            <Col className={styles['form-header']}>
              <p>User Information</p>
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
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className={styles.formCol}>
              <Form.Item
                label="Designation"
                name='designation'
                rules={[{
                  required: true,
                  message: "Please enter the designation"
                }]}
              >
                <Input placeholder="Enter designation" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col className={styles['form-header']}>
              <p>Address</p>
            </Col>
            <Col
              xs={24}
              sm={24}
              md={8}
              lg={8}
              className={styles.formCol}>
              <Form.Item
                name="country"
                label="Country"
                rules={[{
                  required: true,
                  message: 'Please enter country!'
                }]}>
                <Input
                  placeholder="Enter the country"
                  autoComplete="off" />
              </Form.Item>
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
                <Input
                  placeholder="Enter the state"
                  name='state'
                  autoComplete="off" />
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
                <Input
                  placeholder="Enter the city "
                  name='city'
                  autoComplete="off" />
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
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item
                label="Apartment/Suite"
                name='apartment'>
                <Input
                  placeholder="Enter your apartment no"
                  name=''
                  autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
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
              <p>User Roles</p>
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
                <Select placeholder="Select Role" onChange={handleChange}>
                  {roles_user?.map((role: any, index: number) => {
                    if (role?.value === 'TaskManager' && !canAccess) {
                      return 0
                    }
                    else {
                      return (
                        <Option value={role?.value} key={index}>
                          {role?.name}
                        </Option>
                      )
                    }
                  })}
                </Select>
              </Form.Item>
            </Col>

            {/* <Col
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
                  <Option value={UserStatus.InvitationSent}>{UserStatus.InvitationSent}</Option>
                  <Option value={UserStatus.Active}>{UserStatus.Active}</Option>
                  <Option value={UserStatus.Inactive}>{UserStatus.Inactive}</Option>
                </Select>
              </Form.Item>
            </Col> */}
            {role === constants.roles.Employee &&
              <>
                {
                  canAccess &&
                  <>
                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}>
                      <Form.Item
                        name="manager_id"
                        label="Task Manager"
                      >
                        <Select placeholder="Select manager" onChange={handleManagerChange}>
                          {managerData?.User?.data?.map((manager, index) => (
                            <Option key={index} value={manager?.id}> {`${manager?.fullName} / ${manager?.email}`}</Option>
                          ))}
                        </Select>
                        {form.getFieldValue('manager_id')}
                        {!manager &&
                          <p>Please add task manager first to assign manager for this user.</p>
                        }
                      </Form.Item>
                    </Col>

                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}>
                      <Form.Item
                        name="timesheet_attachment"
                        label="Timesheet Attachment type"
                        rules={[{
                          required: true,
                          message: 'Please select timesheet attachment type'
                        }]}>
                        <Select placeholder="Select status">
                          <Option value={true}>Mandatory</Option>
                          <Option value={false}>Optional</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </>
                }
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label="Start Date"
                    name='startDate'
                    rules={[{
                      required: true,
                      message: 'Please select the start date'
                    }]}>
                    <DatePicker placeholder='Select start date' />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label="End Date"
                    name='endDate'
                  >
                    <DatePicker placeholder='Select end date' />
                  </Form.Item>
                </Col>


                <Col
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}>
                  <Form.Item
                    name="entryType"
                    label="Entry Type"
                    rules={[{
                      required: true,
                      message: 'Please select the entry type'
                    }]}>
                    <Select placeholder="Select status">
                      <Option value={EntryType.Timesheet}>{EntryType.Timesheet}</Option>
                      <Option value={EntryType.Cico}>Checkin-Checkout</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </>
            }
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

            <Col xs={24} sm={24} md={24} lg={24}>
              <Checkbox onChange={handleSkipClient}><p className={styles['skip-client']}>Skip Client</p></Checkbox>
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
                    loading={creatingUser}
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
