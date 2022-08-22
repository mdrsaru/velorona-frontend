import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { DownloadOutlined } from '@ant-design/icons';
import { Card, Row, Col, Form, Select, Button, Typography } from 'antd';

import { company_status } from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { CompanyPagingResult, QueryCompanyArgs } from '../../../interfaces/generated';
import { downloadCSV } from '../../../utils/common';
import { COMPANY } from '../../Company';
import PageHeader from '../../../components/PageHeader';

import filterImg from '../../../assets/images/filter.svg';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  { label: 'Company Name', key: 'name' },
  { label: 'Status', key: 'status' },
  { label: 'Created At', key: 'createdAt' },
];

const { Option } = Select;
const CompanyReport = () => {
  const [filterForm] = Form.useForm();

  const {
    data: companyData,
    loading: dataLoading,
    refetch: refetchCompany,
  } = useQuery<GraphQLResponse<'Company', CompanyPagingResult>, QueryCompanyArgs>(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
  });

  const [fetchDownloadData, { data: companyDownloadData }] = useLazyQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {},
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(companyDownloadData?.Company?.data, csvHeader, 'Company.csv');
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

  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const refetchCompanies = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status']);

    let input: {
      paging?: any;
      query: any;
    } = {
      paging: {
        order: ['updatedAt:DESC'],
      },

      query: {},
    };

    let query: {
      status?: string;
      search?: boolean;
    } = {};

    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search;
    }

    input['query'] = query;

    refetchCompany({
      input: input,
    });
  };

  const onChangeFilter = () => {
    refetchCompanies();
  };

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchCompany({
        input: {
          paging: {
            order: ['updatedAt:DESC'],
          },
          query: {},
        },
      });
    }
    filterForm.resetFields();
    setFilterProperty({
      filter: !filterProperty?.filter,
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
          title='Company Report'
          extra={[
            <Button type='text' key='btn-filter' onClick={openFilterRow} icon={<img src={filterImg} alt='filter' />}>
              &nbsp; &nbsp;
              {filterProperty?.filter ? 'Reset' : 'Filter'}
            </Button>,
          ]}
        />
        <Form form={filterForm} layout='vertical' onFinish={() => {}} autoComplete='off' name='filter-form'>
          {filterProperty?.filter && (
            <Row gutter={[20, 20]}>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='status' label=''>
                  <Select placeholder='Select status' onChange={onChangeFilter}>
                    {company_status?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          )}
        </Form>
        {companyData && companyData?.Company?.data?.length > 1 ? (
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

export default CompanyReport;
