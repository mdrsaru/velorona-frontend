
import { Card, Col, Row, } from "antd";

import styles from "./style.module.scss";
import PageHeader from "../../../components/PageHeader";
import { useParams } from "react-router-dom";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import moment from "moment";
import { getWeekDays } from "../../../utils/common";
import _ from "lodash";
import { WORKSCHEDULEDETAIL } from "../../EmployeeSchedule";
import {Fragment, useState} from "react";
import AddSchedule from "../../../components/AddScheduleDetail";
import AddWorkscheduleEmployee from "../../../components/AddWorkscheduleEmployee";
import PlusCircleFilled from "@ant-design/icons/lib/icons/PlusCircleFilled";
import AddTimeInterval from "./AddTimeInterval";

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
const ScheduleDetail = () => {
    const params = useParams();

    const [showSchedule, setScheduleShow] = useState(false)
    const [showEmployee, setEmployeeShow] = useState(false)
    const [addTimeInterval, setAddTimeInterval] = useState(false)
    const [workscheduleId, setWorkscheduleId] = useState('')
    const [employee, setEmployee] = useState('')
    const { data: workscheduleDetailData } = useQuery(
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

    const startDate = workscheduleDetailData?.WorkscheduleDetail?.data?.[0]?.workshedule?.startDate
    const weekDays = getWeekDays(startDate);

    const workscheduleDetail = workscheduleDetailData?.WorkscheduleDetail?.data;
    const group: any = _.groupBy(workscheduleDetail, 'user.fullName')

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
    return (
        <>
            <div className={styles['main-div']}>
                <Card bordered={false}>
                    <PageHeader
                        title="Scheduling"

                    />
                    <Row className='container-row'>
                        <Col span={24}>
                            <div className={styles['detail-table']}>
                                <table className={styles['main-table']}>
                                    <thead>
                                        <tr className={styles['table-header']}>
                                            <th>Employee</th>
                                            {
                                                weekDays.map((day: any, index: number) => (
                                                  <th key={index}>
                                                      {moment(day).format('ddd, MMM D')}
                                                  </th>
                                                ))
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <td>{group?.[0]?.user?.fullName}</td>
                                        {
                                            weekDays.map((day: any, index: number) => (
                                              <td key={index}>
                                                  {group && group?.map((data: any, index: number) =>
                                                      <Fragment key={index}>
                                                          {day === moment(data?.date).format('YYYY-MM-DD') &&
                                                          data?.workscheduleTimeDetail.length > 0 &&
                                                            data?.workscheduleTimeDetail?.map((timeData: any,
                                                                                               index: number) =>
                                                              <Fragment key={index}>
                                                                  <span>
                                                                  {moment(timeData?.startTime).format('HH:MM')} -
                                                                      {moment(timeData?.endTime).format('HH:MM')}
                                                                  </span>
                                                                  <br/>
                                                              </Fragment>
                                                          )}
                                                      </Fragment>
                                                  )}
                                                  {!group.some((data: any) =>
                                                    moment(data?.date).format('YYYY-MM-DD') === day) && <> - </>}
                                              </td>
                                            ))
                                        }
                                    </tbody>
                                    <tfoot>
                                        <td>{employee}</td>
                                    </tfoot>

                                </table>
                                <p
                                  onClick={() => setEmployeeShow(!showEmployee)}
                                  className={styles.addEmployee}>
                                    <span style={{ marginRight: '10px' }}>
                                        <PlusCircleFilled />
                                    </span>
                                    Add Employee
                                </p>
                            </div>

                        </Col>
                    </Row>
                </Card>

                <AddTimeInterval
                    visibility={addTimeInterval}
                    setVisibility={setAddTimeInterval}
                    workschedule={workscheduleDetailByIdData}
                    getWorkschedule={getWorkschedule}
                     />

                <AddWorkscheduleEmployee
                    visibility={showEmployee}
                    setVisibility={setEmployeeShow}
                    setEmployee={setEmployee} />

                <AddSchedule
                    visibility={showSchedule}
                    setVisibility={setScheduleShow} />
            </div>
        </>
    )
}

export default ScheduleDetail;
