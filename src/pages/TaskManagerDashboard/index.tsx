import React from "react";
import {Col, Row, Typography} from "antd";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import employeesImg from "../../assets/images/employees.svg";
import hourGlassImg from "../../assets/images/hour-glass.svg";
import projectsImg from "../../assets/images/projects.svg";
import DashboardCount from "../../components/Dashboard/DashboardCount";
import { IDashboardCount } from "../../interfaces/IDashboard";
import AverageHours from "../../components/Dashboard/AverageHours";
import ActivityLog from "../../components/Dashboard/ActivityLog";
import { authVar } from "../../App/link";
import { TIME_WEEKLY } from "../Timesheet";
import styles from "./styles.module.scss";


export const COUNT = gql`
query Count($totalDurationInput: TotalDurationCountInput!, $projectInvolvedInput: ProjectCountInput!,$activeProjectCountInput:ActiveProjectCountInput!) {
  TotalDuration(input: $totalDurationInput)
  ProjectInvolvedCount(input: $projectInvolvedInput)
  ActiveProjectInvolvedCount(input:$activeProjectCountInput)
}

`
const TaskManagerDashboard = () => {

    const authData = authVar();

    const { data: overallCount } = useQuery(
        COUNT,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                totalDurationInput: {
                    company_id: authData?.company?.id as string,
                    user_id: authData.user.id
                },
                projectInvolvedInput: {
                    company_id: authData?.company?.id as string,
                    user_id: authData.user.id
                },
                activeProjectCountInput: {
                    company_id: authData?.company?.id as string,
                    user_id: authData.user.id
                },
            },
        }
    );
    const {
        data: timesheetDetail } = useQuery(TIME_WEEKLY, {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    query: {
                        company_id: authData?.company?.id
                    },
                    paging: {
                        order: ['weekStartDate:DESC']
                    }
                }
            }
        });

    function secondsToHms(d: any) {
        d = Number(d);
        let h = d / 3600;

        return h.toFixed(2)
    }
    const totalHour: any = secondsToHms(overallCount?.TotalDuration)

    let averageHoursData: any = [];
    timesheetDetail?.Timesheet?.data?.map((timesheet: any, index: number) => {
        const startDate = moment(timesheet?.weekStartDate).format('MMM D');
        const endDate = moment(timesheet?.weekEndDate).format('MMM D');
        const hour = secondsToHms(timesheet.duration)
        return averageHoursData.push({
            label: startDate + ' - ' + endDate,
            value: hour
        })

    })

    const dashboardCount: IDashboardCount[] = [
        {
            title: 'Team Members',
            count:  overallCount?.ProjectInvolvedCount as number,
            icon: employeesImg
        },
        {
            title: 'Active Projects',
            count: overallCount?.ActiveProjectInvolvedCount as number,
            icon: projectsImg
        },
        {
            title: 'Hours Tracked',
            count: totalHour as number,
            icon: hourGlassImg
        },
    ];

    return (
        <div>
            <DashboardCount data={dashboardCount}/>
            <Row>
                <Col xs={24} lg={12}>
                    <div className={styles['timesheet-div']}>
                        <div className={styles['pending-timesheet']}>
                            <Typography.Title
                              level={4}
                              style={{color: 'var(--primary-blue)'}}>
                                You have 26 Pending Timesheet
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Last Updated on Feb 23, 2022
                            </Typography.Text>
                            <br/>

                        </div>
                    </div>
                    <AverageHours
                      averageHoursData={averageHoursData}
                      title={'Average Time Tracked by Employee'}
                      caption={'Jan 2022'}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <ActivityLog
                      user_id={authData?.user?.id as string}
                      title={' Activities Log'}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default TaskManagerDashboard;