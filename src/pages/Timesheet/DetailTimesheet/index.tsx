import moment from 'moment';
import { useRef, useState } from 'react';
import { gql, useLazyQuery, useQuery, useMutation, NetworkStatus } from '@apollo/client';
import {
  useParams,
  Link,
  useNavigate
} from 'react-router-dom';
import groupBy from 'lodash/groupBy';
import find from 'lodash/find';
import { Card, Col, Row, Button, Space, message, Modal, Form, Select, Spin, Popconfirm, Collapse, Dropdown, Menu } from 'antd';
import {
  CloseOutlined,
  PlusCircleFilled,
  MoreOutlined,
} from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { _cs, checkRoles } from '../../../utils/common';
import routes from '../../../config/routes';
import { notifyGraphqlError } from "../../../utils/error";
import constants from "../../../config/constants";
import { TimeEntry, QueryTimesheetArgs, TimeSheetPagingResult, MutationTimeEntriesApproveRejectArgs, AttachedTimesheet, MutationAttachedTimesheetDeleteArgs } from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { TASK } from '../../Tasks';
import { PROJECT } from '../../Project';
import { IGroupedTimeEntries } from '../../../interfaces/common.interface';

import TimeSheetLoader from '../../../components/Skeleton/TimeSheetLoader';
import TimesheetInformation from './TimesheetInformation';
import PageHeader from '../../../components/PageHeader';
import TimeEntryDetail from './TimeEntryDetail';
import InvoiceViewer from '../../../components/InvoiceViewer';


import deleteImg from '../../../assets/images/delete_btn.svg';

import styles from './style.module.scss';
import NoContent from '../../../components/NoContent';
import { Table } from 'antd';
import AttachNewTimesheetModal from '../../../components/AddAttachedTimesheet';
import DeleteBody from '../../../components/Delete/index';
import ModalConfirm from '../../../components/Modal';
import EditAttachedTimesheet from '../../../components/EditAttachedTimesheet';

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
        status
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


export const ATTACHED_TIMESHEET = gql`
  query AttachedTimesheet($input: AttachedTimesheetQueryInput!) {
    AttachedTimesheet(input: $input){
    data{
          id 
          description
          createdAt
          company{
          id
          name
          }
          attachments{
          id
          url
          name
          }
          timesheet{
          id 
          duration 
          }
      }
     paging{
          total
          startIndex
          endIndex
          hasNextPage
     }     
    }
  }
`;

export const ATTACHED_TIMESHEET_DELETE = gql`
  mutation AttachedTimesheetDelete($input: DeleteInput!) {
    AttachedTimesheetDelete(input: $input) {
      id
    }
  }
`;

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
  const roles = authData?.user?.roles ?? []
  const [form] = Form.useForm()
  const [filteredTasks, setTasks] = useState([])
  const [submitTimesheet, { loading: submittingTimesheet }] = useMutation(TIMESHEET_SUBMIT)

  const [invoiceViewer, setInvoiceViewer] = useState<{
    isVisible: boolean,
    invoice_id: string | undefined;
  }>({
    isVisible: false,
    invoice_id: undefined,
  })

  const [showAttachTimeEntry, setAttachTimeEntry] = useState(false)

  const entriesByStatusRef = useRef<any>({});

  const [invoicedTimeEntries, setInvoicedTimeEntries] = useState<InvoicedTimeEntries[]>([])
  const [entriesByStatus, setEntriesByStatus] = useState<EntriesByStatus>({
    approved: [],
    pending: [],
    rejected: [],
  });

  /** Modal Visibility **/
  const [showAddNewEntry, setShowAddNewEntry] = useState<boolean>(false);

  const [deleteVisibility, setDeleteVisibility] = useState<boolean>(false);

  const [editAttachedVisibility, setEditAttachedVisibility] = useState<boolean>(false);

  const [attachedTimesheet, setAttachedTimesheet] = useState<any>()

  const canApproveReject = checkRoles({
    expectedRoles: [constants.roles.SuperAdmin, constants.roles.CompanyAdmin, constants.roles.TaskManager],
    userRoles: roles,
  });

  const canAttachedTimesheet = checkRoles({
    expectedRoles: [constants.roles.Employee],
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
      const taskIds = entriesByStatus?.pending.map((timesheet: any) => {
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
    const ids = entriesByStatus.pending?.map((timesheet: any) => {
      return timesheet?.id
    })

    if (!ids.includes(task[0]?.id)) {
      setEntriesByStatus({ ...entriesByStatus, pending: [...entriesByStatus.pending, timeEntry] });
    };

    setShowAddNewEntry(false);
    form.resetFields();
  }

  const { data: attachedTimesheetData } = useQuery(ATTACHED_TIMESHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          created_by: authData?.user?.id,
          timesheet_id: timesheet_id
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [attachedTimesheetDelete, { loading }] = useMutation<GraphQLResponse<'AttachedTimesheetDelete', AttachedTimesheet>, MutationAttachedTimesheetDeleteArgs>(ATTACHED_TIMESHEET_DELETE, {
    onCompleted() {
      message.success({
        content: `Attached Timesheet is deleted successfully!`,
        className: "custom-message",
      });
      setDeleteVisibility(false);
    },
    onError(err) {
      setDeleteVisibility(false);
      notifyGraphqlError(err);
    },

    update(cache) {
      const normalizedId = cache.identify({ id: attachedTimesheet?.id, __typename: "AttachedTimesheet" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

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

  const { data: timeSheetDetail, loading: timesheetLoading, refetch: refetchTimeSheet, networkStatus } = useQuery<
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
            },
            paging: {
              order: ['updatedAt:DESC']
            }
          }
        }
      }).then(r => { })
    }
  })

  console.log(entriesByStatus, 'entries')

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


  const attachNewTimesheet = () => {
    setAttachTimeEntry(!showAttachTimeEntry)
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
    const admin = checkRoles({
      expectedRoles: [constants.roles.CompanyAdmin, constants.roles.SuperAdmin, constants.roles.TaskManager],
      userRoles: roles,
    })

    if (admin) {
      navigate(routes.employeeTimesheet.path(authData?.company?.code as string))
    } else {
      navigate(routes.timesheet.path(authData?.company?.code as string))
    }
  }

  const deletePendingGroups = (id: string) => {
    const filteredPendingArray = entriesByStatus?.pending?.filter(entry => entry?.id !== id)
    setEntriesByStatus({ ...entriesByStatus, pending: filteredPendingArray });
  }

  const timesheetDetail = timeSheetDetail?.Timesheet?.data[0];
  const deleteAttachedTimesheet = () => {
    attachedTimesheetDelete({
      variables: {
        input: {
          id: attachedTimesheet?.id
        }
      }
    })
  }



  const onSubmitAttachedTimesheet = () => {

  }

  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="edit">
        <div onClick={() => {
          setEditAttachedVisibility(true);
          setAttachedTimesheet(data);
        }}>
          Edit Timesheet Attachments
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4">
        <div onClick={() => {
          setDeleteVisibility(true);
          setAttachedTimesheet(data);
        }}
        >
          Delete Timesheet Attachments
        </div>
      </Menu.Item>

    </Menu>
  );

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      width:'30%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (date: any) => {
        return (
          <span>{date.split('T')?.[0]}</span>
        )
      }
    },
    {
      title: 'Attachment',
      key: 'attachments',
      dataIndex: 'attachments',
      render: (attachments: any) => {
        return (
          <span style={{ color: 'var(--primary-blue)' }}>{attachments?.name}</span>
        )
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (attachedTimesheet: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Dropdown
            overlay={menu(attachedTimesheet)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ paddingLeft: "1rem" }}
            >
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];


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
                      deleteAction={deletePendingGroups}
                      needAction
                      timesheet_id={timesheet_id}
                    />

                    {
                      canApproveReject && (
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
                  checkRoles({
                    expectedRoles: [constants.roles.CompanyAdmin],
                    userRoles: roles,
                  }) && invoicedTimeEntries.map((invoiced) => (
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
                      timesheet_id={timesheet_id}
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
                      timesheet_id={timesheet_id}
                    />
                  </div>
                }
              </div>

              <br />
              {(!timeSheetDetail?.Timesheet?.data[0]?.entriesGroup?.byStatus.length &&
                !timeSheetDetail?.Timesheet?.data[0]?.entriesGroup?.byInvoice.length) ?
                <NoContent title={'No Time Entry added'} subtitle={'There are no entries added at the moment'} /> :
                <Row justify={"end"}>
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
                        checkRoles({
                          expectedRoles: [constants.roles.Employee],
                          userRoles: roles,
                        }) && (
                          <Popconfirm
                            placement="top"
                            title="Submit timesheet?"
                            onConfirm={onSubmitTimesheet}
                            okText="Yes" cancelText="No"
                          >
                            <Button
                              type="default"
                              htmlType="button"
                              loading={submittingTimesheet}
                            >
                              Submit
                            </Button>
                          </Popconfirm>

                        )
                      }
                    </Space>
                  </Col>
                </Row>}
              <br />
            </Card>
          </div>
        </Spin>
      }

      {canAttachedTimesheet &&
        (<div className={styles['site-card-wrapper']}>
          <Card className={styles['attach-approved-timesheet']}>
            <Collapse accordion defaultActiveKey={['2']}>
              <Panel header="Attach Approved Timesheet" key="2" className={styles['attachApprovedTitle']}>
                <Table
                  dataSource={attachedTimesheetData?.AttachedTimesheet?.data}
                  columns={columns}
                  pagination={false}
                />
                <p className={styles['attach-new-timesheet']} onClick={attachNewTimesheet}>
                  <PlusCircleFilled />
                  <span style={{ marginLeft: '1rem' }}>  Attach New Timesheet
                  </span>
                </p>
                <br />
                <Row justify={"end"}>
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
                        checkRoles({
                          expectedRoles: [constants.roles.Employee],
                          userRoles: roles,
                        }) && (
                          <Popconfirm
                            placement="top"
                            title="Submit timesheet?"
                            onConfirm={onSubmitAttachedTimesheet}
                            okText="Yes" cancelText="No"
                          >
                            <Button
                              type="default"
                              htmlType="button"
                              loading={submittingTimesheet}
                            >
                              Submit
                            </Button>
                          </Popconfirm>

                        )
                      }
                    </Space>
                  </Col>
                </Row>
              </Panel>
            </Collapse>
          </Card>
        </div>
        )}
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

      <AttachNewTimesheetModal
        visibility={showAttachTimeEntry}
        setVisibility={setAttachTimeEntry}
        timesheet_id={timesheet_id} />


      <EditAttachedTimesheet
        visibility={editAttachedVisibility}
        setVisibility={setEditAttachedVisibility}
        data={attachedTimesheet}
      />

      <ModalConfirm
        visibility={deleteVisibility}
        setModalVisibility={setDeleteVisibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        closable
        modalBody={
          <DeleteBody
            title={
              <>
                Are you sure you want to delete it?{" "}
                {/* <strong> {project?.name}</strong> */}
              </>
            }
            subText={`All the data associated with this will be deleted permanently.`}
          />
        }
        onOkClick={deleteAttachedTimesheet}
      />
    </>
  )
}

function groupEntriesByProject(entries: TimeEntry[]) {
  function groupByStartDate(array: any) {
    const startDateFn = (entry: any) => moment(entry?.startTime).format('ddd, MMM D');
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
