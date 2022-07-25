import React, { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Card, Col, Form, Input, message, Row, Table } from 'antd';

import constants from '../../config/constants';
import { notifyGraphqlError } from '../../utils/error';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import {
  QueryInvoicePaymentConfigArgs,
  InvoicePaymentConfigPagingResult,
  MutationInvoicePaymentConfigCreateArgs,
} from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader';

import styles from './style.module.scss';

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
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader
          title="Invoice Payment"
          extra={[
            <div>
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
