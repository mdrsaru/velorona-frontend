import React from "react";
import {Button, Card, Col, Form, Input, message, Row, Select, Space, DatePicker, InputNumber, Upload} from "antd";
import {ArrowLeftOutlined, UploadOutlined} from "@ant-design/icons";
import moment from 'moment';

import {useNavigate, useParams} from "react-router-dom";

import styles from "../style.module.scss";
import {gql, useMutation, useQuery} from "@apollo/client";
import {notifyGraphqlError} from "../../../utils/error";
import {mediaServices} from "../../../services/MediaService";
import {IRole} from "../../../interfaces/IRole";

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const profileFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const CHANGE_PROFILE_IMAGE = gql`
  mutation ChangeProfilePicture($input: ChangeProfilePictureInput!) {
    ChangeProfilePicture(input: $input) {
      id
      firstName
      lastName
    }
  }
`

const EMPLOYEE_UPDATE = gql`
  mutation UserUpdate($input: UserUpdateInput!) {
      UserUpdate(input: $input) {
          id
          firstName
          lastName
          email
      }
  }
`

const USER = gql`
  query User($input: UserQueryInput!) {
      User(input: $input) {
      data {
        id
        email
        phone
        firstName
        middleName
        lastName
        status
        address {
          city
          streetAddress
          zipcode
          state
        }
        record {
          startDate
          endDate
          payRate
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
  }
`
const ROLES = gql`
  query Role {
    Role {
      data {
        id
        name
      }
    }
  }
`

const EditEmployee = () => {
  let params = useParams();
  const navigate = useNavigate();
  const [UserUpdate] = useMutation(EMPLOYEE_UPDATE);
  const [ChangeProfilePictureInput] = useMutation(CHANGE_PROFILE_IMAGE);
  const {data: roles} = useQuery(ROLES, {
    fetchPolicy: "cache-first"
  });
  const {data: userData} = useQuery(USER, {
    variables: {
      input: {
        query: {
          id: params?.eid
        }
      }
    }
  })

  const [form] = Form.useForm();
  const {Option} = Select;

  const cancelEditEmployee = () => {
    navigate(-1);
  }

  const successMessage = () => {
    message.success(`Employee is updated successfully!`).then(r => {
    });
    navigate(-1)
  }

  const onSubmitForm = () => {
    const values = form.getFieldsValue(true, meta => meta.touched);
    let formData: any = {id: params?.eid}
    let address: any = {}
    let record: any = {}
    for (let data in values) {
      if (data === 'streetAddress' || data === 'state' || data === 'city' || data === 'zipcode') {
        address[data] = values[data]
        formData['address'] = address
      } else if (data === 'startDate' || data === 'endDate' || data === 'payRate') {
        record[data] = values[data]
        formData['record'] = record
      } else if (data !== 'upload') {
        formData[data] = values[data]
      }
    }

    UserUpdate({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.UserUpdate) {
        if (values?.upload) {
          const formData = new FormData();
          formData.append('file', values?.upload[0]?.originFileObj)
          mediaServices.uploadProfileImage(formData).then((res: any) => {
            const user = params?.eid;
            const avatar = res?.data?.id;
            ChangeProfilePictureInput({
              variables: {
                input: {
                  id: user,
                  avatar_id: avatar
                }
              }}).then((response) => {
              if(response.errors) {
                return notifyGraphqlError((response.errors))
              } else if (response?.data) {
                successMessage()
              }
            }).catch(notifyGraphqlError)
          })
        } else {
          successMessage()
        }
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row style={{height: '122px'}}>
          <Col span={12} className={styles['employee-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Edit Employee</h1>
          </Col>
        </Row>
        {userData &&
          <Form form={form} layout="vertical" onFinish={onSubmitForm} initialValues={{
            email: userData?.User?.data[0]?.email ?? '',
            firstName: userData?.User?.data[0]?.firstName ?? '',
            middleName: userData?.User?.data[0]?.middleName ?? '',
            lastName: userData?.User?.data[0]?.lastName ?? '',
            phone: userData?.User?.data[0]?.phone ?? '',
            roles: userData?.User?.data[0]?.roles[0]?.id ?? '',
            status: userData?.User?.data[0]?.status ?? '',
            streetAddress: userData?.User?.data[0]?.address?.streetAddress ?? '',
            startDate: moment(userData?.User?.data[0]?.record?.endDate ?? '2022-01-01T00:00:00.410Z', dateFormat),
            endDate: moment(userData?.User?.data[0]?.record?.startDate ?? '2022-01-02T00:00:00.410Z', dateFormat),
            state: userData?.User?.data[0]?.address?.state ?? '',
            city: userData?.User?.data[0]?.address?.city ?? '',
            zipcode: userData?.User?.data[0]?.address?.zipcode ?? '',
            payRate: userData?.User?.data[0]?.record?.payRate ?? ''
          }}>
            <Row>
              <Col className={`${styles.formHeader}`}>
                <p>Employee Information</p>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="First Name" name='firstName' rules={[{ required: true, message: 'Please enter the firstname' }]}>
                  <Input placeholder="Enter firstname"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="Middle Name" name='middleName'>
                  <Input placeholder="Enter middle name"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="Last Name" name='lastName' rules={[{ required: true, message: 'Please select the lastname' }]}>
                  <Input placeholder="Enter lastname"/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Email" name='email' rules={[{type: 'email', message: 'The input is not valid E-mail!'},
                  { required: true, message: 'Please input your E-mail!'},]}>
                  <Input placeholder="Enter your email"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Phone Number" name='phone' rules={[{ required: true, message: 'Please input your phone number!' },
                  {max: 10, message: "Phone number should be less than 10 digits"}]}>
                  <Input placeholder="Enter your phone number" />
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
                  <Input placeholder="Enter the state name"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="City" name='city'>
                  <Input placeholder="Enter city name"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="Street Address" name='streetAddress' rules={[{ required: true, message: 'Please select the ' +
                    'street address' }]}>
                  <Input placeholder="Enter street address"/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Apartment/Suite" name='apartment'>
                  <Input placeholder="Enter your apartment no"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Zip Code" name='zipcode'>
                  <Input placeholder="Enter the zipcode"/>
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
                <Form.Item name="startDate" label="Employee Start Date" rules={[{ required: true, message: 'Please select the start date' }]}>
                  {/*<DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter Start Date"} suffixIcon={""}*/}
                  {/*            showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}/>*/}
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="endDate" label="Employee End Date" rules={[{ required: true, message: 'Please select the end date' }]}>
                  {/*<DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter End Date"} suffixIcon={""}*/}
                  {/*            showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}/>*/}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="roles" label="Role" rules={[{ required: true, message: 'Please select the role!' }]}>
                  <Select placeholder="Employee" disabled={true}>
                    {roles && roles?.Role?.data.map((role: IRole, index: number) => (
                      <Option value={role?.id} key={index}>{role?.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Pay Rate" name='payRate' rules={[{ required: true, message: 'Please enter the pay rate' }]}>
                  <InputNumber placeholder="$20"/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="reporting" label="Reporting Manager">
                  <Select placeholder="Select Reporting Manager">
                    <Option value="Employee">Employee</Option>
                    <Option value="TaskManager">Task Manager</Option>
                    <Option value="Vendor">Vendor</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="reportsTo" label="Employee Reports to">
                  <Select placeholder="Select Reporting Officer">
                    <Option value="Employee">Employee</Option>
                    <Option value="TaskManager">Task Manager</Option>
                    <Option value="Vendor">Vendor</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="upload" label="Upload" valuePropName="fileList" getValueFromEvent={profileFile}>
                  <Upload name="profileImg" maxCount={1}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
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
            <br/><br/>
            <Row justify="end">
              <Col>
                <Form.Item>
                  <Space>
                    <Button type="default" htmlType="button" onClick={cancelEditEmployee}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Update Employee</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
      </Card>
    </div>
  )
}
export default EditEmployee
