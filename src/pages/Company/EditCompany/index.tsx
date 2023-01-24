import {
  Card,
  Col,
  Row,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { CompanyPagingResult, QueryCompanyArgs } from "../../../interfaces/generated";

import CompanyForm from '../CompanyForm';

export const COMPANY = gql`
  query Company($input: CompanyQueryInput) {
    Company(input: $input) {
      data {
        id
        name
        status
        adminEmail
        companyCode
        logo {
          id
          url
          name
        }
        admin {
          id
          email
          firstName
          middleName
          lastName
          phone
          address_id
          address {
            country
            city
            streetAddress
            zipcode
            state
            aptOrSuite
          }
        }
      }
    }
  }
`;

const EditCompany = () => {
  let params = useParams();
  const navigate = useNavigate();

  const { data: companyData } = useQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY, {
    variables: {
      input: {
        query: {
          id: params.id,
        },
      },
    },
  });

  const company = companyData?.Company?.data?.[0];

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

        {company && (
          <CompanyForm company={company} />
        )}
      </Card>
    </div>
  );
};

export default EditCompany;
