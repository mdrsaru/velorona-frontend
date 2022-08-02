import { useState } from "react";
import {  useQuery } from "@apollo/client";
import { useNavigate } from 'react-router';
import { Button, Card, Col, Form, Row, Space } from "antd"

import {  CompanyPagingResult, QueryCompanyArgs } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { COMPANY } from "../Company";
import { authVar } from '../../App/link';

import routes from "../../config/routes";

import styles from './styles.module.scss'

const CompanySetting = () => {
  const navigate = useNavigate()
  const [fileData, setFile] = useState({
    id: "",
    name: "",
    url: "",
  });

  const authData = authVar()

  const { data: companyData } = useQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY, {
    variables: {
      input: {
        query: {
          id: authData?.company?.id ?? "",
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

  const company = companyData?.Company?.data?.[0];
  return (
    <>
      <Card className={styles['container']}>
        <p className={styles['heading']}>General Settings </p>
        <Row>
          <Col span={8} className={styles['title']}>
            Company Name
          </Col>
          <Col span={12} className={styles['value']}>
            <p> {company?.name} </p>
          </Col>
        </Row>
        <Row>
          <Col span={8} className={styles['title']}>
            Company logo
          </Col>
          <Col span={12} >
            {fileData?.url ?
              <img src={fileData?.url} width='150px' height='150px' alt='Company Logo' />
              :
              <div className={styles['value']}>N/A</div>
              }
          </Col>
        </Row>
        <Row justify="end" className={styles['edit']}>
          <Col>
            <Form.Item>
              <Space size={"large"}>
                <Button type="primary" htmlType="submit" onClick={() => navigate(routes.editCompanySetting.path(authData?.company?.code ?? '',authData?.company?.id ?? ''))}>
                  Edit Settings
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </>
  )
}

export default CompanySetting