import { Card, Col, Row, Form, Input, Space, Button, Select, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";

import { COMPANY_UPDATE } from "..";

import styles from "../style.module.scss";

const { Option } = Select;

export const COMPANY = gql`
  query Company($input: CompanyQueryInput) {
    Company(input: $input) {
      data {
        id
        name
        status
        adminEmail
        users {
          id
          phone
          email
          firstName
          lastName
          company {
            id
          }
        }
      }
    }
  }
`

const EditCompany = () => {
  let params = useParams()
  const navigate = useNavigate()
  const { data: companyData } = useQuery(COMPANY, {
    variables: {
      input: {
        query: {
          id: params?.id ?? '',
        }
      }
    }
  })
  const [form] = Form.useForm()
  const [updateCompany] = useMutation(COMPANY_UPDATE)

  const onSubmitForm = (values: any) => {
    updateCompany({
      variables: {
        input: {
          id: params?.id,
          name: values.name,
          status: values.status
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.CompanyUpdate) {
        message.success(`Company is updated successfully!`).then(r => { });
        navigate(-1)
      }
    }).catch(notifyGraphqlError)
  }

  console.log(companyData);

  return (
    <div className={styles['company-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col
            span={24}
            className={styles['form-col']}>
            <h1>
              <ArrowLeftOutlined
                onClick={() => navigate(-1)} />
              &nbsp;
              Edit Company
            </h1>
          </Col>
        </Row>
        {companyData &&
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}
            initialValues={{
              name: companyData?.Company?.data[0]?.name ?? '',
              email: companyData?.Company?.data[0]?.adminEmail ?? '',
              status: companyData?.Company?.data[0]?.status ?? ''
            }}>
            <Row gutter={[24, 0]}>
              <Col
                xs={24}
                sm={24}
                md={12}>
                <Form.Item
                  label="Company Name"
                  name="name"
                  rules={[{
                    required: true,
                    message: 'Enter a company name.'
                  }, {
                    max: 50,
                    message: "Name should be less than 50 character"
                  }]}>
                  <Input
                    placeholder="Enter Name of the company"
                    autoComplete="off" />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}>
                <Form.Item
                  name="status"
                  label="Company Status"
                  rules={[{
                    required: true,
                    message: 'Select a company status.'
                  }]}>
                  <Select placeholder="Active">
                    <Option value="Active">
                      Active
                    </Option>
                    <Option value="Inactive">
                      In Active
                    </Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={24}>
                <Form.Item
                  label="Email"
                  name='email'
                  rules={[{
                    type: 'email',
                    message: 'The input is not valid E-mail!'
                  }, {
                    required: true,
                    message: 'Please input your E-mail!'
                  },]}>
                  <Input
                    disabled
                    placeholder="Company Admin Email"
                    autoComplete="off" />
                </Form.Item>
              </Col>
            </Row>
            <br /><br />
            <Row justify="end">
              <Col>
                <Form.Item>
                  <Space size={'large'}>
                    <Button
                      type="default"
                      htmlType="button">
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit">
                      Edit Company
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>}
      </Card>
    </div>
  )
}

export default EditCompany;
