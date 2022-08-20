import { useLazyQuery } from '@apollo/client';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, Card, Typography } from 'antd';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { SubscriptionPaymentPagingResult, QuerySubscriptionPaymentArgs } from '../../../interfaces/generated';

import PageHeader from '../../../components/PageHeader';
import { SUBSCRIPTION_PAYMENT } from '../../Payment';
import { downloadCSV } from '../../../utils/common';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  {
    label: 'Company',
    key: 'company',
  },
  {
    label: 'Date of Payment',
    key: 'paymentDate',
  },
  {
    label: 'Payment Amount',
    key: 'amount',
  },
  {
    label: 'Status',
    key: 'status',
  },
];

const PaymentReport = () => {
  const [fetchDownloadData, { data: DownloadPaymentData }] = useLazyQuery<
    GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>,
    QuerySubscriptionPaymentArgs
  >(SUBSCRIPTION_PAYMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['paymentDate:DESC'],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(DownloadPaymentData?.SubscriptionPayment?.data, csvHeader, 'Company.csv');
    },
  });

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {},
          paging: {
            order: ['updatedAt:DESC'],
          },
        },
      },
    });
  };
  return (
    <div style={{ paddingTop: '2rem' }}>
      <Card bordered={false}>
        <PageHeader title='Payments' />
        {DownloadPaymentData && DownloadPaymentData?.SubscriptionPayment?.data?.length > 1 ? (
          <Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
            Download
          </Button>
        ) : (
          <Typography.Text type='secondary'>No files to Download</Typography.Text>
        )}
      </Card>
    </div>
  );
};

export default PaymentReport;
