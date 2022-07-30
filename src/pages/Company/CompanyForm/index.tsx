import React, { useState, useEffect } from 'react';
import {
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
} from 'antd';

import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

import { useNavigate } from 'react-router-dom';
import { notifyGraphqlError } from '../../../utils/error';

import styles from './style.module.scss';
import constants from '../../../config/constants';
import { authVar } from '../../../App/link';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { Company, CompanyCreateInput, CompanyUpdateInput, MutationCompanyCreateArgs, MutationCompanyUpdateArgs } from '../../../interfaces/generated';
import routes from '../../../config/routes';

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
    }
  }
`;

export const COMPANY_UPDATE = gql`
  mutation CompanyUpdate($input: CompanyUpdateInput!) {
    CompanyUpdate(input: $input) {
      id
      name
    }
  }
`;

interface IProps {
  company?: Company;
}

const CompanyForm = (props: IProps) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const authData = authVar();
  const [fileData, setFile] = useState<{ id: null | string, name: string }>({
    id: null,
    name: "",
  });

  useEffect(() => {
    if(props.company?.logo) {
      setFile({
        id: props.company.logo.id,
        name: props.company.logo.name,
      });
    }
  }, [props.company?.logo])

  const [createCompany, { loading: creatingCompany }] = useMutation<
    GraphQLResponse<'CompanyCreate', Company>,
    MutationCompanyCreateArgs
  >(COMPANY_CREATE, {
    onCompleted(response) {
      if(response?.CompanyCreate) {
        message.success(`Company ${response?.CompanyCreate?.name} created successfully!`)
        navigate(routes.companyAdmin.path);
      }
    },
    onError: notifyGraphqlError,
  });

  const [updateCompany, { loading: updatingCompany }] = useMutation<
    GraphQLResponse<'CompanyUpdate', Company>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted(response) {
      if(response?.CompanyUpdate) {
        message.success(`Company ${response?.CompanyUpdate?.name} updated successfully!`)
        //navigate(routes.companyAdmin.path);
      }
    },
    onError: notifyGraphqlError,
  });

  const uploadProps: UploadProps = {
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
    if(props.company) {
      const address = {
        id: props.company.admin?.address_id as string,
        country:values.country,
        streetAddress: values.streetAddress,
        state: values.state,
        city: values.city,
        zipcode: values.zipcode,
        aptOrSuite: values.aptOrSuite,
      }


      const input: CompanyUpdateInput = {
        id: props.company.id,
        name: values.name,
        status: values.status,
        user: {
          id: props.company.admin?.id as string,
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          address,
        },
      }

      if (fileData?.id) {
        input.logo_id = fileData.id;
      }

      updateCompany({
        variables: {
          input,
        },
      });
    } else {
      const input: CompanyCreateInput = {
        name: values.name,
        status: values.status,
        user: {
          firstName: values.firstName,
          middleName: values.middleName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          address: {
            country:values.country,
            streetAddress: values.streetAddress,
            state: values.state,
            city: values.city,
            zipcode: values.zipcode,
            aptOrSuite: values.aptOrSuite,
          },
        },
      }

      if (fileData?.id) {
        input.logo_id = fileData.id;
      }

      createCompany({
        variables: {
          input,
        },
      })

    }
  };

  let initialValues: any;
  if(props.company) {
    const company = props.company;
    initialValues = {
      name: company.name,
      status: company.status,
      firstName: company.admin.firstName,
      middleName: company.admin.middleName,
      lastName: company.admin.lastName,
      email: company.admin.email,
      phone: company.admin.phone,
      country:company.admin.address?.country,
      streetAddress: company.admin.address?.streetAddress,
      aptOrSuite: company.admin.address?.aptOrSuite,
      state: company.admin.address?.state,
      city: company.admin.address?.city,
      zipcode: company.admin.address?.zipcode,
    }
  }

  return (
    <Form initialValues={initialValues} form={form} layout="vertical" onFinish={onSubmitForm}>
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
            label="Select company status"
            rules={[
              {
                required: true,
                message: "Select a company status.",
              },
            ]}
          >
            <Select placeholder="Company Status">
              <Option value="Active">Active</Option>
              <Option value="Inactive">In Active</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={[24, 0]}>
        <Col xs={24} sm={24} md={8}>
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              {
                required: true,
                message: "Please input your first name!",
              },
            ]}
          >
            <Input placeholder="Enter firstname" autoComplete="off" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Form.Item label="Middle Name" name="middleName">
            <Input placeholder="Enter middle name" autoComplete="off" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              {
                required: true,
                message: "Please input your last name!",
              },
            ]}
          >
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
            <Input placeholder="Company Admin Email" autoComplete="off" disabled={!!props.company} />
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

        <Col xs={24} sm={24} md={8} lg={8}>
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

        <Col xs={24} sm={24} md={8} lg={8}>
          <Form.Item
            label="State"
            name='state'
            rules={[{
              required: true,
              message: 'Please enter your state!'
            }]}
          >
            <Input
              placeholder="Enter the state"
              name='state'
              autoComplete="off" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8}>
          <Form.Item
            label="City"
            name='city'
            rules={[{
              required: true,
              message: 'Please enter your city!'
            }]}
          >
            <Input
              placeholder="Enter the city "
              name='city'
              autoComplete="off" 
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8}>
          <Form.Item label="Street Address" name="streetAddress">
            <Input placeholder="Enter street address" autoComplete="off" />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={8} lg={8}>
          <Form.Item label="Apartment/Suite" name="aptOrSuite">
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

        <Col xs={24} sm={24} md={24} lg={24}>
          <Form.Item
            name="upload"
            label="Upload Company Logo"
            valuePropName="filelist"
            getValueFromEvent={normFile}
            style={{ position: "relative" }}
          >
            <div className={styles['upload-file']}>
              <div>
                <span>
                  { fileData?.name ? fileData?.name : ' Attach your files here' }
                </span>
              </div>
              <div className={styles['browse-file']}>
                <Upload {...uploadProps}>Click to Upload</Upload>
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
              <Button type="default" htmlType="button" onClick={() => navigate(routes.companyAdmin.path)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={creatingCompany || updatingCompany}>
                { props.company ? 'Save': 'Add Company' }
              </Button>
            </Space>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};

export default CompanyForm;
