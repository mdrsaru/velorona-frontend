import { useState } from 'react';
import { useQuery, gql, useMutation } from '@apollo/client';
import { Card, Table, Select } from 'antd';

import constants from '../../config/constants';
import { notifyGraphqlError } from '../../utils/error';
import { _cs } from '../../utils/common';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import {
  DemoRequest as IDemoRequest,
  DemoRequestPagingResult,
  QueryDemoRequestArgs,
  DemoRequestStatus,
  MutationDemoRequestUpdateArgs,
} from '../../interfaces/generated';

import PageHeader from '../../components/PageHeader'

import styles from './style.module.scss';

export const DEMO_REQUEST = gql`
  query DemoRequest($input: DemoRequestQueryInput) {
    DemoRequest(input: $input) {
      paging {
        total
      }
      data {
        id
        fullName
        email
        phone
        status
      }
    }
  }
`;

export const DEMO_REQUEST_UPDATE = gql`
  mutation DemoRequestUpdate($input: DemoRequestUpdateInput!) {
    DemoRequestUpdate(input: $input) {
      id
      status
    }
  }
`;

const DemoRequest = () => {
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const { data: demoRequestData, loading: demoRequestLoading } = useQuery<
    GraphQLResponse<'DemoRequest', DemoRequestPagingResult>,
    QueryDemoRequestArgs
  >(DEMO_REQUEST, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only'
  });

  const [updateDemoRequest, { loading: updatingStatus }] = useMutation<
    GraphQLResponse<'DemoRequestCreate', IDemoRequest>,
    MutationDemoRequestUpdateArgs
  >(DEMO_REQUEST_UPDATE, {
    onError: notifyGraphqlError,
  });
  
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const onStatusChange = (id: string, status: DemoRequestStatus) => {
    updateDemoRequest({
      variables: {
        input: {
          id,
          status,
        }
      }
    });
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone number',
      dataIndex: 'phone',
      render: (phone: string) => phone ?? 'N/A',
    },
    {
      title: 'Job Title',
      dataIndex: 'jobTitle',
      render: (job: string) => job ?? 'N/A',
    },
    {
      title: 'Status',
      render: (demoRequest: IDemoRequest) => (
        <Select 
          value={demoRequest.status} 
          className={_cs([styles[demoRequest.status], styles.status])}
          onChange={(value) => onStatusChange(demoRequest.id, value)}
        >
          <Select.Option value={DemoRequestStatus.Approved}>{DemoRequestStatus.Approved}</Select.Option>
          <Select.Option value={DemoRequestStatus.Pending}>{DemoRequestStatus.Pending}</Select.Option>
          <Select.Option value={DemoRequestStatus.Rejected}>{DemoRequestStatus.Rejected}</Select.Option>
        </Select>
      )
    },
  ];

  return (
    <div style={{ paddingTop: '2rem' }}>
      <Card bordered={false}>
        <PageHeader title="Demo request" />

        <Table
          loading={demoRequestLoading || updatingStatus}
          dataSource={demoRequestData?.DemoRequest?.data}
          columns={columns}
          rowKey={(record => record?.id)}
          pagination={{
            current: pagingInput.currentPage,
              onChange: changePage,
              total: demoRequestData?.DemoRequest?.paging?.total,
              pageSize: constants.paging.perPage
          }}
        />
      </Card>
    </div>
  )
}

export default DemoRequest;
