import moment from 'moment';
import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Table } from 'antd';

import { authVar } from '../../../App/link';
import constants from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { SubscriptionPaymentPagingResult, QuerySubscriptionPaymentArgs } from '../../../interfaces/generated';


const SUBSCRIPTION_PAYMENT = gql`
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
        invoiceLink
        receiptLink
        periodStartDate
        periodEndDate
        invoiceId  
      }
    }
  }
`;

const InvoiceAndPayment = () => {
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const loggedInUser = authVar();
  const company_id = loggedInUser?.company?.id as string;

  const { data, loading } = useQuery<
    GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>,
    QuerySubscriptionPaymentArgs
  >(SUBSCRIPTION_PAYMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id,
        },
        paging: {
          skip: pagingInput.skip,
          take: constants.paging.perPage,
          order: ['paymentDate:ASC'],
        },
      }
    }
  });

  const columns = [
    {
      title: 'S.N',
      render: (_: any, __: any, index: number) => {
        return (data?.SubscriptionPayment?.paging?.startIndex ?? 0) + index + 1;
      }
    },
    {
      title: 'Date of Payment',
      dataIndex: 'paymentDate',
      render: (date: string) => {
        return (
          <>{date ? moment(date).format('MM/DD/YYYY'): 'N/A'}</>
        )
      }
    },
    {
      title: 'Payment Amount',
      dataIndex: 'amount',
      render: (amount: number) => {
        return `$${amount}`
      }
    },
    {
      title: 'Period Start Date',
      dataIndex: 'periodStartDate',
      render: (date: string) => {
        return (
          <>{date ? moment(date).format('MM/DD/YYYY'): 'N/A'}</>
        )
      }
    },
    {
      title: 'Period End Date',
      dataIndex: 'periodEndDate',
      render: (date: string) => {
        return (
          <>{date ? moment(date).format('MM/DD/YYYY'): 'N/A'}</>
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Invoice',
      render: (data: any, __: any, index: number) => {
        return (
          data?.invoiceLink ?
            <a href={data?.invoiceLink} target='_blank'>{`Invoice${index + 1}`}</a>
            :
            'N/A'
        )
      }
    },
    {
      title:'Receipt',
      render: (data: any, __: any, index: number) => {
        return (
          data?.receiptLink ?
            <a href={data?.receiptLink} target='_blank'>{`Receipt${index+1}`}</a>
            :
            'N/A'
        )
      }
    }
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
    <Table
      loading={loading}
      dataSource={data?.SubscriptionPayment?.data}
      columns={columns}
      rowKey={((record: any) => record.id)}
      pagination={{
        current: pagingInput.currentPage,
        onChange: changePage,
        total: data?.SubscriptionPayment?.paging?.total,
        pageSize: constants.paging.perPage,
      }}
    />
  )
}

export default InvoiceAndPayment;
