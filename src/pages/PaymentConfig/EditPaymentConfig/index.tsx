import { Card, Col, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";

import { GraphQLResponse } from "../../../interfaces/graphql.interface";


import styles from "../style.module.scss";
import PaymentConfigForm from '../PaymentConfigForm/index';
import { INVOICE_PAYMENT_CONFIG } from "..";
import { InvoicePaymentConfigPagingResult, QueryInvoicePaymentConfigArgs } from "../../../interfaces/generated";

const EditPaymentConfig = () => {
  let params = useParams();
  const navigate = useNavigate();

  const { data: invoicePaymentConfigData } = useQuery<
    GraphQLResponse<'InvoicePaymentConfig', InvoicePaymentConfigPagingResult>,
    QueryInvoicePaymentConfigArgs
  >(INVOICE_PAYMENT_CONFIG, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
						query: {
							id: params.id,
						},
        paging: {
          order: ['createdAt:DESC'],
        },
      },
    },
  });

  const paymentConfigData = invoicePaymentConfigData?.InvoicePaymentConfig?.data?.[0];

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

        {paymentConfigData && (
          <PaymentConfigForm invoicePaymentConfig={paymentConfigData} />
        )}
      </Card>
    </div>
  );
};

export default EditPaymentConfig;
