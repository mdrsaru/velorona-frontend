import moment from 'moment';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Card, Table } from 'antd';

import constants from '../../config/constants';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { SubscriptionPaymentPagingResult, QuerySubscriptionPaymentArgs, Company } from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader';

export const SUBSCRIPTION_PAYMENT = gql`
  query SubscriptionPayment($input: SubscriptionPaymentQueryInput!) {
    SubscriptionPayment(input: $input) {
      paging {
        total
        startIndex
      }
      data {
        id
        amount
        paymentDate
        status
        company {
          name
        }
      }
    }
  }
`;

const Payment = () => {
  const [pagingInput, setPagingInput] = useState<{
    skip: number;
    currentPage: number;
  }>({
    skip: 0,
    currentPage: 1,
  });

  const { data, loading } = useQuery<
    GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>,
    QuerySubscriptionPaymentArgs
  >(SUBSCRIPTION_PAYMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          skip: pagingInput.skip,
          take: constants.paging.perPage,
          order: ['paymentDate:DESC'],
        },
      },
    },
  });

  const columns = [
    {
      title: 'S.N',
      render: (_: any, __: any, index: number) => {
        return (data?.SubscriptionPayment?.paging?.startIndex ?? 0) + index + 1;
      },
    },
    {
      title: 'Company',
      dataIndex: 'company',
      render: (company: Company) => {
        return company.name;
      },
    },
    {
      title: 'Date of Payment',
      dataIndex: 'paymentDate',
      render: (date: string) => {
        return moment(date).format('MM/DD/YYYY');
      },
    },
    {
      title: 'Payment Amount',
      dataIndex: 'amount',
      render: (amount: number) => {
        return `$${amount}`;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
  ];

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      <Card bordered={false}>
        <PageHeader title='Payments' />

        <Table
          loading={loading}
          dataSource={data?.SubscriptionPayment?.data}
          columns={columns}
          rowKey={(record: any) => record.id}
          pagination={{
            current: pagingInput.currentPage,
            onChange: changePage,
            total: data?.SubscriptionPayment?.paging?.total,
            pageSize: constants.paging.perPage,
          }}
        />
      </Card>
    </div>
  );
};

export default Payment;
