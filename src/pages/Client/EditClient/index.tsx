import React from "react";
import {Button, Card, Col, Form, Input, message, Row, Select, Space} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import {useNavigate, useParams} from "react-router-dom";

import {gql, useMutation, useQuery} from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";
import { Client } from "../../../interfaces/graphql";
import { CLIENT } from "../index";

import styles from "../style.module.scss";

interface ClientResponseData {
  ClientCreate: Client
}

export const CLIENT_UPDATE = gql`
    mutation ClientUpdate($input: ClientUpdateInput!) {
        ClientUpdate(input: $input) {
            id
            name
            email
            invoicingEmail
            address {
                id
                streetAddress
            }
        }
    }

`

const EditClient = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();
  const [ClientUpdate] = useMutation<ClientResponseData>(CLIENT_UPDATE);
  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelAddClient = () => {
    navigate(-1);
  }
  const {data: userData} = useQuery(CLIENT, {
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          id: params?.cid
        }
      }
    }
  })

  const onSubmitForm = (values: any) => {
    message.loading({content: "Client updating in progress..", className: 'custom-message'}).then(() =>
      ClientUpdate({
        variables: {
          input: {
            id: params?.cid,
            name: values.name,
            company_id: authData?.company?.id,
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
          return notifyGraphqlError((response.errors))
        } else if (response?.data) {
          navigate(-1)
          message.success({content: `Client is updated successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError))
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['client-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Edit Client</h1>
          </Col>
        </Row>
        <div>
          {userData &&
          <Form form={form} layout="vertical" onFinish={onSubmitForm} initialValues={{
            email: userData?.Client?.data[0]?.email ?? '',
            name: userData?.Client?.data[0]?.name ?? '',
            streetAddress: userData?.Client?.data[0]?.address?.streetAddress ?? '',
            state: userData?.Client?.data[0]?.address?.state ?? '',
            city: userData?.Client?.data[0]?.address?.city ?? '',
            zipcode: userData?.Client?.data[0]?.address?.zipcode ?? '',
            invoiceEmail: userData?.Client?.data[0]?.invoicingEmail ?? ''
          }}>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Full Name" name='name' rules={[{ required: true, message: 'Please enter full name!' }]}>
                  <Input placeholder="Enter the full name" autoComplete="off"/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Email Address" name='email'  rules={[{type: 'email', message: 'The input is not valid E-mail!',},
                  {required: true, message: 'Please input your E-mail!'},]}>
                  <Input placeholder="Enter your email" autoComplete="off" disabled/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Invoice Email" name='invoiceEmail'  rules={[{type: 'email', message: 'The input is not ' +
                    'valid Invoice E-mail!',},
                  {required: true, message: 'Please input your invoice E-mail!'},]}>
                  <Input placeholder="Enter your invoice email" autoComplete="off" disabled/>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Street Address" name='streetAddress' rules={[{ required: true, message: 'Please enter address!' }]}>
                  <Input placeholder="Enter the address of the client" name='address' autoComplete="off"/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="state" label="State" rules={[{ required: true, message: 'Please enter state!' }]}>
                  <Select placeholder="Select State">
                    <Option value="Arkansas">Arkansas</Option>
                    <Option value="NewYork">New york</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item name="city" label="City" rules={[{ required: true, message: 'Please enter city!' }]}>
                  <Select placeholder="Select City">
                    <Option value="Pokhara">Pokhara</Option>
                    <Option value="Kathmandu">Kathmandu</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
                <Form.Item label="Zip Code" name='zipcode' rules={[{ required: true, message: 'Please enter zipcode!' }]}>
                  <Input placeholder="Enter the zipcode" autoComplete="off"/>
                </Form.Item>
              </Col>
            </Row>
            <Row justify="end" style={{padding: '1rem 1rem 2rem 0'}}>
              <Col>
                <Form.Item>
                  <Space>
                    <Button type="default" htmlType="button" onClick={cancelAddClient}>Cancel</Button>
                    <Button type="primary" htmlType="submit">Update Client</Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
        </div>
      </Card>
    </div>
  )
}

export default EditClient;
