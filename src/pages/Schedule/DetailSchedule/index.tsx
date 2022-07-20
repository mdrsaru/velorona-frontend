import {Fragment, useState} from "react";
import {useParams} from "react-router-dom";
import {Card, Col, Dropdown, Menu, Row,} from "antd";
import PlusCircleFilled from "@ant-design/icons/lib/icons/PlusCircleFilled";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import {MoreOutlined} from "@ant-design/icons";
import moment from "moment";
import _ from "lodash";
import { getWeekDays } from "../../../utils/common";
import PageHeader from "../../../components/PageHeader";
import { WORKSCHEDULEDETAIL } from "../../EmployeeSchedule";
import AddSchedule from "../../../components/AddScheduleDetail";
import AddWorkscheduleEmployee from "../../../components/AddWorkscheduleEmployee";
import AddTimeInterval from "./AddTimeInterval";
import styles from "./style.module.scss";

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

    const startDate = workscheduleDetailData?.WorkscheduleDetail?.data?.[0]?.workschedule?.startDate
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

    const menu = (data: any) => (
      <Menu>
          <Menu.Item key="clear">
              Clear all schedule
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item key="delete">
              Delete Employee
          </Menu.Item>
      </Menu>
    );

    const getTotalSchedule = (group: any) => {
        let count = 0;
        if (group?.length > 0) {
            for(let index in group) {
                count += group[index].workscheduleTimeDetail?.length;
            }
        }
        return count;
    }
    console.log(groups)
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
                                            <th>Total</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                          groups && Object.keys(groups).map(function (key, index) {
                                              return (<tr key={index}>
                                                  <td>{groups[key]?.[0]?.user?.fullName}</td>
                                                  {weekDays.map((day: any, index: number) => (
                                                    <td key={index}>
                                                        {groups[key] && groups[key]?.map((data: any, index: number) =>
                                                            <Fragment key={index}>
                                                                {day === moment(data?.schedule_date).format('YYYY-MM-DD') &&
                                                                  data?.workscheduleTimeDetail?.length > 0 &&
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
                                                        {!groups[key]?.some((data: any) =>
                                                          moment(data?.schedule_date).format('YYYY-MM-DD') === day) &&
                                                          <> - </>}
                                                    </td>
                                                  ))}
                                                  <td key={index}>
                                                      {getTotalSchedule(groups[key])}
                                                  </td>
                                                  <td>

                                                      <div
                                                        className={styles["dropdown-menu"]}
                                                        onClick={(event) => event.stopPropagation()}
                                                      >
                                                          <Dropdown
                                                            overlay={menu(groups[key])}
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
                                                  </td>
                                              </tr>)
                                        })}
                                    </tbody>
                                    <tfoot>
                                        <td>{employee}</td>
                                    </tfoot>

                                </table>
                                <p
                                  onClick={() => setEmployeeShow(!showEmployee)}
                                  className={styles.addEmployee}>
                                    <span style={{ marginRight: '10px', cursor: 'pointer' }}>
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
