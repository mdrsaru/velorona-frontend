import moment from 'moment';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import { MoreOutlined } from '@ant-design/icons';
import { Card, Col, Dropdown, Menu, Row, Table, message, Modal } from 'antd';

import { authVar } from '../../App/link';
import constants from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';

import { 
  Invoice as IInvoice,
  InvoiceQueryInput,
  InvoiceStatus,
  InvoicePagingResult,
  MutationInvoiceUpdateArgs,
  QueryInvoiceArgs
} from '../../interfaces/generated';
import { GraphQLResponse } from '../../interfaces/graphql.interface';

import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';
import InvoiceViewer from '../../components/InvoiceViewer';
import styles from './style.module.scss';

const INVOICE = gql`
  query Invoice($input: InvoiceQueryInput!) {
    Invoice(input: $input) {
      paging {
        total
      }
      data {
        id
        issueDate 
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
  const loggedInUser = authVar();
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });
  const [invoiceViewer, setInvoiceViewer] = useState<{
    isVisible: boolean,
    invoice_id: string | undefined;
  }>({
    isVisible: false,
    invoice_id: undefined,
  })

  const [updateStatus, { loading: updateLoading }] = useMutation<
    GraphQLResponse<'InvoiceUpdate', IInvoice>,
    MutationInvoiceUpdateArgs
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
      take: constants.paging.perPage,
      order: ['issueDate:ASC'],
    },
    query: {
      company_id: loggedInUser?.company?.id as string,
    },
  };

  const { data: invoiceData, loading } = useQuery<
    GraphQLResponse<'Invoice', InvoicePagingResult>,
    QueryInvoiceArgs
  >(INVOICE, {
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
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const handleViewInvoiceClick = (invoice_id: string) => {
    setInvoiceViewer({
      isVisible: true,
      invoice_id,
    });
  }

  const handleViewInvoiceCancel = () => {
    setInvoiceViewer({
      isVisible: false,
      invoice_id: undefined,
    });
  }

  const dataSource = invoiceData?.Invoice?.data ?? [];

  const columns = [
    {
      title: 'Invoice Number',
      dataIndex: 'invoiceNumber'
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
        return <>{moment(invoice.issueDate).format('MM/DD/YYYY')}</>
      }
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => {
        return <Status status={status} />
      }
    },
    {
      title: 'Actions',
      render: (invoice: IInvoice) => {
        return (
          <div className={styles['actions']} onClick={(event) => event.stopPropagation()}>
            <Dropdown
              overlay={
                <>
                  <Menu>
                    <Menu.Item key="edit">
                      {
                        invoice.status === 'Pending' ? (
                          <Link
                            to={routes.editInvoice.path(loggedInUser?.company?.code as string, invoice.id)}
                          >
                            Edit Invoice 
                          </Link>
                        ): (
                          <div 
                            onClick={() => handleViewInvoiceClick(invoice.id)}
                          >
                            View Invoice
                          </div>
                        )
                      }
                    </Menu.Item>

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

                      {
                        invoice.status === InvoiceStatus.Pending && (
                          <Menu.Item 
                            key="Sent"
                            onClick={() => changeStatus(invoice.id, InvoiceStatus.Sent)}
                          >
                            Sent
                          </Menu.Item>
                        )
                      }
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
          </div>
        )
      }
    },
  ];

  return (
    <div className={styles['container']}>
      <Card bordered={false}>
        <PageHeader 
          title="Invoice History"
          extra={[
            <div className={styles['new-invoice']} key="new-invoice">
              <Link to={routes.addInvoice.path(loggedInUser?.company?.code ?? '')}>
                Add Invoice
              </Link>
            </div>
          ]}
        />

        <Row className='container-row'>
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
                pageSize: constants.paging.perPage
              }}
            />
          </Col>
        </Row>

      </Card>

      <Modal
        centered
        width={1000}
        footer={null}
        visible={invoiceViewer.isVisible}
        onCancel={handleViewInvoiceCancel}
      >
        {
          invoiceViewer.invoice_id && <InvoiceViewer id={invoiceViewer.invoice_id} />
        }
      </Modal>
    </div>
  )
}

export default Invoice;
