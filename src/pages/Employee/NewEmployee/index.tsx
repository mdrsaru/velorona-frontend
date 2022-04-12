import React, {useState} from "react";
import moment from 'moment';

import { Button, Card, Col, Form, Input, message, Row, Select, Space, Upload, DatePicker, InputNumber } from "antd";
import { ArrowLeftOutlined, UploadOutlined } from "@ant-design/icons";
import { mediaServices } from '../../../services/MediaService';
import {roles_user} from "../../../config/constants";

import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import styles from "../style.module.scss";

const normFile = (e: any) => {
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

const EMPLOYEE_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
      UserCreate(input: $input) {
          id
          firstName
      }
  }
`

const NewEmployee = () => {
  const navigate = useNavigate();
  const authData = authVar();
  const [dates, setDates] = useState([]);
  const [UserCreate] = useMutation(EMPLOYEE_CREATE);
  const [ChangeProfilePictureInput] = useMutation(CHANGE_PROFILE_IMAGE);
  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelAddEmployee = () => {
    navigate(-1);
  }
  const successMessage = () => {
    navigate(-1)
    message.success({content: `New Employee is created successfully!`, className: 'custom-message'});
  }

  function disabledDate(current: any) {
    return current && current < moment(dates, 'YYYY-MM-DD');
  }

  const onSubmitForm = (values: any) => {
    message.loading({content: "New employee adding in progress..", className: 'custom-message'}).then(() =>
    UserCreate({
      variables: {
        input: {
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          lastName: values.lastName,
          status: values.status,
          company_id: authData?.company?.id,
          roles: [values?.roles],
          address: {
            streetAddress: values.streetAddress,
            state: values.state,
            city: values.city,
            zipcode: values.zipcode
          },
          record: {
            startDate: values.startDate,
            endDate: values.endDate,
            payRate: values.payRate
          }
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.UserCreate) {
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
                }}).then((response) => {
                if(response.errors) {
                  return notifyGraphqlError((response.errors))
                } else if (response?.data) {
                  successMessage()
                }
              }).catch(notifyGraphqlError))
            })
        } else {
          successMessage()
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
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="First Name" name='firstName' rules={[{ required: true, message: 'Please enter firstname!' }]}>
                <Input placeholder="Enter firstname" name='firstname'/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Last Name" name='lastName' rules={[{ required: true, message: 'Please input your lastname!' }]}>
                <Input placeholder="Enter lastname" name='lastname'/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Email" name='email'  rules={[{type: 'email', message: 'The input is not valid E-mail!',},
                {required: true, message: 'Please input your E-mail!'},]}>
                <Input placeholder="Enter your email" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Phone Number" name='phone' rules={[{ required: true, message: 'Please input your phone number!' },
                {max: 10, message: "Phone number should be less than 10 digits"}]}>
                <Input placeholder="Enter your phone number"/>
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
                <Input placeholder="Enter the state name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="City" name='city'>
                <Input placeholder="Enter city name" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="Street Address" name='streetAddress' rules={[{ required: true, message: 'Please enter your street address!' }]}>
                <Input placeholder="Enter street address" name='street'/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Apartment/Suite" name='apartment'>
                <Input placeholder="Enter your apartment no" name=''/>
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
              <Form.Item name="startDate" label="Employee Start Date" rules={[{ required: true, message: 'Please enter start time!' }]}>
                {/*<DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter Start Date"} suffixIcon={""}*/}
                {/*            onChange={(val: any) => setDates(val)}*/}
                {/*            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}/>*/}
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="endDate" label="Employee End Date" rules={[{ required: true, message: 'Please enter end date!' }]}>
                {/*<DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter End Date"} suffixIcon={""}*/}
                {/*            disabledDate={disabledDate}*/}
                {/*            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}/>*/}
              </Form.Item>
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
              <Form.Item label="Pay Rate" name='payRate' rules={[{ required: true, message: 'Please enter pay rate!' }]}>
                <InputNumber placeholder="$20" />
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
              <Form.Item name="upload" label="Upload" valuePropName="fileList" getValueFromEvent={normFile}>
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
                  <Button type="default" htmlType="button" onClick={cancelAddEmployee}>Cancel</Button>
                  <Button type="primary" htmlType="submit">Create Employee</Button>
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
