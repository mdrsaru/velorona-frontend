import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Card, Col, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import PageHeader from '../../../components/PageHeader';
import { PROJECT } from '../../Project';
import { archived, status } from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { ProjectPagingResult, QueryProjectArgs } from '../../../interfaces/generated';

import filterImg from '../../../assets/images/filter.svg';
import { notifyGraphqlError } from '../../../utils/error';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
  { label: 'Project Name', key: 'name' },
  { label: 'Client', key: 'client', subKey: 'name' },
  { label: 'Client Email', key: 'client', subKey: 'email' },
  { label: 'Status', key: 'status' },
  { label: 'Company', key: 'company', subKey: 'name' },
];

const { Option } = Select;

const ProjectReport = () => {
  const loggedInUser = authVar();
  const [filterForm] = Form.useForm();
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const { data: projectData, refetch: refetchProject } = useQuery<
    GraphQLResponse<'Project', ProjectPagingResult>,
    QueryProjectArgs
  >(PROJECT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id ?? '',
        },
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
  });

  const [fetchDownloadData] = useLazyQuery<
    GraphQLResponse<'Project', ProjectPagingResult>,
    QueryProjectArgs
  >(PROJECT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id ?? '',
        },
        paging: {
          order: ['updatedAt:DESC'],
        },
      },
    },
   onError:notifyGraphqlError
  });

  const downloadReport = () => {
    let values = filterForm.getFieldsValue(['role', 'status', 'archived']);

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

    let query: {
      status?: string;
      archived?: boolean;
      search?: boolean;
      company_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string,
    };

    if (values.status === 'Active' || values.status === 'Inactive') {
      query['status'] = values.status;
    }
    if (values.archived) query['archived'] = values.archived;
    if (values.search) query['search'] = values?.search;

    input['query'] = query;
    fetchDownloadData({
      variables: {
        input:input
      },
    })
    .then((response) => {
      downloadCSV(response?.data?.Project?.data, csvHeader, 'Projects.csv');
    })
  };

  const refetchProjects = () => {
    let values = filterForm.getFieldsValue(['role', 'status', 'archived']);

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

    let query: {
      status?: string;
      archived?: boolean;
      search?: boolean;
      company_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string,
    };

    if (values.status === 'Active' || values.status === 'Inactive') {
      query['status'] = values.status;
    }
    if (values.archived) query['archived'] = values.archived;
    if (values.search) query['search'] = values?.search;

    input['query'] = query;
    refetchProject({ input: input });
  };

  const onChangeFilter = () => {
    refetchProjects();
  };

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchProject({
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
          title='Projects Report'
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
                <Form.Item name='status' label=''>
                  <Select placeholder='Select status' onChange={onChangeFilter}>
                    {status?.map((status: any) => (
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name='archived' label=''>
                  <Select placeholder='Archive Status' onChange={onChangeFilter}>
                    {archived?.map((status: any) => (
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
        <Row>
          <Col span={24}>
            {!!projectData?.Project?.data?.length ? (
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

export default ProjectReport;
