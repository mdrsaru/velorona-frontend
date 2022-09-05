import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Card, Col, Form, Select, Button, Row, Typography, DatePicker, Input } from 'antd';
import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';

import { InvoiceQueryInput, InvoicePagingResult, QueryInvoiceArgs, InvoiceQuery } from '../../../interfaces/generated';
import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import PageHeader from '../../../components/PageHeader';
import constants, { invoice_status } from '../../../config/constants';
import { INVOICE } from '../../Invoice';

import filterImg from '../../../assets/images/filter.svg';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  {
    label: 'Client Name',
    key: 'client',
    subKey: 'name',
  },
  {
    label: 'Email',
    key: 'client',
    subKey: 'invoicingEmail',
  },
  {
    label: 'Issued Date',
    key: 'issueDate',
  },
  {
    label: 'Amount',
    key: 'totalAmount',
  },
  {
    label: 'Status',
    key: 'status',
  },
];

const { RangePicker } = DatePicker;

const { Option } = Select;

const InvoiceReport = () => {
  const loggedInUser = authVar();

  const [filterForm] = Form.useForm();

  const [pagingInput, setPagingInput] = useState<{
    skip: number;
    currentPage: number;
  }>({
    skip: 0,
    currentPage: 1,
  });

  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const input: InvoiceQueryInput = {
    paging: {
      skip: pagingInput.skip,
      take: constants.paging.perPage,
      order: ['issueDate:ASC'],
    },
    query: {
      company_id: loggedInUser?.company?.id as string,
    },
  };

  const {
    data: invoiceData,
    loading,
    refetch: refetchInvoice,
  } = useQuery<GraphQLResponse<'Invoice', InvoicePagingResult>, QueryInvoiceArgs>(INVOICE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input,
    },
  });

  const [fetchDownloadData, { data: invoiceDownloadData }] = useLazyQuery<
    GraphQLResponse<'Invoice', InvoicePagingResult>,
    QueryInvoiceArgs
  >(INVOICE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input,
    },
    onCompleted: () => {
      downloadCSV(invoiceDownloadData?.Invoice?.data, csvHeader, 'Invoice.csv');
    },
  });

  const refetchInvoices = () => {
    let values = filterForm.getFieldsValue(['date', 'status', 'search']);

    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },

      query: {
        company_id: loggedInUser?.company?.id,
      },
    };

    let query: InvoiceQuery = {
      company_id: loggedInUser?.company?.id as string,
    };

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.date) {
      query['startDate'] = values?.date[0];
      query['endDate'] = values?.date[1];
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    input['query'] = query;

    refetchInvoice({
      input: input,
    });
  };

  const onChangeFilter = () => {
    refetchInvoices();
  };

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchInvoice({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
          query: {
            company_id: loggedInUser?.company?.id as string,
          },
        },
      });
    }
    filterForm.resetFields();
    setFilterProperty({
      filter: !filterProperty?.filter,
    });
  };

  const downloadReport = () => {
    let values = filterForm.getFieldsValue(['date', 'status', 'search']);

    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },

      query: {
        company_id: loggedInUser?.company?.id,
      },
    };

    let query: InvoiceQuery = {
      company_id: loggedInUser?.company?.id as string,
    };

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.date) {
      query['startDate'] = values?.date[0];
      query['endDate'] = values?.date[1];
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    input['query'] = query;
    fetchDownloadData({
      variables: {
        input: input
      },
    });
  };

  const debouncedResults = debounce(() => {
    onChangeFilter();
  }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  return (
    <div>
      <Card bordered={false}>
        <PageHeader
          title='Invoice Report'
          extra={[
            <Button key='btn-filter' type='text' onClick={openFilterRow} icon={<img src={filterImg} alt='filter' />}>
              &nbsp; &nbsp;
              {filterProperty?.filter ? 'Reset' : 'Filter'}
            </Button>,
          ]}
        />
        <Form form={filterForm} layout='vertical' onFinish={() => {}} autoComplete='off' name='filter-form'>
          {filterProperty?.filter && (
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='search' label=''>
                  <Input
                    prefix={<SearchOutlined className='site-form-item-icon' />}
                    placeholder='Search by Client name or email'
                    onChange={debouncedResults}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='status' label=''>
                  <Select placeholder='Select status' onChange={onChangeFilter}>
                    {invoice_status?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='date' label=''>
                  <RangePicker size='large' onChange={onChangeFilter} />
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>

        <Row>
          <Col span={24}>
            {!!invoiceData?.Invoice?.data?.length ? (
              <Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
                Download Report
              </Button>
            ) : (
              <Typography.Text type='secondary'>No files to Download</Typography.Text>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default InvoiceReport;
