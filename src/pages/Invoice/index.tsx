import moment from 'moment';
import { useState } from 'react';
import { Card, Col, Dropdown, Menu, Row, Table, message } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { gql, useQuery, useMutation } from '@apollo/client';

import { authVar } from '../../App/link';
import { Link } from 'react-router-dom';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';
import PageHeader from '../../components/PageHeader';

import { Invoice as IInvoice, InvoiceQueryInput, InvoiceStatus, InvoiceUpdateInput } from '../../interfaces/generated';
import { InvoicePagingData } from '../../interfaces/graphql.interface';

import styles from './style.module.scss';

const INVOICE = gql`
  query Invoice($input: InvoiceQueryInput!) {
    Invoice(input: $input) {
      paging {
        total
      }
      data {
        id
        date
        totalAmount
        status
        invoiceNumber
        client {
          name
          invoicingEmail
        }
      }
    }
  }
`;

const INVOICE_STATUS_UPDATE = gql`
  mutation InvoiceUpdate($input: InvoiceUpdateInput!) {
    InvoiceUpdate(input: $input) {
      id
      status
    }
  }
`;

const Invoice = () => {
  const perPage = 2;
  const loggedInUser = authVar();
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const [updateStatus, { loading: updateLoading }] = useMutation<
    { 
      InvoiceUpdate: IInvoice 
    }, 
    { 
      input: InvoiceUpdateInput 
    }
  >(INVOICE_STATUS_UPDATE, {
    onCompleted(data) {
      if(data.InvoiceUpdate) {
        message.success({ content: 'Invoice status updated', key: 'updatable' })
      }
    },
    onError: notifyGraphqlError,
  });

  const input: InvoiceQueryInput = {
    paging: {
      skip: pagingInput.skip,
      take: perPage,
      order: ['date:DESC'],
    },
    query: {
      company_id: loggedInUser?.company?.id as string,
    },
  };

  const { data: invoiceData, loading } = useQuery<InvoicePagingData>(INVOICE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input,
    }
  });

  const changeStatus = (id: string, status: InvoiceStatus) => {
    updateStatus({
      variables: {
        input: {
          id,
          company_id: loggedInUser?.company?.id as string,
          status,
        }
      }
    })
  }

  const changePage = (page: number) => {
    const newSkip = (page - 1) * perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const dataSource = invoiceData?.Invoice?.data ?? [];

  const columns = [
    {
      title: 'Invoice Number',
      render: (invoice: IInvoice) => {
        let invoiceNumber = invoice.invoiceNumber;

        if(invoiceNumber < 10) {
          return `000${invoiceNumber}`;
        } else if(invoiceNumber < 100) {
          return `00${invoiceNumber}`;
        } else if(invoiceNumber < 1000) {
          return `0${invoiceNumber}`;
        } else {
          return invoiceNumber;
        }
      }
    },
    {
      title: 'Client Name',
      render: (invoice: IInvoice) => {
        return <>{invoice.client.name}</>
      }
    },
    {
      title: 'Email',
      render: (invoice: IInvoice) => {
        return <>{invoice.client.invoicingEmail}</>
      }
    },
    {
      title: 'Issued Date',
      render: (invoice: IInvoice) => {
        return <>{moment(invoice.date).format('MM/DD/YYYY')}</>
      }
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Actions',
      render: (invoice: IInvoice) =>
        <div className={styles['actions']} onClick={(event) => event.stopPropagation()}>
          <Dropdown
            overlay={
              <>
                <Menu>
                  <Menu.SubMenu title="Change status" key="mainMenu">
                    <Menu.Item 
                      key="Pending"
                      onClick={() => changeStatus(invoice.id, InvoiceStatus.Pending)}
                    >
                      Pending
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item 
                      key="Received"
                      onClick={() => changeStatus(invoice.id, InvoiceStatus.Received)}
                    >
                      Received
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Item 
                      key="Sent"
                      onClick={() => changeStatus(invoice.id, InvoiceStatus.Sent)}
                    >
                      Sent
                    </Menu.Item>
                  </Menu.SubMenu>
                </Menu>
              </>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={e => e.preventDefault()}
              style={{ paddingLeft: '1rem' }}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>,
    },
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title="Invoice History"
          extra={[
            <div className={styles['new-invoice']}>
              <Link to={routes.addInvoice.path(loggedInUser?.company?.code ?? '')}>
                Add Invoice
              </Link>
            </div>
          ]}
        />

        <Row>
          <Col span={24}>
            <Table
              loading={loading || updateLoading}
              dataSource={dataSource}
              columns={columns}
              rowKey={(record => record.id)} 
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: invoiceData?.Invoice?.paging?.total,
                pageSize: perPage
              }}
            />
          </Col>
        </Row>

      </Card>
    </div>
  )
}

export default Invoice;
