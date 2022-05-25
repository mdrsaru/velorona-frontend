import React, { useState } from 'react';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { Button, Card, Select, message } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { authVar } from "../../../App/link";
import { Client, ClientQueryInput } from '../../../interfaces/generated';
import PageHeader from '../../../components/PageHeader';
import Label from '../../../components/Label';
import InvoiceForm from '../../../components/InvoiceForm';

import { MayBe } from '../../../interfaces/common.interface';
import { ClientPagingData } from '../../../interfaces/graphql.interface';

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

const NewInvoice = () => {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<MayBe<Client>>();
  const [confirmed, setConfirmed] = useState(false)
  const loggedInUser = authVar();

  const { 
    data: clientData,
    loading: clientLoading,
  } = useQuery<ClientPagingData, { input: ClientQueryInput }>(
    CLIENT_LIST, 
    {
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      variables: {
        input: {
          query: {
            company_id: loggedInUser?.company?.id as string,
          }
        }
      }
    }
  );

  const [fetchClient] = useLazyQuery<{ ClientById: Client }, { id: string }>(CLIENT, {
    fetchPolicy: 'cache-only',
  });

  const onCompanyChange = (value: string) => {
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

  const removeSelectedCompany = () => {
    setConfirmed(false);
    setSelectedClient(undefined);
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
            <div className={styles['client-detail']}>
              <div className={styles['details']}>
                <p>Client</p>
                <b>{selectedClient?.name ?? ''}</b>
                <p>
                  {selectedClient?.address?.streetAddress} <br />
                  {selectedClient?.email}
                </p>
              </div>

              <div onClick={removeSelectedCompany}>
                <div className={styles['close-icon']}><CloseCircleOutlined /></div>
              </div>
            </div>
          ) : (
            <div className={styles['client-selection-wrapper']}>
              <div className={styles['select-client']}>
                <Label label="Add Client" />
                <Select 
                  placeholder="Select client for invoice"
                  onChange={onCompanyChange}
                >
                  {
                    clientData?.Client?.data?.map((client) => (
                      <Select.Option key={client.id} value={client.id}>{client.name}</Select.Option>
                    ))
                  }
                </Select>
              </div>

              <div className={styles['confirm-client']}>
                <Button 
                  type="primary" 
                  disabled={!selectedClient}
                  onClick={confirmCompany}
                >
                  Confirm
                </Button>
              </div>
            </div>

          )

        }

        {
          confirmed && <InvoiceForm client_id={selectedClient?.id as string} />
        }

      </Card>
    </div>
  )
}
export default NewInvoice
