import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { SearchOutlined, CheckCircleFilled, FormOutlined, EyeFilled, PlusCircleFilled,SendOutlined } from '@ant-design/icons';
import { Card, Col, Dropdown, Menu, Row, Table, message, Modal, Form, Select, Button, Input, Popconfirm } from 'antd';

import filterImg from "../../assets/images/filter.svg"

import { authVar } from '../../App/link';
import constants, { invoice_status } from '../../config/constants';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';

import {
  Invoice as IInvoice,
  InvoiceQueryInput,
  InvoiceStatus,
  InvoicePagingResult,
  MutationInvoiceUpdateArgs,
  QueryInvoiceArgs,
  InvoiceUpdateInput,
} from '../../interfaces/generated';
import { GraphQLResponse } from '../../interfaces/graphql.interface';

import { ATTACHED_TIMESHEET_FIELDS } from '../../gql/timesheet.gql'
import PageHeader from '../../components/PageHeader';
import Status from '../../components/Status';
import InvoiceViewer from '../../components/InvoiceViewer';
import styles from './style.module.scss';
import { debounce } from 'lodash';
import AttachmentModal from '../../components/AttachmentsModal/index';
import AttachNewTimesheetModal from '../../components/AddAttachedTimesheet';
import { useNavigate } from 'react-router-dom';

const ATTACHED_TIMESHEET = gql`
  ${ATTACHED_TIMESHEET_FIELDS}
  query AttachedTimesheet($input: AttachedTimesheetQueryInput!) {
    AttachedTimesheet(input: $input){
      data {
        ...attachedTimesheetFields
      }
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }     
    }
  }
`;


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
        timesheet_id
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

const { Option } = Select;
const Invoice = () => {
  const loggedInUser = authVar();
const navigate = useNavigate();
  const companyCode = loggedInUser?.company?.code as string

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

  const [invoiceId, setInvoiceId] = useState('');
  const [showAttachment, setShowAttachment] = useState(false)

  const [showAttachTimeEntry, setAttachTimeEntry] = useState(false);
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

  const [ attachments,{ data: attachmentsData }] = useLazyQuery(ATTACHED_TIMESHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          invoice_id: invoiceId
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [updateInvoice] = useMutation<
  GraphQLResponse<'InvoiceUpdate', IInvoice>,
  MutationInvoiceUpdateArgs
>(
  INVOICE_STATUS_UPDATE, {
	onCompleted(data) {
	  if(data.InvoiceUpdate) {
		message.success('Invoice resend successfully');

		navigate(routes.invoice.path(companyCode));
	  }
	},
	onError: notifyGraphqlError,
  }
);


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

  const handleResendInvoiceClick = (invoice_id: string) => {
	const input: InvoiceUpdateInput = {
		id: invoice_id,
		status: InvoiceStatus.Sent,
		company_id: loggedInUser?.company?.id as string,
	};

	updateInvoice({
		variables: {
			input,
		}
	})
}

  const handleViewInvoiceCancel = () => {
    setInvoiceViewer({
      isVisible: false,
      invoice_id: undefined,
    });
  }

  const handleViewAttachmentClick = (invoice_id: string) => {
    setShowAttachment(!showAttachment)
    setInvoiceId(invoice_id)

    attachments({
      variables: {
        input: {
            query: {
                company_id: loggedInUser?.company?.id as string,
                invoice_id: invoice_id as string,
            },
            paging: {
                order: ['updatedAt:DESC']
            }
        }
    }
    })
  }
  const handleAddAttachment = (invoice_id: string) => {
    setAttachTimeEntry(!showAttachTimeEntry)
    setInvoiceId(invoice_id)
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
      dataIndex: 'invoiceNumber',
      width: '10%',
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
      title: 'Attachments',
      render: (invoice: IInvoice) => {
        return (
          <Row>
            <Col>
              {

                <div
                  onClick={() => handleViewAttachmentClick(invoice.id)}
                  title='View Attachment'
                  className={`${styles["table-icon"]} ${styles["table-view-attachment-icon"]}`}
                >
                  <EyeFilled />
                </div>
              }
            </Col>
            <Col>
              {
                invoice.status === 'Pending' && (
                  <div
                    onClick={() => handleAddAttachment(invoice.id)}
                    title='Add Attachment'
                    className={`${styles["table-icon"]} ${styles["table-add-icon"]}`}
                  >
                    <PlusCircleFilled />
                  </div>
                )
              }</Col>
          </Row>
        )
      }
    },
    {
      title: 'Actions',
      render: (invoice: IInvoice) => {
        return (
          <Row>
            <Col>
              {
                invoice.status === 'Pending' ? (
                  <Link
                    to={routes.editInvoice.path(loggedInUser?.company?.code as string, invoice.id)}
                    title='Edit Invoice'
                    className={`${styles["table-icon"]} ${styles["table-view-icon"]}`}
                  >
                    <FormOutlined />
                  </Link>
                ) : (
                  <div
                    onClick={() => handleViewInvoiceClick(invoice.id)}
                    title='View Invoice'
                    className={`${styles["table-icon"]} ${styles["table-view-icon"]}`}
                  >
                    <EyeFilled />
                  </div>
                )
              }
            </Col>
            <Col>
              <div
                className={`${styles["table-icon"]} ${styles["table-status-icon"]}`}
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
			{
                invoice.status === 'Sent' && (
			<Col>
			  <Popconfirm
				placement="left"
				title="Are you sure you want to resend invoice?"
				onConfirm={() => handleResendInvoiceClick(invoice.id)}
				okText="Yes" cancelText="No">        
					<div     
						title='Resend Invoice'
						className={`${styles["table-icon"]} ${styles["table-view-icon"]}`}
					>
					 <SendOutlined />
					</div>
			  </Popconfirm>
			</Col>
			 )
			}
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

      <AttachmentModal
        visibility={showAttachment}
        setVisibility={setShowAttachment}
        attachment ={attachmentsData?.AttachedTimesheet?.data}
      />


      <AttachNewTimesheetModal
        visibility={showAttachTimeEntry}
        setVisibility={setAttachTimeEntry}
        invoice_id={invoiceId} 
        refetch = {attachments}/>
    </div>
  )
}

export default Invoice;
