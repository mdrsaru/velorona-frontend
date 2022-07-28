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
  UploadProps,
  Upload,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";

import { COMPANY_UPDATE } from "..";

import styles from "../style.module.scss";
import { useState } from "react";
import constants from "../../../config/constants";
import { authVar } from "../../../App/link";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { Company, CompanyPagingResult, CompanyUpdateInput, MutationCompanyUpdateArgs, QueryCompanyArgs } from "../../../interfaces/generated";
import routes from "../../../config/routes";

const { Option } = Select;

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};


export const COMPANY = gql`
  query Company($input: CompanyQueryInput) {
    Company(input: $input) {
      data {
        id
        name
        status
        adminEmail
        logo {
          id
          url
          name
        }
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
`;

const EditCompany = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();

  const [fileData, setFile] = useState({
    id: "",
    name: "",
  });

  const props: UploadProps = {
    name: "file",
    action: `${constants.apiUrl}/v1/media/upload`,
    maxCount: 1,
    headers: {
      authorization: authData?.token ? `Bearer ${authData?.token}` : "",
    },
    onChange(info) {
      if (info.file.status === "done") {
        setFile({
          name: info?.file?.name,
          id: info?.file?.response?.data?.id,
        });
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const { data: companyData } = useQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY, {
    variables: {
      input: {
        query: {
          id: params?.id ?? "",
        },
      },
    },
    onCompleted: (response) => {
      setFile({
        id: "",
        name: response?.Company?.data[0]?.logo?.name as string,
      });
    },
  });


  const [form] = Form.useForm();
  const [updateCompany] = useMutation<
    GraphQLResponse<'CompanyUpdate', Company>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted: () => {
      message.success(`Company is updated successfully!`);
      navigate(-1);
    },
  });

  const onSubmitForm = (values: any) => {
    const input: CompanyUpdateInput = {
      id: params?.id as string,
      name: values.name,
      status: values.status,
    }
    if(fileData?.id) {
      input.logo_id = fileData.id;
    }
    updateCompany({
      variables: {
        input: input
      },
    })
      .then((response) => {
        if (response.errors) {
          return notifyGraphqlError(response.errors);
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
              &nbsp; Edit Company
            </h1>
          </Col>
        </Row>
        {companyData && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}
            initialValues={{
              name: companyData?.Company?.data[0]?.name ?? "",
              email: companyData?.Company?.data[0]?.adminEmail ?? "",
              status: companyData?.Company?.data[0]?.status ?? "",
              file: companyData?.Company?.data[0]?.logo?.url,
            }}
          >
            <Row gutter={[24, 0]}>
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
              <Col xs={24} sm={24} md={24}>
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
                  <Input
                    disabled
                    placeholder="Company Admin Email"
                    autoComplete="off"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="upload"
                  label="Upload Company Logo"
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
                    <Button type="default" htmlType="button" onClick={()=>navigate(routes.companyAdmin.path)}>
                      Cancel
                    </Button>
                    <Button type="primary" htmlType="submit">
                      Save
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default EditCompany;
