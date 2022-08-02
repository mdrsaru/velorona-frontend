import React from "react";
import { Col, Row, Typography } from "antd";
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
import styles from "./styles.module.scss";
import _ from "lodash";


export const COUNT = gql`
query Count($userCountInput: UserCountInput!, $totalDurationInput: TotalDurationCountInput!,$activeProjectCountInput:ActiveProjectCountInput!, $timesheetCountInput:TimesheetCountInput) {
  UserCount(input: $userCountInput)
  TotalDuration(input: $totalDurationInput)
  ActiveProjectInvolvedCount(input:$activeProjectCountInput)
  TimesheetCount(input:$timesheetCountInput)
}

`

export const TIME_WEEKLY_MANAGER = gql`
query TimesheetByManager($input: TimesheetCountInput!) {
    TimesheetByManager(input: $input) {
    
      id
      weekStartDate
      weekEndDate
      totalExpense
      duration
  }
}`;

const TaskManagerDashboard = () => {
    const authData = authVar();

    const { data: overallCount } = useQuery(
        COUNT,
        {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                userCountInput: {
                    company_id: authData?.company?.id as string,
                    manager_id: authData.user.id
                },
                totalDurationInput: {
                    company_id: authData?.company?.id as string,
                    manager_id: authData.user.id
                },
                activeProjectCountInput: {
                    company_id: authData?.company?.id as string,
                    manager_id: authData.user.id
                },
                timesheetCountInput: {
                    company_id: authData?.company?.id as string,
                    manager_id: authData.user.id
                },
            },
        }
    );

        const {
            data: timesheetDetail } = useQuery(TIME_WEEKLY_MANAGER, {
                fetchPolicy: "network-only",
                nextFetchPolicy: "cache-first",
                variables: {
                    input: {
                            company_id: authData?.company?.id,
                            manager_id:authData?.user?.id
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

    const timesheet = timesheetDetail?.TimesheetByManager;
    const timesheetGroups = _.groupBy(timesheet, "weekStartDate");

    Object.keys(timesheetGroups).map(function (key) {
        const startDate = moment(timesheetGroups[key]?.[0]?.weekStartDate).format('MMM D');
        const endDate = moment(timesheetGroups[key]?.[0]?.weekEndDate).format('MMM D');
        let totalTimesheetHour: number = 0;
        timesheetGroups[key].map((timesheet) => {
            const hour = secondsToHms(timesheet.duration);
            totalTimesheetHour = totalTimesheetHour + parseFloat(hour);
        })
        return averageHoursData.push({
            label: startDate + ' - ' + endDate,
            value: totalTimesheetHour
        })
    })


    const dashboardCount: IDashboardCount[] = [
        {
            title: 'Team Members',
            count: overallCount?.UserCount as number,
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
            <DashboardCount data={dashboardCount} />
            <Row>
                <Col xs={24} lg={12}>
                    <div className={styles['timesheet-div']}>
                        <div className={styles['pending-timesheet']}>
                            <Typography.Title
                                level={4}
                                style={{ color: 'var(--primary-blue)' }}>
                                You have {overallCount?.TimesheetCount} Pending Timesheet
                            </Typography.Title>
                            <br />

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
                        title={' Activities Log'}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default TaskManagerDashboard;