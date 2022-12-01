import moment from 'moment';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Button, Card, Col, DatePicker, Form, Input, PageHeader, Row, Select, Table } from 'antd';
import {SearchOutlined} from "@ant-design/icons"

import constants, { payment_status } from '../../config/constants';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { SubscriptionPaymentPagingResult, QuerySubscriptionPaymentArgs, Company, SubscriptionPaymentQuery } from '../../interfaces/generated';

import filterImg from '../../assets/images/filter.svg';

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

const { RangePicker } = DatePicker;
const { Option } = Select;

const Payment = () => {
  const [filterForm] = Form.useForm();

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

  const refetchPayments = () => {
    const values = filterForm.getFieldsValue(['date', 'status', 'search']);
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

  const columns = [
    {
      title: 'S.N',
      render: (_: any, __: any, index: number) => {
        return (data?.SubscriptionPayment?.paging?.startIndex ?? 0) + index + 1;
      }
    },
    {
      title: 'Company',
      dataIndex: 'company',
      render: (company: Company) => {
        return company.name;
      }
    },
    {
      title: 'Date of Payment',
      dataIndex: 'paymentDate',
      render: (date: string) => {
        return moment(date).format('MM/DD/YYYY');
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

  const onChangeFilter = () => {
    refetchPayments();
  };

  return (
    <div style={{ paddingTop: '2rem' }}>
      <Card bordered={false}>
        <PageHeader
          title="Payments"
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
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='date'>
                  <RangePicker onChange={onChangeFilter} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        <div className='container-row'>
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
        </div>
      </Card>
    </div>
  );
};

export default Payment;
