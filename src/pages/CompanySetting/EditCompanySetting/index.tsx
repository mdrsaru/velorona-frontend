import {
  Card,
  Col,
  Row,
  Form,
  Input,
  Space,
  Button,
  message,
  UploadProps,
  Upload,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { notifyGraphqlError } from "../../../utils/error";


import styles from "./style.module.scss";
import { useState } from "react";
import constants from "../../../config/constants";
import { authVar } from "../../../App/link";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { Company, CompanyPagingResult, CompanyUpdateInput, MutationCompanyUpdateArgs, QueryCompanyArgs } from "../../../interfaces/generated";
import routes from "../../../config/routes";
import { COMPANY_UPDATE } from "../../Company";


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

const EditCompanySetting = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();

  const [fileData, setFile] = useState({
    id: "",
    name: "",
    url: "",
  });

  const props: UploadProps = {
    name: "file",
    action: `${constants.apiUrl}/v1/media/upload`,
		accept:'image/*',
    maxCount: 1,
    headers: {
      authorization: authData?.token ? `Bearer ${authData?.token}` : "",
    },
    onChange(info) {
      if (info.file.status === "done") {
        setFile({
          name: info?.file?.name,
          id: info?.file?.response?.data?.id,
          url: info?.file?.response?.data?.url as string,
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
          id: params?.eid ?? "",
        },
      },
    },
    onCompleted: (response) => {
      setFile({
        id: "",
        name: response?.Company?.data[0]?.logo?.name as string,
        url: response?.Company?.data[0]?.logo?.url as string,
      });
    },
  });


  const [form] = Form.useForm();
  const [updateCompany] = useMutation<
    GraphQLResponse<'CompanyUpdate', Company>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted: (response) => {
      message.success(`Company is updated successfully!`);
      const userAuth = authVar();
      authVar({
        ...userAuth,
        company: {
          id: response.CompanyUpdate?.id as string,
          code: response.CompanyUpdate?.companyCode as string,
          name: response.CompanyUpdate?.name as string ?? userAuth?.company?.name,
          logo: {
            id: response.CompanyUpdate?.logo?.id ?? userAuth?.company?.logo?.id as string,
            url: response.CompanyUpdate?.logo?.url as string ?? userAuth?.company?.logo?.url,
            name: response.CompanyUpdate?.logo?.name as string ?? userAuth?.company?.logo?.name,
          }
        },
      });
      navigate(routes.companySetting.path(authData?.company?.code ?? '',params?.eid ?? ''));
    },
  });

  const onSubmitForm = (values: any) => {
    const input: CompanyUpdateInput = {
      id: params?.eid as string,
      name: values.name,
    }
    if (fileData?.id) {
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
    <Card bordered={false} className={styles["container"]}>
      <Row>
        <Col span={24} className={styles["form-col"]}>
          <h1>
            <ArrowLeftOutlined onClick={() => navigate(routes.companySetting.path(authData?.company?.code ?? '',params?.eid ?? ''))} />
            &nbsp; General Setting
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
            file: companyData?.Company?.data[0]?.logo?.url,
          }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={24} md={24}>
              <Form.Item
                label="Company Name"
                name="name"
                rules={[
                  
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

            <Col xs={24} sm={24} md={24} lg={24}>
              <Form.Item
                name="upload"
                label="Upload Profile Image"
                valuePropName="filelist"
                getValueFromEvent={normFile}
                style={{ position: "relative" }}
              >
                <div className={styles["upload-file"]}>
                  <div>
                    {fileData?.url ?
                      <img src={fileData?.url} width='180px' height='150px' alt='Company Logo'
                      />
                      :
                      <div>N/A</div>
                    }
                  </div>
                  <div className={styles["browse-file"]}>
                    <Upload {...props}><Button
                      type="default"
                      >
                      Change Logo
                    </Button> </Upload>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
          <br />
          <br />
          <br />
          <Row justify="end" className={styles['edit']}>
            <Col>
              <Form.Item>
                <Space size={"large"}>
                  <Button type="default" htmlType="button" onClick={() => navigate(routes.companySetting.path(authData?.company?.code ?? '',params?.eid ?? ''))}>
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
  );
};

export default EditCompanySetting;
