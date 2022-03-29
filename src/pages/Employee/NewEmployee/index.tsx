import React from "react";
import moment from 'moment';

import { Button, Card, Col, Form, Input, message, Row, Select, Space, DatePicker, InputNumber } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import styles from "../style.module.scss";
import {gql, useMutation, useQuery} from "@apollo/client";
import {notifyGraphqlError} from "../../../utils/error";
import {authVar} from "../../../App/link";
import {IRole} from "../../../interfaces/IRole";

const EMPLOYEE_CREATE = gql`
  mutation UserCreate($input: UserCreateInput!) {
      UserCreate(input: $input) {
          id
          firstName
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

const NewEmployee = () => {
  const navigate = useNavigate();
  const authData = authVar();
  const [UserCreate] = useMutation(EMPLOYEE_CREATE);
  const { data: roles } = useQuery(ROLES, {
    fetchPolicy: "cache-first"
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelAddEmployee = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
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
        message.success(`New Employee ${response?.data?.UserCreate?.firstName} is created successfully!`).then(r => {});
        navigate(-1)
      }
    }).catch(notifyGraphqlError)
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
              <Form.Item name="startDate" label="Employee Start Time">
                <DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter Start Date"} suffixIcon={""}
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="endDate" label="Employee End Date">
                <DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter End Date"} suffixIcon={""}
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="roles" label="Role">
                <Select placeholder="Employee">
                  {roles && roles?.Role?.data.map((role: IRole, index:number) => (
                    <Option value={role?.id} key={index}>{role?.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Pay Rate" name='payRate'>
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
              <Form.Item label="Input Field with text" name='image'>
                <Input placeholder="Employee Image" />
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
