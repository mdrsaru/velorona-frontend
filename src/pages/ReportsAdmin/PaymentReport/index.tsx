import { useState } from 'react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Input, Row, Select, Typography } from 'antd';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import {
  SubscriptionPaymentPagingResult,
  QuerySubscriptionPaymentArgs,
  InvoiceQuery,
  SubscriptionPaymentQuery,
} from '../../../interfaces/generated';
import PageHeader from '../../../components/PageHeader';
import { SUBSCRIPTION_PAYMENT } from '../../Payment';
import { downloadCSV } from '../../../utils/common';
import constants, { payment_status } from '../../../config/constants';
import { authVar } from '../../../App/link';

import filterImg from '../../../assets/images/filter.svg';

const { RangePicker } = DatePicker;
const { Option } = Select;
const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  {
    label: 'Company',
    key: 'company',
    subKey: 'name',
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
  const [filterForm] = Form.useForm();
  const loggedInUser = authVar();
  const [filterPayment, setFilterPayment] = useState<any>({
    filter: false,
  });
  const [pagingInput, setPagingInput] = useState<{
    skip: number;
    currentPage: number;
  }>({
    skip: 0,
    currentPage: 1,
  });

  const {
    data,
    loading,
    refetch: refetchPayment,
  } = useQuery<GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>, QuerySubscriptionPaymentArgs>(
    SUBSCRIPTION_PAYMENT,
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      variables: {
        input: {
          paging: {
            skip: pagingInput.skip,
            take: constants.paging.perPage,
            order: ['paymentDate:DESC'],
          },
          query: {},
        },
      },
    }
  );
  const [fetchDownloadData, { data: DownloadPaymentData }] = useLazyQuery<
    GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>,
    QuerySubscriptionPaymentArgs
  >(SUBSCRIPTION_PAYMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {},
        paging: {
          order: ['paymentDate:DESC'],
        },
      },
    },
    onCompleted: () => {
      // console.log(DownloadPaymentData);
      downloadCSV(DownloadPaymentData?.SubscriptionPayment?.data, csvHeader, 'Payment.csv');
    },
  });

  const refetchPayments = () => {
    const values = filterForm.getFieldsValue(['date', 'status', 'search']);
    console.log(values);
    let input: {
      paging?: any;
      query?: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },
      query: {},
    };

    let query: SubscriptionPaymentQuery = {};

    if (values.search) query['search'] = values?.search;
    if (values.status) query['status'] = values?.status;

    if (values.date) {
      query['startDate'] = values?.date[0];
      query['endDate'] = values?.date[1];
    }

    input['query'] = query;
    refetchPayment({
      input: input,
    });
  };
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
  const openFilterRow = () => {
    if (filterPayment?.filter) {
      refetchPayment({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
        },
      });
    }
    filterForm.resetFields();
    setFilterPayment({
      filter: !filterPayment?.filter,
    });
  };
  const onChangeFilter = () => {
    refetchPayments();
  };
  return (
    <div style={{ paddingTop: '2rem' }}>
      <Card>
        <PageHeader
          title='Payments'
          extra={[
            <Button key='btn-filter' type='text' onClick={openFilterRow} icon={<img src={filterImg} alt='filter' />}>
              &nbsp; &nbsp;
              {filterPayment?.filter ? 'Reset' : 'Filter'}
            </Button>,
          ]}
        />
        <Form form={filterForm} layout='vertical' onFinish={() => {}} autoComplete='off' name='filter-form'>
          {filterPayment && filterPayment?.filter && (
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='search'>
                  <Input
                    prefix={<SearchOutlined className='site-form-item-icon' />}
                    placeholder='Search by Company Name'
                    onChange={onChangeFilter}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='status'>
                  <Select placeholder='Select Status' onChange={onChangeFilter}>
                    {payment_status.map((item) => (
                      <Option value={item.value} key={item.name}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} xl={5}>
                <Form.Item name='date'>
                  <RangePicker onChange={onChangeFilter} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        {data && data?.SubscriptionPayment?.data?.length >= 1 ? (
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
