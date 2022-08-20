import moment from 'moment';
import { useRef, useState, useMemo } from 'react';
import { gql, useLazyQuery, useQuery, useMutation, NetworkStatus } from '@apollo/client';
import {
  useParams,
  Link,
  useNavigate
} from 'react-router-dom';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import { Card, Col, Row, Button, Space, message, Modal, Form, Select, Spin, Collapse } from 'antd';
import {
  CloseOutlined,
} from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { _cs, checkRoles } from '../../../utils/common';
import routes from '../../../config/routes';
import { notifyGraphqlError } from "../../../utils/error";
import constants from "../../../config/constants";
import { TimeEntry, QueryTimesheetArgs, TimeSheetPagingResult, MutationTimeEntriesApproveRejectArgs } from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { PROJECT } from '../../Project';
import { IGroupedTimeEntries } from '../../../interfaces/common.interface';

import TimeSheetLoader from '../../../components/Skeleton/TimeSheetLoader';
import TimesheetInformation from './TimesheetInformation';
import PageHeader from '../../../components/PageHeader';
import TimeEntryDetail from './TimeEntryDetail';
import InvoiceViewer from '../../../components/InvoiceViewer';
import NoContent from '../../../components/NoContent';
import ModalConfirm from '../../../components/Modal';
import CommentForm from './CommentForm';
import Comment from './Comment';
import Attachments from './Attachments';

import archiveImg from "../../../assets/images/archive_btn.svg";
import styles from './style.module.scss';
import TimesheetConfirmation from '../../../components/TimesheetConfirmation/index';

type InvoicedTimeEntries = {
  invoice_id: string;
  group: IGroupedTimeEntries[],
};

type EntriesByStatus = {
  approved: IGroupedTimeEntries[],
  pending: IGroupedTimeEntries[],
  rejected: IGroupedTimeEntries[],
};

export const TIME_SHEET = gql`
  query Timesheet($input: TimesheetQueryInput!) {
    Timesheet(input: $input) {
      paging {
        total
        startIndex
        endIndex
        hasNextPage
      }
      data {
        id
        weekStartDate
        weekEndDate
        totalExpense
        duration
        durationFormat
        lastApprovedAt
        lastSubmittedAt
        isSubmitted
        status
        user {
          id
          email
		  timesheet_attachment
        }
        client {
          id
          name
        }
        company {
          id
          name
        }
        approver {
          fullName
        }
        projectItems {
          project_id
          totalDuration
          totalExpense
          hourlyRate
        }
        durationMap
        timeEntries {
          ...timeEntry
        }
        entriesGroup {
          byInvoice {
            invoice_id
            entries {
              ...timeEntry
            }
          }
          byStatus {
            approvalStatus
            entries {
              ...timeEntry
            }
          }
        }
      }
    }
  }

  fragment timeEntry on TimeEntry {
    id
    startTime
    endTime
    duration
    description
    approvalStatus
    timesheet {
      id
    }
    project_id
    project {
      id
      name
    }
  }

`

export const APPROVE_REJECT_TIME_ENTRIES = gql`
  mutation TimeEntryApproveReject($input: TimeEntryApproveRejectInput!) {
    TimeEntriesApproveReject(input: $input)
  }
`;

export const TIMESHEET_SUBMIT = gql`
  mutation TimesheetSubmit($input: TimesheetSubmitInput!) {
    TimesheetSubmit(input: $input) {
      id
      isSubmitted
      lastSubmittedAt
      approver {
        id
        fullName
        email
      }
    }
  }
`

export const getTotalTimeForADay = (entries: any) => {
  let sum = 0;
  if (entries) {
    const durations = entries.map((data: any) => data?.duration)
    sum = durations.reduce((entry1: any, entry2: any) => {
      return entry1 + entry2;
    }, 0);
  };
  return sum
}

const DetailTimesheet = () => {
  let params = useParams()
  let navigate = useNavigate();
  const timesheet_id = params?.id as string;
  const { Option } = Select;

  const { Panel } = Collapse;

  const authData = authVar()
  const roles = authData?.user?.roles;
  const [form] = Form.useForm()
  const [commentDetails, setCommentDetails] = useState<{
    showModal: boolean;
    commentType: 'Reject' | 'UnlockApproved' | 'UnlockRejected' | 'UndoSubmit' | undefined;
  }>({
    showModal: false,
    commentType: undefined,
  });
  const [invoiceViewer, setInvoiceViewer] = useState<{
    isVisible: boolean,
    invoice_id: string | undefined;
  }>({
    isVisible: false,
    invoice_id: undefined,
  })

  const entriesByStatusRef = useRef<any>({});
  const [invoicedTimeEntries, setInvoicedTimeEntries] = useState<InvoicedTimeEntries[]>([])
  const [entriesByStatus, setEntriesByStatus] = useState<EntriesByStatus>({
    approved: [],
    pending: [],
    rejected: [],
  });

  /** Modal Visibility **/
  const [showAddNewEntry, setShowAddNewEntry] = useState<boolean>(false);
  const [confirmShow, setConfirmShow] = useState(false)

  const [submitTimesheet, { loading: submittingTimesheet }] = useMutation(TIMESHEET_SUBMIT)

  const managerLvlRole = useMemo(() => {
    let _roles = roles ?? [];
    return checkRoles({
      expectedRoles: [constants.roles.SuperAdmin, constants.roles.CompanyAdmin, constants.roles.TaskManager],
      userRoles: _roles,
    });
  }, [roles])

  const adminLvlRole = useMemo(() => {
    let _roles = roles ?? [];
    return checkRoles({
      expectedRoles: [constants.roles.SuperAdmin, constants.roles.CompanyAdmin],
      userRoles: _roles,
    });
  }, [roles])

  const isEmployee = useMemo(() => {
    let _roles = roles ?? [];
    return checkRoles({
      expectedRoles: [constants.roles.Employee],
      userRoles: _roles,
    });
  }, [roles])

  const [approveRejectTimeEntries] = useMutation<
    GraphQLResponse<'TimeEntriesApproveReject', boolean>,
    MutationTimeEntriesApproveRejectArgs
  >(APPROVE_REJECT_TIME_ENTRIES, {
    onCompleted() {
      refetchTimeSheet();
    },
    onError: notifyGraphqlError,
  });

  const [getProject, { data: projectData }] = useLazyQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          client_id: '',
		  user_id : authData?.user?.id,
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const { data: timeSheetDetailData, loading: timesheetLoading, refetch: refetchTimeSheet, networkStatus } = useQuery<
    GraphQLResponse<'Timesheet', TimeSheetPagingResult>,
    QueryTimesheetArgs
  >(TIME_SHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    notifyOnNetworkStatusChange: true,
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id as string,
          id: params?.id
        },
        paging: {
          order: ['weekStartDate:DESC']
        }
      }
    },
    onCompleted: (response) => {
      const timesheet = response.Timesheet?.data?.[0];
      const byStatus = timesheet?.entriesGroup?.byStatus ?? [];
      const byInvoice = timesheet?.entriesGroup?.byInvoice ?? [];

      let approvedTimeEntries: TimeEntry[] = find(byStatus, { approvalStatus: 'Approved' })?.entries ?? [];
      let pendingTimeEntries: TimeEntry[] = find(byStatus, { approvalStatus: 'Pending' })?.entries ?? [];
      let rejectedTimeEntries: TimeEntry[] = find(byStatus, { approvalStatus: 'Rejected' })?.entries ?? [];

      let invoiced: InvoicedTimeEntries[] = [];

      byInvoice.forEach((byInv) => {
        const _invoiced: InvoicedTimeEntries = {
          invoice_id: byInv.invoice_id,
          group: groupEntriesByProject(byInv.entries),
        };

        invoiced.push(_invoiced);
      })

      entriesByStatusRef.current = {
        approved: approvedTimeEntries,
        pending: pendingTimeEntries,
        rejected: rejectedTimeEntries,
      }

      setInvoicedTimeEntries(invoiced);
      setEntriesByStatus({
        approved: groupEntriesByProject(approvedTimeEntries),
        pending: groupEntriesByProject(pendingTimeEntries),
        rejected: groupEntriesByProject(rejectedTimeEntries),
      })

      getProject({
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              client_id: response?.Timesheet?.data[0]?.client?.id,
			  user_id:authData?.user?.id,
            },
            paging: {
              order: ['updatedAt:DESC']
            }
          }
        }
      }).then(r => { })
    }
  })

  const timesheetDetail = timeSheetDetailData?.Timesheet?.data[0];

  const onChangeProjectSelect = (value: string) => {
    if (form.getFieldValue(['task'])) {
      form.resetFields(['task']);
    }
  }

  const onSubmitNewTimeEntry = (values: any) => {
    const project = projectData?.Project?.data?.filter((data: any) =>
      data?.id === values?.project
    );
    const timeEntry = {
      entries: {},
      id: project[0]?.id,
      name: project[0]?.name,
      project: project[0]?.name,
      project_id: project[0]?.id,
    }

    const ids = entriesByStatus.pending?.map((timesheet: any) => {
      return timesheet?.id
    })

    if (!ids.includes(project[0]?.id)) {
      setEntriesByStatus({ ...entriesByStatus, pending: [...entriesByStatus.pending, timeEntry] });
    };

    setShowAddNewEntry(false);
    form.resetFields();
  }

  const checkDate = (today: any, weekEndDate: any) => {
    return today.getFullYear() === weekEndDate.getFullYear() &&
      today.getDate() <= weekEndDate.getDate() &&
      today.getMonth() === weekEndDate.getMonth();
  }

  const onSubmitTimesheet = () => {
    const weekEndDate: any = new Date(timesheetDetail?.weekEndDate as any);
    const today = new Date();

    const result = checkDate(today, weekEndDate)

    if (result) {
      setConfirmShow(!confirmShow)
    }
    else {
      handleSubmitTimesheet()
    }

  }

  const handleSubmitTimesheet = () => {
    submitTimesheet({
      variables: {
        input: {
          id: timesheetDetail?.id,
          company_id: authData?.company?.id
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data) {
        message.success({
          content: `Timesheet is submitted successfully!`,
          className: 'custom-message'
        });
      }
    }).catch(notifyGraphqlError)
    setConfirmShow(false)
  }


  const approveRejectAll = (status: string) => {
    const ids: string[] = [];

    entriesByStatusRef?.current?.pending?.forEach((entry: any) => {
      ids.push(entry.id);
    })

    if (status === 'Approved') {
      entriesByStatusRef?.current?.rejected?.forEach((entry: any) => {
        ids.push(entry.id);
      })
    } else if (status === 'Rejected') {
      entriesByStatusRef?.current?.approved?.forEach((entry: any) => {
        ids.push(entry.id);
      })
    }

    approveRejectTimeEntries({
      variables: {
        input: {
          ids,
          approvalStatus: 'Approved',
          company_id: authData?.company?.id as string,
          timesheet_id,
        },
      },
    })
  }

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

  const exit = () => {
    if (managerLvlRole) {
      navigate(routes.employeeTimesheet.path(authData?.company?.code as string))
    } else {
      navigate(routes.timesheet.path(authData?.company?.code as string))
    }
  }

  const deletePendingGroups = (id: string) => {
    const filteredPendingArray = entriesByStatus?.pending?.filter(entry => entry?.id !== id)
    setEntriesByStatus({ ...entriesByStatus, pending: filteredPendingArray });
  }

  const onCommentFormCancel = () => {
    setCommentDetails({
      showModal: false,
      commentType: undefined,
    })
  }

  const isSubmitted:any = timesheetDetail?.isSubmitted;

  return (
    <>
      {(timesheetLoading && networkStatus !== NetworkStatus.refetch) ? <TimeSheetLoader /> :
        <Spin spinning={timesheetLoading}>
          <div className={styles['site-card-wrapper']}>
            {
              !!timesheetDetail && <TimesheetInformation timesheet={timesheetDetail} />
            }

            <br />

            <Card bordered={false} className={styles['time-entries']}>
              {
                !timesheetDetail?.isSubmitted && 
                <Row className={styles['timesheet-detail']}>

                  <PageHeader
                    title="Time Entry Details"
                    extra={[
                    <span key="new-entry">
                      {
                        roles.includes(constants.roles.Employee) &&
                        <span
                          key="new-entry"
                          className={styles['add-entry']}
                          onClick={() => {
                            setShowAddNewEntry(true)
                            form.resetFields();
                          }}
                        >
                          Add New Time Entry
                        </span>
                      }
                    </span>
                    ]}
                  />
                </Row>
              }
 			 {(!timesheetDetail?.entriesGroup?.byStatus.length && !timesheetDetail?.entriesGroup?.byInvoice.length) ?
                <NoContent title={'No Time Entry added'} subtitle={'There are no entries added at the moment'} /> 
				:
              <>
              <div className={styles['resp-table']}>
                {
                  !!entriesByStatus.pending?.length &&
                  <div className={styles['timesheet-section']}>
                    <div
                      className={
                        _cs([styles['timesheet-status'], styles['unapproved-status']])
                      }
                    >
                      <div>
                        Unapproved Timesheet
                      </div>

                      {
                        timesheetDetail?.isSubmitted && managerLvlRole && (
                          <div className={styles['action']}>
                            <span 
                              onClick={() => setCommentDetails({
                                showModal: true,
                                commentType: 'UndoSubmit',
                              })}
                            >
                              Unlock
                            </span>
                          </div>
                        )
                      }
                    </div>

                    <TimeEntryDetail
                      startDate={timesheetDetail?.weekStartDate as string}
                      groupedTimeEntries={entriesByStatus.pending}
                      durationMap={timesheetDetail?.durationMap?.['Pending']}
                      client_id={timesheetDetail?.client?.id as string}
                      refetch={refetchTimeSheet}
                      status='Pending'
                      deleteAction={deletePendingGroups}
                      needAction
                      timesheet_id={timesheet_id}
                      isTimesheetSubmitted={isSubmitted}
                    />

                    {
                      managerLvlRole && isSubmitted && (
                        <Row justify="end" style={{ margin: '36px 0' }}>
                          <Space>
                            <Button onClick={() => { approveRejectAll('Approved') }} >
                              Approve All
                            </Button>

                            <Button onClick={() => { approveRejectAll('Rejected') }} >
                              Reject All
                            </Button>
                          </Space>
                        </Row>

                      )
                    }
                  </div>
                }

                {
                  adminLvlRole && invoicedTimeEntries.map((invoiced) => (
                    <div key={invoiced.invoice_id} className={styles['timesheet-section']}>
                      <div
                        className={
                          _cs([styles['timesheet-status'], styles['approved-status']])
                        }
                      >
                        <div>
                          Invoiced Timesheet
                        </div>

                        {
                          roles.includes(constants.roles.CompanyAdmin) && (
                            <div
                              className={styles['action']}
                              onClick={() => handleViewInvoiceClick(invoiced.invoice_id)}
                            >
                              View Invoice
                            </div>
                          )
                        }
                      </div>

                      <TimeEntryDetail
                        startDate={timesheetDetail?.weekStartDate as string}
                        groupedTimeEntries={invoiced.group}
                        durationMap={timesheetDetail?.durationMap?.[invoiced.invoice_id]}
                        client_id={timesheetDetail?.client?.id as string}
                        refetch={refetchTimeSheet}
                        status='Invoiced'
                        timesheet_id={timesheet_id}
                      />
                    </div>
                  ))
                }

                {
                  !!entriesByStatus.approved.length &&
                  <div className={styles['timesheet-section']}>
                    <div
                      className={
                        _cs([styles['timesheet-status'], styles['approved-status']])
                      }
                    >
                      <div>
                        Approved Timesheet
                      </div>

                      {
                        managerLvlRole && (
                          <div className={styles['action']}>
                            <span 
                              onClick={() => setCommentDetails({
                                showModal: true,
                                commentType: 'UnlockApproved',
                              })}
                            >
                              Unlock
                            </span>

                            {
                              adminLvlRole && (
                                <Link
                                  className={styles['invoice-link']}
                                  to={routes.timesheetInvoice.path(authData?.company?.code as string, params?.id as string)}
                                  state={{ from: 'timesheet' }}
                                >
                                  Generate Invoice
                                </Link>
                              )

                            }
                          </div>
                        )
                      }
                    </div>

                    <TimeEntryDetail
                      startDate={timesheetDetail?.weekStartDate as string}
                      groupedTimeEntries={entriesByStatus.approved}
                      durationMap={timesheetDetail?.durationMap?.['Approved']}
                      client_id={timesheetDetail?.client?.id as string}
                      refetch={refetchTimeSheet}
                      status='Approved'
                      needAction
                      timesheet_id={timesheet_id}
                    />

                  </div>
                }

                {
                  !!entriesByStatus.rejected.length &&
                  <div className={styles['timesheet-section']}>
                    <div
                      className={
                        _cs([styles['timesheet-status'], styles['rejected-status']])
                      }
                    >
                      <div>
                        Rejected Timesheet
                      </div>

                      {
                        managerLvlRole && (
                          <div className={styles['action']}>
                            <span 
                              onClick={() => setCommentDetails({
                                showModal: true,
                                commentType: 'UnlockRejected',
                              })}
                            >
                              Unlock
                            </span>
                          </div>
                        )
                      }
                    </div>

                    <TimeEntryDetail
                      startDate={timesheetDetail?.weekStartDate as string}
                      groupedTimeEntries={entriesByStatus.rejected}
                      durationMap={timesheetDetail?.durationMap?.['Rejected']}
                      client_id={timesheetDetail?.client?.id as string}
                      status='Rejected'
                      refetch={refetchTimeSheet}
                      needAction
                      timesheet_id={timesheet_id}
                    />
                  </div>
                }
              </div>
			  </>
			   }
              <br />
              <br />
            </Card>
          </div>
        </Spin>
      } 

    {timesheetDetail?.user.timesheet_attachment &&  
        (
          <div className={styles['site-card-wrapper']}>
            <Card className={styles['attach-approved-timesheet']}>
              <Collapse accordion defaultActiveKey={['2']}>
                <Panel header="Expense" key="2" className={styles['attachApprovedTitle']}>
                  <Attachments
                    isEmployee={isEmployee}
                    timesheet_id={timesheet_id}
                  />
                </Panel>
              </Collapse>
            </Card>
          </div>
      )}

		{(!timesheetDetail?.entriesGroup?.byStatus?.length &&
               !timesheetDetail?.entriesGroup?.byInvoice?.length ) ?
               "" :
               <Row justify={"end"} className={styles['button-row']}>
                 <Col className={styles['form-col']}>
                   <Space>
                     <Button
                       type="primary"
                       htmlType="button"
                       onClick={exit}
                     >
                       Exit
                     </Button>
 
                     {
                       isEmployee && (
                         <Button
                           type="default"
                           htmlType="button"
                           loading={submittingTimesheet}
                           disabled={isSubmitted}
                           onClick={onSubmitTimesheet}
                         >
                           Submit
                         </Button>
 
                       )
                     }
                   </Space>
                 </Col>
               </Row>}


        <div className={styles['site-card-wrapper']}>
          <Card bordered={false} className={styles['time-entries']}>
            <Comment 
              timesheet_id={timesheet_id}
              company_id={authData?.company?.id as string}
            />
          </Card>
        </div>

      <Modal
          centered
          visible={showAddNewEntry}
          footer={null}
          closeIcon={[
            <div onClick={() => setShowAddNewEntry(false)} key={1}>
              <span className={styles['close-icon-div']}>
                <CloseOutlined />
              </span>
            </div>
          ]}
          width={1000}
        >
        <div className={styles['modal-title']}>Select Project</div>

        <Form
          form={form}
          onFinish={onSubmitNewTimeEntry}
          layout="vertical">
          <div className={styles['form-body']}>
            <Form.Item
              name="project"
              label="Project"
              rules={[{
                required: true,
                message: 'Choose the project'
              }]}>
              <Select
                placeholder="Select Project"
                onChange={onChangeProjectSelect}
              >
                {projectData && projectData?.Project?.data.map((project: any, index: number) => (
                  <Option value={project?.id} key={index}>
                    {project?.name}
                  </Option>))}
              </Select>
            </Form.Item>
          </div>

          <div className={styles['form-footer']}>
            <Form.Item>
              <Button
                type="default"
                htmlType="button" onClick={() => setShowAddNewEntry(false)}>
                Cancel
              </Button>
              &nbsp; &nbsp;
              <Button
                type="primary"
                htmlType="submit"
              >
                Create
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Modal>

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

      <Modal
        centered
        width={800}
        footer={null}
        title="Unlock"
        destroyOnClose
        visible={commentDetails.showModal}
        onCancel={onCommentFormCancel}
      >
        <CommentForm 
          timesheet_id={timesheet_id}
          user_id={timesheetDetail?.user?.id as string}
          commentType={commentDetails.commentType}
          company_id={authData?.company?.id as string}
          onHideModal={onCommentFormCancel}
          refetchTimesheet={refetchTimeSheet}
        />
      </Modal>


      <ModalConfirm
        visibility={confirmShow}
        setModalVisibility={setConfirmShow}
        okText={'Confirm'}
        imgSrc={archiveImg}
        modalBody={
          <TimesheetConfirmation
            title={
              <>
                There's still working days left ? Are you sure you want to submit it ?
              </>
            }
          />
        }
        onOkClick={handleSubmitTimesheet}
      />
    </>
  )
}

function groupEntriesByProject(entries: TimeEntry[]) {
  function groupByStartDate(array: any) {
    const startDateFn = (entry: any) => moment(entry?.startTime).utc().format('YYYY-MM-DD');
    return groupBy(array, startDateFn);
  }

  let grouped: any = [];

  const projects = groupBy(entries, 'project_id');

  for (const [key, _entries] of Object.entries(projects)) {
    grouped.push({
      id: key,
      project: _entries[0]?.project?.name,
      project_id: key,
      entries: groupByStartDate(_entries)
    });
  }

  return grouped;
};


export default DetailTimesheet;
