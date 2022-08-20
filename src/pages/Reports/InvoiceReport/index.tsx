import moment from 'moment';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { SearchOutlined } from '@ant-design/icons';
import { Card, Col, Dropdown, Menu, Row, Table, message, Modal, Form, Select, Button, Input, Popconfirm, Typography } from 'antd';

import filterImg from "../../../assets/images/filter.svg"

import { authVar } from '../../../App/link';
import constants, { invoice_status } from '../../../config/constants';
import routes from '../../../config/routes';
import { notifyGraphqlError } from '../../../utils/error';

import {
  Invoice as IInvoice,
  InvoiceQueryInput,
  InvoiceStatus,
  InvoicePagingResult,
  MutationInvoiceUpdateArgs,
  QueryInvoiceArgs,
  InvoiceUpdateInput,
} from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';

import PageHeader from '../../../components/PageHeader';
import Status from '../../../components/Status';
import InvoiceViewer from '../../../components/InvoiceViewer';
import { debounce } from 'lodash';
import AttachmentModal from '../../../components/AttachmentsModal/index';
import AttachNewTimesheetModal from '../../../components/AddAttachedTimesheet';
import { ATTACHED_TIMESHEET } from '../../Timesheet/DetailTimesheet';
import { useNavigate } from 'react-router-dom';
import { downloadCSV } from '../../../utils/common';
import { INVOICE_STATUS_UPDATE, INVOICE } from '../../Invoice';



const csvHeader: Array<{ label: string, key: string, subKey?: string }>  = [

  {
    label: 'Client Name',
    key:'client',
    subKey:'name',
  },
  {
    label: 'Email',
    key:'client',
    subKey:'invoicingEmail',
    
  },
  {
    label: 'Issued Date',
    key:'issueDate'
    
  },
  {
    label: 'Amount',
    key: 'totalAmount',
  },
  {
    label: 'Status',
    key: 'status',
  }  
];

const { Option } = Select;

const InvoiceReport = () => {
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

  const [fetchDownloadData, { data: invoiceDownloadData }] = useLazyQuery<GraphQLResponse<'Invoice', InvoicePagingResult>, QueryInvoiceArgs>(INVOICE, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input,
    },
    onCompleted: () => {
      console.log(invoiceDownloadData)
      downloadCSV(invoiceDownloadData?.Invoice?.data, csvHeader, 'Invoice.csv')
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

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {
            company_id: loggedInUser?.company?.id ?? '',
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
  };


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


  return (
    <div >
      <Card bordered={false}>
        <PageHeader
          title="Invoice History"
          extra={[
            <Button
            key="btn-filter"

            type="text"
            onClick={openFilterRow}
            icon={<img
              src={filterImg}
              alt="filter"
               />}>
            &nbsp; &nbsp;
            {filterProperty?.filter ? 'Reset' : 'Filter'}
          </Button>
          ]}
        />
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form">

          {filterProperty?.filter &&
            <Row gutter={[32, 0]} >

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
        
        <Row>
          <Col span={24}>
            {
              !!invoiceData?.Invoice?.data?.length ? (
                  <Button
                    type="link"
                    onClick={downloadReport}
                  >
                    Download Report
                  </Button>
              ) :
              <Typography.Text type="secondary" >No files to Download</Typography.Text>
            }</Col>
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

export default InvoiceReport;
