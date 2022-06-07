import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Form,
  Input,
  Space,
  Button,
  Select,
  message,
  Upload,
  UploadProps,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";

import { useNavigate } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";

import styles from "../style.module.scss";
import { STATE_CITIES, USA_STATES } from "../../../utils/cities";
import constants from "../../../config/constants";
import { authVar } from "../../../App/link";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { Company, CompanyCreateInput, MutationCompanyCreateArgs } from "../../../interfaces/generated";

const { Option } = Select;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const COMPANY_CREATE = gql`
  mutation CompanyCreate($input: CompanyCreateInput!) {
    CompanyCreate(input: $input) {
      id
      name
      status
      createdAt
    }
  }
`;

const NewCompany = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const authData = authVar();

  const [createCompany] = useMutation<
    GraphQLResponse<'CompanyCreate', Company>,
    MutationCompanyCreateArgs
  >(COMPANY_CREATE);
  const [cities, setCountryCities] = useState<string[]>([]);
  const setState = (data: string) => {
    setCountryCities(STATE_CITIES[data]);
  };
  const [fileData, setFile] = useState({
    id: null,
    name: "",
  });

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

  const onSubmitForm = (values: any) => {
    const input: CompanyCreateInput = {
      name: values.name,
      status: values.status,
      user: {
        firstName: values.firstName,
        middleName: values.middleName,
        lastName: values.lastName,
        email: values.email,
        address: {
          streetAddress: values.streetAddress,
          state: values.state,
          city: values.city,
          zipcode: values.zipcode,
        },
        phone: values.phone,
      },

    }
    if(fileData?.id) {
      input.logo_id = fileData.id;
    }
    createCompany({
      variables: {
        input,
      },
    })
      .then((response) => {
        if (response.errors) {
          return notifyGraphqlError(response.errors);
        } else if (response?.data?.CompanyCreate) {
          message
            .success(
              `Company admin ${response?.data?.CompanyCreate?.name} is created successfully!`
            )
            .then((r) => {});
          navigate(-1);
        }
      })
      .catch(notifyGraphqlError);
  };

  return (
    <div className={styles["company-main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles["form-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New Company
            </h1>
          </Col>
        </Row>
        <Form form={form} layout="vertical" onFinish={onSubmitForm}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Company Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Enter a company name.",
                  },
                  {
                    max: 50,
                    message: "Name should be less than 50 character",
                  },
                ]}
              >
                <Input
                  placeholder="Enter Name of the company"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                name="status"
                label="Company Status"
                rules={[
                  {
                    required: true,
                    message: "Select a company status.",
                  },
                ]}
              >
                <Select placeholder="Active">
                  <Option value="Active">Active</Option>
                  <Option value="Inactive">In Active</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="First Name" name="firstName">
                <Input placeholder="Enter firstname" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="Middle Name" name="middleName">
                <Input placeholder="Enter middle name" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="Last Name" name="lastName">
                <Input placeholder="Enter lastname" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "The input is not valid E-mail!",
                  },
                  {
                    required: true,
                    message: "Please input your E-mail!",
                  },
                ]}
              >
                <Input placeholder="Company Admin Email" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Please input your phone number!",
                  },
                  {
                    max: 11,
                    message: "Phone number should be less than 10 digits",
                  },
                ]}
              >
                <Input
                  placeholder="Enter your phone number"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item label="State" name="state">
                <Select
                  showSearch
                  placeholder={"Select the state"}
                  onChange={setState}
                >
                  {USA_STATES?.map((state: any, index: number) => (
                    <Select.Option value={state?.name} key={index}>
                      {state?.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <Form.Item label="City" name="city">
                <Select showSearch placeholder={"Select the city"}>
                  {cities?.map((city: string, index: number) => (
                    <Select.Option value={city} key={index}>
                      {city}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <Form.Item label="Street Address" name="streetAddress">
                <Input placeholder="Enter street address" autoComplete="off" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item label="Apartment/Suite" name="apartment">
                <Input
                  placeholder="Enter your apartment no"
                  autoComplete="off"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
              <Form.Item label="Zip Code" name="zipcode">
                <Input placeholder="Enter the zipcode" autoComplete="off" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={24} md={12} lg={12}>
              <Form.Item
                name="upload"
                label="Upload Profile Image"
                valuePropName="filelist"
                getValueFromEvent={normFile}
                style={{ position: "relative" }}
              >
                <div className={styles["upload-file"]}>
                  <div>
                    <span>
                      {fileData?.name
                        ? fileData?.name
                        : " Attach your files here"}
                    </span>
                  </div>
                  <div className={styles["browse-file"]}>
                    <Upload {...props}>Click to Upload</Upload>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space size={"large"}>
                  <Button type="default" htmlType="button">
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Add Company
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default NewCompany;
