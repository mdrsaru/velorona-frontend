import { Fragment, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactToPrint from 'react-to-print';
import {  Button, Card, Col, message, Row, } from "antd";
import { PlusCircleFilled, DeleteOutlined ,PrinterOutlined ,CalendarOutlined, DownloadOutlined } from "@ant-design/icons";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import moment from "moment";
import _ from "lodash";

import { downloadCSV, getWeekDays } from "../../../utils/common";
import PageHeader from "../../../components/PageHeader";
import { WORKSCHEDULEDETAIL } from "../../EmployeeSchedule";
import AddWorkscheduleEmployee from "../../../components/AddWorkscheduleEmployee";
import SelectWorkscheduleDate from "../../../components/SelectWorkscheduleDate";
import AddTimeInterval from "./AddTimeInterval";
import styles from "./style.module.scss";
import AddNewWorkscheduleDetail from "./AddNewWorkscheduleDetail";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { QueryUserArgs, UserPagingResult } from "../../../interfaces/generated";
import { USER } from "../../Employee";
import { notifyGraphqlError } from "../../../utils/error";
import ModalConfirm from "../../../components/Modal";
import Delete from "../../../components/Delete";
import { authVar } from '../../../App/link';
import { WORKSCHEDULE } from "..";

import './styles.css'
import deleteImg from '../../../assets/images/delete_btn.svg';

export const WORKSCHEDULETIMEDETAIL = gql`
query WorkscheduleTimeDetail($input: WorkscheduleTimeDetailQueryInput!) {
  WorkscheduleTimeDetail(input: $input) {
    paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
    data {
		id
        startTime
        endTime
        duration
        workschedule_detail_id
        workscheduleTimeDetail{
          id
		  startTime		
		  endTime
				
			}
    }
  }
}`

export const WORKSCHEDULE_DETAIL_BULK_DELETE = gql`
  mutation WorkscheduleDetailBulkDelete($input: WorkscheduleDetailBulkDeleteInput!) {
    WorkscheduleDetailBulkDelete(input: $input) {
      id
     schedule_date
    }
  }
`;

const ScheduleDetail = () => {
    const componentRef = useRef()  as React.MutableRefObject<HTMLInputElement>;

    const params = useParams();
    const loggedInUser = authVar()
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showEmployee, setEmployeeShow] = useState(false)
    const [showSelectSchedule, setSelectScheduleShow] = useState(false)
    const [addTimeInterval, setAddTimeInterval] = useState(false)
    const [showAddNewTimeInterval, setShowAddNewTimeInterval] = useState(false)
    const [addNewTimeInterval, setAddNewTimeInterval] = useState<any>({
        employeeName: '',
        providedDate: '',
        employeeId: '',
    });
    const [ids, setIds] = useState([])
    const [workscheduleId, setWorkscheduleId] = useState('')
    const [employee, setEmployee] = useState('')
    const [employeeId, setEmployeeId] = useState('')

    const { data: workscheduleData } = useQuery(
        WORKSCHEDULE,
        {
         fetchPolicy: "network-only",
          nextFetchPolicy: "cache-first",
          variables: {
            input: {
              paging: {
                order: ["updatedAt:DESC"],
              },
              query: {
                company_id: loggedInUser?.company?.id,
                id: params?.sid,
              }
            },
          },
        }
    );


    const { data: workschedule } = useQuery(
        WORKSCHEDULE,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    paging: {
                        order: ["updatedAt:DESC"],
                    },
                    query: {
                        company_id: loggedInUser?.company?.id,
                    }
                },
            },
        }
    );

    const { data: workscheduleDetailData, refetch: refetchWorkscheduleDetail } = useQuery(
        WORKSCHEDULEDETAIL,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    paging: {
                        order: ["updatedAt:ASC"],
                    },
                    query: {
                        workschedule_id: params?.sid
                    }
                },
            },
        }
    );

    const { data: employeeData} = useQuery<
        GraphQLResponse<'User', UserPagingResult>,
        QueryUserArgs
    >(
        USER,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    paging: {
                        order: ["updatedAt:DESC"],
                    },
                    query: {
                        id: employee
                    }
                },
            },
        }
    );

    const [getWorkschedule, { data: workscheduleDetailByIdData }] = useLazyQuery(
        WORKSCHEDULEDETAIL,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    paging: {
                        order: ["updatedAt:ASC"],
                    },
                    query: {
                        id: workscheduleId
                    }
                },
            },
        }
    );

    const [workscheduleBulkDelete, { loading: deleting }] = useMutation(WORKSCHEDULE_DETAIL_BULK_DELETE, {
        onCompleted() {
            message.success({
                content: `Workschedule Detail is deleted successfully!`,
                className: "custom-message",
            });
            refetchWorkscheduleDetail({
                input: {
                    paging: {
                        order: ["updatedAt:ASC"],
                    },
                    query: {
                        workschedule_id: params?.sid
                    }
                },

            })
            setShowDeleteModal(false);

        },
        onError(err) {
            setShowDeleteModal(false);
            notifyGraphqlError(err);
        }
    })

    const startDate = workscheduleData?.Workschedule?.data?.[0]?.startDate;
    const weekDays = getWeekDays(startDate);
    const workscheduleDetail = workscheduleDetailData?.WorkscheduleDetail?.data;
    const groups: any = _.groupBy(workscheduleDetail, 'user.fullName')

    const handleChange = (id: any) => {
        setWorkscheduleId(id);
        setAddTimeInterval(!addTimeInterval)
        getWorkschedule({
            variables: {
                input: {
                    paging: {
                        order: ["updatedAt:ASC"],
                    },
                    query: {
                        id: id
                    }
                },
            },
        })
    }

    const handleNewTimeIntervalAddition = (id: number) => {
        setShowAddNewTimeInterval(true);
        // setEmployee('')
        setAddNewTimeInterval({
            employeeId: employeeData?.User?.data?.[0]?.id,
            employeeName: employeeData?.User?.data?.[0]?.fullName,
            providedData: weekDays[id]
        })
    }

    const handleNewWorkschedule = (id: string, fullName: string, day: Date) => {
        setShowAddNewTimeInterval(true);
        setAddNewTimeInterval({
            employeeId: id,
            employeeName: fullName,
            providedData: day
        })
    }
    function getEntryIdsFromGroup(group: any): string[] {
        const ids: string[] = [];
        for (let id in group) {
            ids.push(group[id].id)

        }

        return ids;
    }

    const deleteWorkscheduleDetails = () => {
        workscheduleBulkDelete({

            variables: {
                input: {
                    ids: ids,
                    user_id: employeeId,
                    workschedule_id: params.sid,
                }
            }
        })
    }
    const handleDeleteClick = (data: any) => {
        const ids: any = getEntryIdsFromGroup(data);
        setEmployeeId(data?.[0]?.user?.id)
        setIds(ids)
        setShowDeleteModal(!showDeleteModal)

    }

    const handleCopySchedule = (id: any) => {
        setEmployeeId(id)
        setSelectScheduleShow(!showSelectSchedule)
    }
    // const menu = (data: any) => (
    //     <Menu>
    //         <Menu.Item key="clear" onClick={() => handleDeleteClick(data)}>
    //             Clear all schedule
    //         </Menu.Item>
    //         <Menu.Divider />
    //         {/* <Menu.Item key="delete" >
    //             Delete Employee
    //         </Menu.Item> */}
    //     </Menu>
    // );

    const getTotalSchedule = (group: any) => {
        let count = 0;
        if (group?.length > 0) {
            for (let index in group) {
                count += group[index].duration;
            }
        }
        let hour = (count / 3600).toFixed(2);
        return hour;
    }

    const tableHeader = () => {
      let title: Array<{ label: string; key: string; subKey?: string }> = [
        { label: 'Employee Name', key: 'username' },
        { label: 'Designation', key: 'designation' },
      ];
  
      weekDays.map((day: any, index: number) =>
        title.push({
          label: `${moment(day).format('ddd, MMM D').replace(',', '-')}`,
          key: 'timeSheetBody',
          subKey: `${index}`,
        })
      );
      title.push({ label: 'Total', key: 'total' });
  
      return title;
    };

    const tableBody = () => {
      const tableRows = [];
  
      for (const property in groups) {
        const username = groups && groups[property][0]?.user?.fullName;
        const designation = groups && (groups[property][0]?.user?.designation ?? '-');
        const total = getTotalSchedule(groups[property]);
        const timeSheetBodyPart =
          groups &&
          Object.keys(groups).map((key) => {
            return weekDays.map(
              (day) =>
                groups[property] &&
                groups[property]?.map((data: any) => {
                  return (
                    day === moment(data?.schedule_date).format('YYYY-MM-DD') &&
                    data?.workscheduleTimeDetail?.length > 0 &&
                    data?.workscheduleTimeDetail?.map(
                      (timeData: any) => `${moment(timeData?.startTime).utc().format('HH:mm') || ''}-${
                          moment(timeData?.endTime).utc().format('HH:mm') || ''
                        }`
                    )[0]
                  );
                })[0]
            );
          }); 
        const timeSheetBody = timeSheetBodyPart[0]?.map((item:string)=>item || '-');
        tableRows.push({ username, designation, total, timeSheetBody: Object.assign({}, timeSheetBody) });
      }
      return tableRows;
    };
  
    const downloadReport = () => {
      const csvHeader = tableHeader();
      const csvBody = tableBody();
      downloadCSV(csvBody, csvHeader, 'ScheduleTable.csv');
    };

    return (
      <>
        <div className={styles['main-div']}>
          <Card bordered={false}>
            <PageHeader
              title={`Scheduling ( ${moment(workscheduleData?.Workschedule?.data?.[0]?.startDate).format(
                'MMM DD'
              )} -${moment(workscheduleData?.Workschedule?.data?.[0]?.endDate).format('MMM DD')} )`}
            />
            <Row className='container-row'>
              <Col span={24}>
                <div ref={componentRef} className={styles['detail-table']}>
                  <table className={styles['main-table']}>
                    <thead>
                      <tr className={styles['table-header']}>
                        <th>Employee</th>
                        {weekDays.map((day: any, index: number) => (
                          <th key={index}>{moment(day).format('ddd, MMM D')}</th>
                        ))}
                        <th>Total</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groups &&
                        Object.keys(groups).map(function (key, index) {
                          return (
                            <tr key={index}>
                              <td>
                                {groups[key]?.[0]?.user?.fullName}
                                <br />
                                <span>
                                  {groups[key]?.[0]?.user?.designation && `(${groups[key]?.[0]?.user?.designation})`}
                                </span>
                              </td>
                              {weekDays.map((day: any, index: number) => (
                                <td key={index}>
                                  {groups[key] &&
                                    groups[key]?.map((data: any, index: number) => (
                                      <Fragment key={index}>
                                        {day === moment(data?.schedule_date).format('YYYY-MM-DD') &&
                                          data?.workscheduleTimeDetail?.length > 0 &&
                                          data?.workscheduleTimeDetail?.map((timeData: any, index: number) => (
                                            <Fragment key={index}>
                                              <span
                                                onClick={() => handleChange(data?.id)}
                                                style={{ cursor: 'pointer' }}
                                              >
                                                {moment(timeData?.startTime).utc().format('HH:mm')} -
                                                {moment(timeData?.endTime).utc().format('HH:mm')}
                                              </span>
                                              <br />
                                            </Fragment>
                                          ))}
                                      </Fragment>
                                    ))}
                                  {!groups[key]?.some(
                                    (data: any, index: any) => moment(data?.schedule_date).format('YYYY-MM-DD') === day
                                  ) && (
                                    <span
                                      onClick={() =>
                                        handleNewWorkschedule(
                                          groups[key]?.[0]?.user?.id,
                                          groups[key]?.[0]?.user?.fullName,
                                          day
                                        )
                                      }
                                      style={{ cursor: 'pointer' }}
                                    >
                                      {' '}
                                      -{' '}
                                    </span>
                                  )}
                                </td>
                              ))}
                              <td key={index}>{getTotalSchedule(groups[key])}</td>
                              <td>
                                <span
                                  title='Clear all schedule'
                                  className={`${styles['table-icon']} ${styles['table-delete-icon']}`}
                                  onClick={() => handleDeleteClick(groups[key])}
                                >
                                  <DeleteOutlined />
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      {employeeData?.User?.data?.[0]?.fullName && (
                        <tr>
                          <td>
                            {employeeData?.User?.data?.[0]?.fullName}
                            <br />
                            <span>
                              {employeeData?.User?.data?.[0]?.designation &&
                                `(${employeeData?.User?.data?.[0]?.designation})`}
                            </span>
                          </td>
                          {Array.from(Array(7)).map((num: number, index) => (
                            <td
                              key={index}
                              onClick={() => handleNewTimeIntervalAddition(index)}
                              style={{ cursor: 'pointer' }}
                            >
                              -
                            </td>
                          ))}
                          <td></td>
                          <td>
                            <span
                              title='Copy workschedule'
                              className={`${styles['table-icon']} ${styles['table-delete-icon']}`}
                              onClick={() => handleCopySchedule(employeeData?.User?.data?.[0]?.id)}
                            >
                              <CalendarOutlined />
                            </span>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p onClick={() => setEmployeeShow(!showEmployee)} className={styles.addEmployee}>
                  <span style={{ marginRight: '10px' }}>
                    <PlusCircleFilled />
                  </span>
                  Add Employee
                </p>
{/* 
                <ReactToPrint
                  trigger={() => (
                    <Button type='link' icon={<PrinterOutlined />}>
                      Print Schedule
                    </Button>
                  )}
                  content={() => componentRef.current}
                /> */}
              </Col>
              <Col>
                <br />
                <Button icon={<DownloadOutlined />} onClick={downloadReport}>
                  {' '}
                  Download
                </Button>
              </Col>
            </Row>
          </Card>

          <AddTimeInterval
            visibility={addTimeInterval}
            setVisibility={setAddTimeInterval}
            workschedule={workscheduleDetailByIdData}
            getWorkschedule={getWorkschedule}
            setEmployee={setEmployee}
          />

          <AddNewWorkscheduleDetail
            visibility={showAddNewTimeInterval}
            setVisibility={setShowAddNewTimeInterval}
            getWorkschedule={getWorkschedule}
            employeeName={addNewTimeInterval?.employeeName}
            employeeId={addNewTimeInterval?.employeeId}
            providedData={addNewTimeInterval?.providedData}
            refetch={refetchWorkscheduleDetail}
            setEmployee={setEmployee}
          />

          <AddWorkscheduleEmployee
            visibility={showEmployee}
            setVisibility={setEmployeeShow}
            setEmployee={setEmployee}
          />

          <SelectWorkscheduleDate
            visibility={showSelectSchedule}
            setVisibility={setSelectScheduleShow}
            workschedule={workschedule?.Workschedule?.data}
            employeeId={employeeId}
            refetch={refetchWorkscheduleDetail}
            setEmployee={setEmployee}
            startDate={startDate}
          />

          <ModalConfirm
            visibility={showDeleteModal}
            setModalVisibility={setShowDeleteModal}
            imgSrc={deleteImg}
            okText='Delete'
            onOkClick={deleteWorkscheduleDetails}
            loading={deleting}
            modalBody={
              <Delete
                title='Are you sure you want to delete it?'
                subText='All the workschedule details will be deleted.'
              />
            }
          />
        </div>
      </>
    );
}

export default ScheduleDetail;
