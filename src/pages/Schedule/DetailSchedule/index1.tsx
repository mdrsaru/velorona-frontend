
import { Card, Col, Row, } from "antd";

import styles from "./style.module.scss";
import PageHeader from "../../../components/PageHeader";
import { useParams } from "react-router-dom";
import { authVar } from "../../../App/link";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import { getWeekDays } from "../../../utils/common"
import { WORKSCHEDULEDETAIL } from "../../EmployeeSchedule";
import _ from "lodash";

const ScheduleDetail = () => {
    const params = useParams();

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
    const startDate = workscheduleDetailData?.WorkscheduleDetail?.data?.[0]?.workshedule?.startDate
    const weekDays = getWeekDays(startDate);

    const workscheduleDetail = workscheduleDetailData?.WorkscheduleDetail?.data;

    const group: any = _.groupBy(workscheduleDetail, 'user.fullName')

    const group1: any = _.groupBy(workscheduleDetail,'date')

    let grouped: any;
    Object.entries(group).map(([key, value]) => {
        // console.log(group[key])
        // group1 = _.groupBy(group[key], 'date')
        // console.log(group1)
//         let grouped = _.groupBy(group, (b)=>{
//             console.log(b)
// return b.date
//         })

       
    });
   
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
                                                    <>
                                                        <th key={index}>
                                                            {moment(day).format('ddd, MMM D')}
                                                        </th>

                                                    </>
                                                ))
                                            }

                                        </tr>
                                    </thead>
                                    <tbody>
                                        
                                        {
                                            group1 && Object.keys(group1).map(function (key, index) {
                                                // console.log(group1[key])
                                                return <>
                                                    {/* <td>{group1[key]?.[0]?.user?.fullName}</td> */}


                                                    {weekDays.map((day: any, timeIndex: number) => {
                                                        // console.log(moment(day),'dayyy')
                                                        // console.log(moment(key).format('YYYY-MM-DD') === day)
                                                        return <td>
                                                           { group1[key]?.timeDetail}
                                                        </td>
                                                    })}
                                                </>
                                            })
                                        }

                                    </tbody>
                                </table>
                            </div>

                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    )
}

export default ScheduleDetail;
