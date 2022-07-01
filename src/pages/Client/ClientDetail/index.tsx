import { Button, Card, Col, Row } from "antd";

import routes from "../../../config/routes";
import ArrowLeftOutlined from "@ant-design/icons/lib/icons/ArrowLeftOutlined";
import { useNavigate, useParams } from 'react-router';
import { Link } from "react-router-dom";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { useQuery } from "@apollo/client";
import { ClientPagingResult, QueryClientArgs } from "../../../interfaces/generated";
import { CLIENT } from "..";
import { authVar } from "../../../App/link";

import styles from "../../Employee/style.module.scss";

const ClientDetail = () => {
  const authData = authVar()

  const navigate = useNavigate();
  const params = useParams();

  const { data: client } = useQuery<
    GraphQLResponse<'Client', ClientPagingResult>,
    QueryClientArgs
  >
    (CLIENT, {
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id as string,
            id: params?.cid
          }
        }
      }
    })

  const clientData = client?.Client?.data?.[0];
  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles["employee-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp;
              {clientData?.name}
            </h1>
          </Col>
        </Row>
        <br />

        <Row className={styles["detail-row"]}>
          <Col xs={24} sm={24} md={12} lg={12}>
            <div>
              <div>Email</div>
              <span className={styles.detailValue}>
                {clientData?.email ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <div>
              <div>Invoicing Email</div>
              <span className={styles.detailValue}>
                {clientData?.invoicingEmail ?? "N/A"}
              </span>
            </div>
          </Col>
         
          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>Country</div>
              <span className={styles.detailValue}>
                {clientData?.address?.country ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>State</div>
              <span className={styles.detailValue}>
                {clientData?.address?.state ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>City</div>
              <span className={styles.detailValue}>
                {clientData?.address?.city ?? "N/A"}
              </span>
            </div>
          </Col>

          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>Street Address</div>
              <span className={styles.detailValue}>
                {clientData?.address?.streetAddress ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>Apartment/Suite</div>
              <span className={styles.detailValue}>
                {clientData?.address?.aptOrSuite ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={8}>
            <div>
              <div>Zip Code</div>
              <span className={styles.detailValue}>
                {clientData?.address?.zipcode ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>
            <div>
              <div>Phone Number</div>
              <span className={styles.detailValue}>
                {clientData?.phone ?? "N/A"}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={24} md={12} lg={12}>

            <div>
              <div>Status</div>
              <span className={styles.detailValue}>
                {clientData?.status}
              </span>
            </div>

          </Col>

        </Row>

        <Row justify="end" className={styles["footer-btn"]}>
          <Col>
            <Button type="primary" style={{ marginRight: '1rem' }}>
              <Link to={routes.client.path(params?.eid ?? "1")}>
                Exit
              </Link>
            </Button>
          </Col>
          <Col>

          </Col>
        </Row>
      </Card>

    </div>
  );
};
export default ClientDetail;
