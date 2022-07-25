import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery, useMutation } from '@apollo/client';
import {  SearchOutlined, CheckCircleFilled, FormOutlined, EyeFilled } from '@ant-design/icons';
import { Card, Col, Dropdown, Menu, Row, Table, message, Modal, Form, Select, Button, Input } from 'antd';

import filterImg from "../../assets/images/filter.svg"

import { authVar } from '../../App/link';
import constants,{invoice_status} from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';

import { 
  Invoice as IInvoice,
  InvoiceQueryInput,
  InvoiceStatus,
  InvoicePagingResult,
  MutationInvoiceUpdateArgs,
  QueryInvoiceArgs,
} from '../../interfaces/generated';
import { GraphQLResponse } from '../../interfaces/graphql.interface';

import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';
import InvoiceViewer from '../../components/InvoiceViewer';
import styles from './style.module.scss';
import { debounce } from 'lodash';

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
const {Option} = Select;
const Invoice = () => {
  const loggedInUser = authVar();

  const [filterForm] = Form.useForm();

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

  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });


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

  const { data: invoiceData, loading , refetch:refetchInvoice } = useQuery<
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

  const refetchInvoices = () => {

    let values = filterForm.getFieldsValue(['search', 'role', 'status'])

    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      },

      query: {
        company_id: loggedInUser?.company?.id
      }

    }

    let query: {
      status?: string,
      archived?: boolean,
      search?:boolean,
      company_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string
    }


    if (values.status) {
      query['status'] = values.status;
    }

    if (values.search) {
      query['search'] = values?.search
    }

    input['query'] = query

    refetchInvoice({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchInvoices()
  }

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchInvoice({
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: loggedInUser?.company?.id as string,
          }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }


  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const menu = (invoice: IInvoice) => (
    <Menu>

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
    </Menu>
  )

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
          // <div className={styles['actions']} onClick={(event) => event.stopPropagation()}>
          //   <Dropdown
          //     overlay={
          //       <>
          //         <Menu>
          //           <Menu.Item key="edit">
          //             {
          //               invoice.status === 'Pending' ? (
          //                 <Link
          //                   to={routes.editInvoice.path(loggedInUser?.company?.code as string, invoice.id)}
          //                 >
          //                   Edit Invoice 
          //                 </Link>
          //               ): (
          //                 <div 
          //                   onClick={() => handleViewInvoiceClick(invoice.id)}
          //                 >
          //                   View Invoice
          //                 </div>
          //               )
          //             }
          //           </Menu.Item>

          //           <Menu.SubMenu title="Change status" key="mainMenu">
          //             <Menu.Item 
          //               key="Pending"
          //               onClick={() => changeStatus(invoice.id, InvoiceStatus.Pending)}
          //             >
          //               Pending
          //             </Menu.Item>

          //             <Menu.Divider />

          //             <Menu.Item 
          //               key="Received"
          //               onClick={() => changeStatus(invoice.id, InvoiceStatus.Received)}
          //             >
          //               Received
          //             </Menu.Item>

          //             <Menu.Divider />

          //             {
          //               invoice.status === InvoiceStatus.Pending && (
          //                 <Menu.Item 
          //                   key="Sent"
          //                   onClick={() => changeStatus(invoice.id, InvoiceStatus.Sent)}
          //                 >
          //                   Sent
          //                 </Menu.Item>
          //               )
          //             }
          //           </Menu.SubMenu>
          //         </Menu>
          //       </>
          //     }
          //     trigger={['click']}
          //     placement="bottomRight"
          //   >
          //     <div
          //       className="ant-dropdown-link"
          //       onClick={e => e.preventDefault()}
          //       style={{ paddingLeft: '1rem' }}>
          //       <MoreOutlined />
          //     </div>
          //   </Dropdown>
          // </div>
          <Row>
            <Col>
              {
                invoice.status === 'Pending' ? (
                  <Link
                    to={routes.editInvoice.path(loggedInUser?.company?.code as string, invoice.id)}
                    title = 'Edit Invoice'
                    className={styles['table-icon']}
                  >
                    <FormOutlined />
                  </Link>
                ) : (
                  <div
                    onClick={() => handleViewInvoiceClick(invoice.id)}
                    title='View Invoice'
                    className={styles['table-icon']}
                  >
                    <EyeFilled />
                  </div>
                )
              }
            </Col>
            <Col>
              <div
                className={styles["table-icon"]}
                onClick={(event) => event.stopPropagation()}
              >
                <Dropdown
                  overlay={menu(invoice)}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                    title='Change Status'
                  >
                    <CheckCircleFilled />
                  </div>
                </Dropdown>
              </div>
            </Col>
          </Row>
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
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form">
          <Row gutter={[32, 0]}>
            <Col xs={24} sm={24} md={16} lg={17} xl={20}>
              <Form.Item name="search" label="">
                <Input
                  prefix={<SearchOutlined className="site-form-item-icon" />}
                  placeholder="Search by Client name or email"
                  onChange={debouncedResults}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={7} xl={4}>
              <div className={styles['filter-col']}>
                <Button
                  type="text"
                  onClick={openFilterRow}
                  icon={<img
                    src={filterImg}
                    alt="filter"
                    className={styles['filter-image']} />}>
                  &nbsp; &nbsp;
                  {filterProperty?.filter ? 'Reset' : 'Filter'}
                </Button>
              </div>
            </Col>
          </Row>
          {filterProperty?.filter &&
            <Row gutter={[32, 0]} className={styles["role-status-col"]}>

              <Col span={5}>
                <Form.Item name="status" label="">
                  <Select
                    placeholder="Select status"
                    onChange={onChangeFilter}
                  >
                    {invoice_status?.map((status: any) =>
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>}
        </Form>
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
