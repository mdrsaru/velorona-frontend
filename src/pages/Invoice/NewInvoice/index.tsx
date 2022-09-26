import React, { useState } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { Card, message, Spin, Radio } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { RadioChangeEvent } from 'antd/es/radio';

import { round } from '../../../utils/common';
import { authVar } from '../../../App/link';
import { notifyGraphqlError } from '../../../utils/error';
import { GraphQLResponse, IInvoiceInput } from '../../../interfaces/graphql.interface';
import {
  Client,
  ClientPagingResult,
  QueryClientArgs,
  QueryUserArgs,
  UserPagingResult,
  RoleName,
  ProjectItem,
  QueryProjectItemsArgs,
} from '../../../interfaces/generated';
import { MayBe } from '../../../interfaces/common.interface';

import PageHeader from '../../../components/PageHeader';
import Label from '../../../components/Label';
import InvoiceForm from '../../../components/InvoiceForm';
import CustomFilter from './CustomFilter';
import ClientSelection from './ClientSelection';
import InvoiceClientDetail from '../../../components/InvoiceClientDetail';

import styles from './style.module.scss';

const CLIENT_LIST = gql`
  query Client($input: ClientQueryInput!) {
    Client(input: $input) {
      data {
        id
        name
        email
        address {
          streetAddress
        }
      }
    }
  }
`;

const CLIENT = gql`
  query Client($id: String) {
    ClientById(id: $id) @client {
      id
      name
      email
      address {
        streetAddress
      }
    }
  }
`;

const EMPLOYEES = gql`
  query Employees($input: UserQueryInput!) {
    User(input: $input) {
      data {
        id
        email
        fullName
      }
    }
  }
`;

const PROJECT_ITEMS = gql`
  query ProjectItems($input: ProjectItemInput!) {
    ProjectItems(input: $input) {
      project_id
      totalExpense
      totalDuration
      totalHours
      hourlyRate
    }
  }
`;

const NewInvoice = (props: any) => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<MayBe<Client>>();
  const [confirmed, setConfirmed] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [needCustomFiltering, setNeedCustomFiltering] = useState<MayBe<boolean>>();
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [user_id, setUser_id] = useState<MayBe<string>>();
  const [startDate, setStartDate] = useState<MayBe<string>>();
  const [endDate, setEndDate] = useState<MayBe<string>>();
  const [invoiceInput, setInvoiceInput] = useState<MayBe<IInvoiceInput>>();

  const loggedInUser = authVar();
  const company_id = loggedInUser?.company?.id as string;

  const { 
    data: clientData,
    loading: clientLoading,
  } = useQuery<
    GraphQLResponse<'Client', ClientPagingResult>, 
    QueryClientArgs
  >(
    CLIENT_LIST, 
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      variables: {
        input: {
          query: {
            company_id,
          }
        }
      }
    }
  );

  const [fetchClient] = useLazyQuery<
    GraphQLResponse<'ClientById', Client>,
    { id: string }
  >(CLIENT, {
    fetchPolicy: 'cache-only',
  });

  const { data: employeeData, loading: employeeLoading } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(EMPLOYEES, {
    skip: !needCustomFiltering,
    fetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          role: RoleName.Employee,
        }
      }
    }
  })

  const [fetchProjectItems, { loading: itemsLoading }] = useLazyQuery<
    GraphQLResponse<'ProjectItems', ProjectItem[]>,
    QueryProjectItemsArgs
  >(PROJECT_ITEMS, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    onError: notifyGraphqlError,
    onCompleted(response) {
      if(response.ProjectItems) {
        let totalAmount = 0;
        let totalQuantity = 0;

        const items = (response?.ProjectItems ?? []).map((item) => {
          const quantity = item.totalHours;
          totalAmount += item.totalExpense;
          totalQuantity += quantity;

          return {
            project_id: item.project_id,
            description: '',
            quantity: round(quantity, 6),
            rate: item.hourlyRate,
            amount: item.totalExpense,
          }
        })

        totalAmount = round(totalAmount, 2);

        const invoice: IInvoiceInput = {
          issueDate: new Date(), 
          dueDate: new Date(),
          needProject: true,
          poNumber: '',
          totalAmount,
          subtotal: totalAmount,
          taxPercent: 0,
          taxAmount: 0,
          discount: 0,
          discountAmount: 0,
          notes: '',
          totalQuantity: round(totalQuantity, 2),
          shipping: 0,
          items,
        }

        setInvoiceInput(invoice);
        setIsFilterApplied(true);
        setShowForm(true);
      }
    }
  });

  const onClientChange= (value: string) => {
    fetchClient({
      variables: {
        id: value,
      },
    }).then((response) => {
      setSelectedClient(response?.data?.ClientById)
    });
  }

  const confirmCompany = () => {
    if(!selectedClient) {
      message.error('Please select client')
    }
    setConfirmed(true);
  }

  const removeFilterValues = () => {
    setUser_id(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    setInvoiceInput(undefined);
  }

  const removeSelectedCompany = () => {
    setConfirmed(false);
    setNeedCustomFiltering(false);
    setShowForm(false);
    setSelectedClient(undefined);
    removeFilterValues();
  }

  const onFilterChange = (e: RadioChangeEvent) => {
    const value = e.target.value;
    if(value === false) {
      setShowForm(true)
      removeFilterValues();
    } else {
      setShowForm(false);
    }

    setNeedCustomFiltering(value);
  }

  const onUserChange = (value: string) => {
    setUser_id(value);
  }

  const onDateRangeChange = (values: any) => {
    if(values?.length) {
      const start = values[0]?.format('YYYY-MM-DD');
      const end = values[1]?.format('YYYY-MM-DD');
      setStartDate(start)
      setEndDate(end)
    }
  }

  const applyFilter = () => {
    if(!startDate || !endDate || !user_id || !selectedClient) {
      return message.error('Please select all filter data.');
    }

    fetchProjectItems({
      variables: {
        input: {
          startTime: startDate ! + ' 00:00:00',
          endTime: endDate ! + ' 23:59:59',
          company_id,
          user_id: user_id!,
          client_id: selectedClient!.id,
        },
      },
    });
  }

  const cancelFilter = () => {
    setShowForm(false);
    setIsFilterApplied(false);
    setInvoiceInput(undefined);
  }

  if(clientLoading) {
    return null;
  }

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title={<><ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Add Invoice</>}
        />

        {
          confirmed ? (
            <InvoiceClientDetail
              needCloseCompany
              client={selectedClient as Client}
              removeCompany={removeSelectedCompany}
            />
          ) : (
            <ClientSelection
              disabled={!selectedClient}
              onClientChange={onClientChange}
              confirmCompany={confirmCompany}
              clients={clientData?.Client?.data ?? []}
            />
          )
        }

        <>
          {
            confirmed && (
              <div className={styles['date-employee-filter']}>
                <Label label="Add Employee and Date filter?" />

                <Radio.Group onChange={onFilterChange} value={needCustomFiltering} disabled={isFilterApplied}>
                  <Radio value={true}>Yes</Radio>
                  <Radio value={false}>No</Radio>
                </Radio.Group>
              </div>
            )
          }
        </>

        <>
          {
            needCustomFiltering && (
              <div className={styles['custom-filter']}>
                <CustomFilter
                  loading={itemsLoading}
                  employeeLoading={employeeLoading}
                  isFilterApplied={isFilterApplied}
                  employees={employeeData?.User?.data ?? []}
                  onUserChange={onUserChange}
                  onDateRangeChange={onDateRangeChange}
                  applyFilter={applyFilter}
                  cancelFilter={cancelFilter}
                />
              </div>
            )
          }
        </>

        <>
          {
            showForm && (
              <Spin spinning={itemsLoading}>
                <InvoiceForm 
                  startDate={startDate}
                  endDate={endDate}
                  user_id={user_id}
                  client_id={selectedClient?.id as string} 
                  invoice={invoiceInput}
                />
              </Spin>
            )
          }
        </>

      </Card>
    </div>
  )
}
export default NewInvoice
