import moment from 'moment';
import { useRef, useState } from 'react';
import { gql, useLazyQuery, useQuery, useMutation } from '@apollo/client';
import { useParams, Link } from 'react-router-dom';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import { Card, Col, Row, Button, Space, message, Modal, Form, Select, Spin } from 'antd';
import {
  CloseOutlined
} from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { _cs, checkRoles } from '../../../utils/common';
import routes from '../../../config/routes';
import { notifyGraphqlError } from "../../../utils/error";
import constants from "../../../config/constants";
import { TimeEntry, QueryTimesheetArgs, TimeSheetPagingResult, MutationTimeEntriesApproveRejectArgs } from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { TASK } from '../../Tasks';
import { PROJECT } from '../../Project';
import { IGroupedTimeEntries } from '../../../interfaces/common.interface';

import TimeSheetLoader from '../../../components/Skeleton/TimeSheetLoader';
import TimesheetInformation from './TimesheetInformation';
import PageHeader from '../../../components/PageHeader';
import TimeEntryDetail from './TimeEntryDetail';
import InvoiceViewer from '../../../components/InvoiceViewer';

import styles from './style.module.scss';

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
        
        user {
          id
          email
        }
        client {
          id
          name
        }
        company {
          id
          name
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
    approvalStatus
    timesheet {
      id
    }
    task {
      id
      name
    }
    project {
      id
      name
    }
    task_id

  }

`

export const APPROVE_REJECT_TIME_ENTRIES = gql`
  mutation TimeEntryApproveReject($input: TimeEntryApproveRejectInput!) {
    TimeEntriesApproveReject(input: $input)
  }
`;

export const TIMESHEET_SUBMIT = gql`
  mutation TimesheetSubmit($input: TimesheetSubmitInput!) {
    TimesheetSubmit(input: $input) {Form
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
  let params = useParams();
  const { Option } = Select;
  const authData = authVar();
  const roles = authData?.user?.roles ?? [];
  const [form] = Form.useForm();
  const [filteredTasks, setTasks] = useState([]);
  const [submitTimesheet] = useMutation(TIMESHEET_SUBMIT);
  const [timeSheetWeekly, setTimeSheetWeekly] = useState<Array<any>>([]);

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

  const canApproveReject = checkRoles({
    expectedRoles: [constants.roles.SuperAdmin, constants.roles.CompanyAdmin, constants.roles.TaskManager],
    userRoles: roles,
  });

  const [approveRejectTimeEntries] = useMutation<
    GraphQLResponse<'TimeEntriesApproveReject', boolean>,
    MutationTimeEntriesApproveRejectArgs
  >(APPROVE_REJECT_TIME_ENTRIES, {
    onCompleted() {
      refetchTimeSheet();
    },
    onError: notifyGraphqlError,
  });

  const [getTask, { data: taskData }] = useLazyQuery(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          project_id: ''
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    },
    onCompleted: (response: any) => {
      const taskIds = timeSheetWeekly.map((timesheet: any) => {
        return timesheet?.id
      });
      const filtered = response?.Task?.data?.filter((task: any) => {
        return !taskIds.includes(task?.id)
      });

      setTasks(filtered)
    }
  })

  const onSubmitNewTimeEntry = (values: any) => {
    const project = projectData?.Project?.data?.filter((data: any) =>
      data?.id === values?.project
    );
    const task = taskData?.Task?.data?.filter((data: any) =>
      data?.id === values?.task
    );
    const timeEntry = {
      entries: {},
      id: task[0]?.id,
      project: project[0]?.name,
      project_id: project[0]?.id,
      name: task[0]?.name
    }
    const ids = timeSheetWeekly?.map((timesheet: any) => {
      return timesheet?.id
    })
    if (!ids.includes(task[0]?.id)) {
      setTimeSheetWeekly([...timeSheetWeekly, timeEntry])
    };
    setShowAddNewEntry(false);
    form.resetFields();
  }

  const [getProject, { data: projectData }] = useLazyQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          client_id: ''
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const onChangeProjectSelect = (value: string) => {
    getTask({
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id,
            project_id: value
          },
          paging: {
            order: ['updatedAt:DESC']
          }
        }
      }
    }).then(r => { })
    if (form.getFieldValue(['task'])) {
      form.resetFields(['task']);
    }
  }

  const { data: timeSheetDetail, loading: timesheetLoading, refetch: refetchTimeSheet } = useQuery<
    GraphQLResponse<'Timesheet', TimeSheetPagingResult>,
    QueryTimesheetArgs
  >(TIME_SHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
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

      let approvedTimeEntries: TimeEntry[] = find(byStatus,{ approvalStatus: 'Approved' })?.entries ?? [];
      let pendingTimeEntries: TimeEntry[] = find(byStatus,{ approvalStatus: 'Pending' })?.entries ?? [];
      let rejectedTimeEntries: TimeEntry[] = find(byStatus,{ approvalStatus: 'Rejected' })?.entries ?? [];

      let invoiced: InvoicedTimeEntries[] = [];

      byInvoice.forEach((byInv) => {
        const _invoiced: InvoicedTimeEntries = {
          invoice_id: byInv.invoice_id,
          group: groupEntriesByTask(byInv.entries),
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
        approved: groupEntriesByTask(approvedTimeEntries),
        pending: groupEntriesByTask(pendingTimeEntries),
        rejected: groupEntriesByTask(rejectedTimeEntries),
      })

      getProject({
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              client_id: response?.Timesheet?.data[0]?.client?.id,
            },
            paging: {
              order: ['updatedAt:DESC']
            }
          }
        }
      }).then(r => { })
    }
  })

  const onSubmitTimesheet = () => {
    submitTimesheet({
      variables: {
        input: {
          id: timeSheetDetail?.Timesheet?.data[0]?.id,
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
  }

  const approveRejectAll = (status: string) => {
    const ids: string[] = [];

    entriesByStatusRef?.current?.pending?.forEach((entry: any) => {
      ids.push(entry.id);
    })

    if(status === 'Approved') {
      entriesByStatusRef?.current?.rejected?.forEach((entry: any) => {
        ids.push(entry.id);
      })
    } else if(status === 'Rejected') {
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

  const timesheetDetail = timeSheetDetail?.Timesheet?.data[0];

  return (
    <>
      {timesheetLoading ? <TimeSheetLoader /> :
        <Spin spinning={timesheetLoading}>
          <div className={styles['site-card-wrapper']}>
            {
              !!timesheetDetail && <TimesheetInformation timesheet={timesheetDetail} />
            }

            <br />

            <Card bordered={false} className={styles['time-entries']}>
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

              <div className={styles['resp-table']}>
                {
                  !!entriesByStatus.pending?.length && 
                    <div className={styles['timesheet-section']}>
                      <div className={styles['timesheet-status']}>
                        Unapproved Timesheet
                      </div>

                      <TimeEntryDetail 
                        startDate={timeSheetDetail?.Timesheet?.data[0]?.weekStartDate as string}
                        groupedTimeEntries={entriesByStatus.pending}
                        durationMap={timesheetDetail?.durationMap?.['Pending']}
                        client_id={timesheetDetail?.client?.id as string}
                        refetch={refetchTimeSheet}
                        status='Pending'
                        needAction
                      />

                      {
                        canApproveReject && (
                          <Row justify="end" style={{ margin: '36px 0' }}>
                            <Space>
                              <Button onClick={() => {approveRejectAll('Approved')}} >
                                Approve All
                              </Button>

                              <Button onClick={() => {approveRejectAll('Rejected')}} >
                                Reject All
                              </Button>

                              <Button type="primary">Exit</Button>
                            </Space>
                          </Row>

                        )
                      }
                    </div>
                }

                {
                  invoicedTimeEntries.map((invoiced) => (
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
                        startDate={timeSheetDetail?.Timesheet?.data[0]?.weekStartDate as string}
                        groupedTimeEntries={invoiced.group}
                        durationMap={timesheetDetail?.durationMap?.[invoiced.invoice_id]}
                        client_id={timesheetDetail?.client?.id as string}
                        refetch={refetchTimeSheet}
                        status='Invoiced'
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
                          roles.includes(constants.roles.CompanyAdmin) && (
                            <div className={styles['action']}>
                              <Link
                                className={styles['invoice-link']}
                                to={routes.timesheetInvoice.path(authData?.company?.code as string, params?.id as string)}
                              >
                                Generate Invoice
                              </Link>
                            </div>
                          )
                        }
                      </div>

                      <TimeEntryDetail 
                        startDate={timeSheetDetail?.Timesheet?.data[0]?.weekStartDate as string}
                        groupedTimeEntries={entriesByStatus.approved}
                        durationMap={timesheetDetail?.durationMap?.['Approved']}
                        client_id={timesheetDetail?.client?.id as string}
                        refetch={refetchTimeSheet}
                        status='Approved'
                        needAction
                      />
                    </div>
                }

                {
                  !!entriesByStatus.rejected.length && 
                    <div className={styles['timesheet-section']}>
                      <div className={styles['timesheet-status']}>
                        Rejected Timesheet
                      </div>
                      <TimeEntryDetail 
                        startDate={timeSheetDetail?.Timesheet?.data[0]?.weekStartDate as string}
                        groupedTimeEntries={entriesByStatus.rejected}
                        durationMap={timesheetDetail?.durationMap?.['Rejected']}
                        client_id={timesheetDetail?.client?.id as string}
                        status='Rejected'
                        refetch={refetchTimeSheet}
                        needAction
                      />
                    </div>
                }
              </div>

              <br />
              <Row justify={"end"}>
                <Col className={styles['form-col']}>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="button">
                      Save and Exit
                    </Button>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={onSubmitTimesheet}>
                      Submit
                    </Button>
                  </Space>
                </Col>
              </Row>
              <br />
            </Card>
          </div>
        </Spin>
      }

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
        width={1000}>
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
                onChange={onChangeProjectSelect}>
                {projectData && projectData?.Project?.data.map((project: any, index: number) => (
                  <Option value={project?.id} key={index}>
                    {project?.name}
                  </Option>))}
              </Select>
            </Form.Item>
            <Form.Item
              name={'task'}
              label="Task Name"
              rules={[{
                required: true,
                message: 'Choose the task'
              }]}>
              <Select placeholder="Select Task">
                {filteredTasks && filteredTasks?.map((task: any, index: number) => (
                  <Option value={task?.id} key={index}>
                    {task?.name}
                  </Option>)
                )}
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
                htmlType="submit">
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
    </>
  )
}

function groupEntriesByTask(entries: TimeEntry[]) {
  function groupByStartDate(array: any) {
    const startDateFn = (entry: any) => moment(entry?.startTime).format('ddd, MMM D');
    return groupBy(array, startDateFn);
  }

  let grouped: any = [];

  const tasks = groupBy(entries, 'task_id');

  for (const [key, _entries] of Object.entries(tasks)) {
    grouped.push({
      id: key,
      name: _entries[0]?.task?.name,
      project: _entries[0]?.project?.name,
      project_id: _entries[0]?.project?.id,
      entries: groupByStartDate(_entries)
    });
  }

  return grouped;
};


export default DetailTimesheet;
