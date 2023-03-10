
import { gql,  useQuery } from '@apollo/client';
import { Card, Col, Row, Table } from 'antd';
import {FormOutlined } from "@ant-design/icons"

import { GraphQLResponse } from '../../interfaces/graphql.interface';
import {
  QueryInvoicePaymentConfigArgs,
  InvoicePaymentConfigPagingResult,
} from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader';

import styles from './style.module.scss';
import routes from '../../config/routes';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

export const INVOICE_PAYMENT_CONFIG = gql`
  query InvoicePaymentConfig($input: InvoicePaymentConfigQueryInput!) {
    InvoicePaymentConfig(input: $input) {
      data {
        id
        name
        days
      }
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }
    }
  }
`;

const InvoicePaymentConfig = () => {
  const navigate = useNavigate()
  
  const { data: paymentConfigData, loading: paymnentConfigLoading } = useQuery<
    GraphQLResponse<'InvoicePaymentConfig', InvoicePaymentConfigPagingResult>,
    QueryInvoicePaymentConfigArgs
  >(INVOICE_PAYMENT_CONFIG, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['createdAt:DESC'],
        },
      },
    },
  });

  const columns = [
    {
      title: 'S.N',
      render: (_: any, __: any, index: number) => {
        return `${index + 1}`
      }
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Days',
      dataIndex: 'days',
      key: 'days',
    },
    {
			title: 'Actions',
			key: 'actions',
			render: (data: any) =>
				<Row style={{ marginTop: '11px' }}>
					<Col>
					<div
					onClick={() => navigate(routes.editInvoicePaymentConfig.path(data?.id ?? '1'))}>
					<FormOutlined/>
				</div>

					</Col>
					</Row>
		}
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader
          title="Invoice Payment"
          extra={[
            <div className={styles['add-new-currency']} key="new-currency">
            <Link to={routes.addInvoicePaymentConfig.path}>
              Add Invoice Payment
            </Link>
          </div>
          ]}
        />

        <Row>
          <Col span={24}>
            <Table
              dataSource={paymentConfigData?.InvoicePaymentConfig?.data}
              loading={paymnentConfigLoading}
              columns={columns}
              rowKey={(record) => record?.id}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InvoicePaymentConfig;
