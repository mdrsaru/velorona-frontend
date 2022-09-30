import { Card, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import {  CurrencyPagingResult, QueryCurrencyArgs } from "../../../interfaces/generated";

import CurrencyForm from '../CurrencyForm';
import { CURRENCY } from "..";

import styles from "../style.module.scss";

const EditCurrency = () => {
  let params = useParams();
  const navigate = useNavigate();

  const { data: currencyData } = useQuery<
    GraphQLResponse<'Currency', CurrencyPagingResult>,
    QueryCurrencyArgs
  >(CURRENCY, {
    variables: {
      input: {
        query: {
          id: params.id,
        },
      },
    },
  });

  const currency = currencyData?.Currency?.data?.[0];

  return (
    <div className={styles["currency-main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles["form-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Edit Currency
            </h1>
          </Col>
        </Row>

        {currency && (
          <CurrencyForm currency={currency} />
        )}
      </Card>
    </div>
  );
};

export default EditCurrency;
