import React, {useEffect, useState} from "react";
import moment from 'moment';

import { Button, Card, Col, Form, Input, message, Row, Select, Space, DatePicker, InputNumber } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import styles from "../style.module.scss";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";
import { IRole } from "../../../interfaces/IRole";

const EMPLOYEE_UPDATE = gql`
  mutation UserUpdate($input: UserCreateInput!) {
      UserCreate(input: $input) {
          id
          firstName
          lastName
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
        client {
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
  const authData = authVar();
  let params = useParams();
  const {data: userData} = useQuery(USER, {
    variables: {
      input: {
        query: {
          id: params?.eid
        }
      }
    },
    fetchPolicy: "cache-first"
  })

  const [employeeData, updateEmployee] = useState({})
  const [UserUpdate] = useMutation(EMPLOYEE_UPDATE);
  const { data: roles } = useQuery(ROLES, {
    fetchPolicy: "cache-first"
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  useEffect(() => {
    updateEmployee(userData?.User?.data[0])
  }, [userData?.User?.data])

  const onChangeFormData = (event: any) => {
      updateEmployee({...employeeData, [event.target.name]: event.target.value});
  }

  const cancelAddEmployee = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
    console.log(values);
    UserUpdate({
      variables: {
        input: {
          email: values.email,
          phone: values.phone,
          firstName: values.firstName,
          lastName: values.lastName,
          status: values.status,
          client_id: authData?.client?.id,
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
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Edit Employee</h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm} initialValues={userData?.User?.data[0]}>
          <Row>
            <Col className={`${styles.formHeader}`}>
              <p>Employee Information</p>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="First Name" name='firstName'>
                <Input placeholder="Enter firstname" onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Last Name" name='lastName'>
                <Input placeholder="Enter lastname" onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Email" name='email'>
                <Input placeholder="Enter your email" onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Phone Number" name='phone'>
                <Input placeholder="Enter your phone number" onChange={onChangeFormData}/>
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
                <Input placeholder="Enter the state name" onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="City" name='city'>
                <Input placeholder="Enter city name" onChange={onChangeFormData} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8} className={styles.formCol}>
              <Form.Item label="Street Address" name='streetAddress'>
                <Input placeholder="Enter street address" onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Apartment/Suite" name='apartment'>
                <Input placeholder="Enter your apartment no" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Zip Code" name='zipcode'>
                <Input placeholder="Enter the zipcode" onChange={onChangeFormData}/>
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
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                            onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="endDate" label="Employee End Date">
                <DatePicker format="YYYY-MM-DD HH:mm:ss" placeholder={"Enter End Date"} suffixIcon={""}
                            showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                            onChange={onChangeFormData}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="roles" label="Role">
                <Select placeholder="Employee" onChange={onChangeFormData}>
                  {roles && roles?.Role?.data.map((role: IRole, index:number) => (
                    <Option value={role?.id} key={index}>{role?.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Pay Rate" name='payRate'>
                <InputNumber placeholder="$20" onChange={onChangeFormData}/>
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
              <Form.Item name="status" label="Employee Status">
                <Select placeholder="Select status" onChange={onChangeFormData}>
                  <Option value="Active">Active</Option>
                  <Option value="InActive">In Active</Option>
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
                  <Button type="primary" htmlType="submit">Update Employee</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
export default EditEmployee
