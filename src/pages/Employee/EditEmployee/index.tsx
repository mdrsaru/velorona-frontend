import React from "react";
import moment from 'moment';

import {Button, Card, Col, Form, Input, message, Row, Select, Space, DatePicker, InputNumber} from "antd";
import {ArrowLeftOutlined} from "@ant-design/icons";

import {useNavigate, useParams} from "react-router-dom";

import styles from "../style.module.scss";
import {gql, useMutation, useQuery} from "@apollo/client";
import {notifyGraphqlError} from "../../../utils/error";
import {IRole} from "../../../interfaces/IRole";

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
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
  const navigate = useNavigate();
  let params = useParams();
  const [UserUpdate] = useMutation(EMPLOYEE_UPDATE);
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

  console.log(userData);

  const [form] = Form.useForm();
  const {Option} = Select;

  const cancelEditEmployee = () => {
    navigate(-1);
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
      } else {
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
        message.success(`Employee ${response?.data?.UserUpdate?.firstName} is updated successfully!`).then(r => {
        });
        navigate(-1)
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
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
                <Form.Item label="First Name" name='firstName'>
                  <Input placeholder="Enter firstname"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="Middle Name" name='middleName'>
                  <Input placeholder="Enter middle name"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
                <Form.Item label="Last Name" name='lastName'>
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
                <Form.Item label="Street Address" name='streetAddress'>
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
                <Form.Item name="startDate" label="Employee Start Time">
                  <DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter Start Date"} suffixIcon={""}
                              defaultValue={moment(userData?.User?.data[0]?.record?.endDate, dateFormat)}
                              showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="endDate" label="Employee End Date">
                  <DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter End Date"} suffixIcon={""}
                              defaultValue={moment(userData?.User?.data[0]?.record?.startDate, dateFormat)}
                              showTime={{defaultValue: moment('00:00:00', 'HH:mm:ss')}}/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="roles" label="Role">
                  <Select placeholder="Employee" disabled={true}>
                    {roles && roles?.Role?.data.map((role: IRole, index: number) => (
                      <Option value={role?.id} key={index}>{role?.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Pay Rate" name='payRate'>
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
                <Form.Item label="Input Field with text" name='image'>
                  <Input placeholder="Employee Image"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="status" label="Employee Status">
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
