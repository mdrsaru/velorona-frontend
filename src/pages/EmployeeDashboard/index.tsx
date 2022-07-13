import React from "react";
import {Col, Row, Typography} from "antd";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import employeesImg from "../../assets/images/employees.svg";
import clientsImg from "../../assets/images/clients.svg";
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
const EmployeeDashboard = () => {

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
        averageHoursData.push({
            label: startDate + ' - ' + endDate,
            value: hour
        })

    })

    const dashboardCount: IDashboardCount[] = [
        {
            title: 'Hours Tracked',
            count: totalHour as number,
            icon: employeesImg
        },
        {
            title: 'Projects Involved',
            count: overallCount?.ProjectInvolvedCount as number,
            icon: clientsImg
        },
        {
            title: 'Active Projects',
            count: overallCount?.ActiveProjectInvolvedCount as number,
            icon: projectsImg
        },
    ];

    const hourLogs = [
      '9:00 AM - 12:00 PM',
      '1:00 PM - 4:00 PM',
      '5:00 PM - 12:00 PM'
    ]

    return (
        <div>
            <Row>
                <Col xs={24} lg={12} className={styles['user-info-col']}>
                    <Typography.Title level={1} className={styles['margin-zero']}>
                        Welcome {authData?.fullName}
                    </Typography.Title>
                    <Typography.Title level={4} className={styles['margin-zero']}>
                        Do not forget to track your time and work.
                    </Typography.Title>
                </Col>
                <Col xs={24} lg={12}>
                    <DashboardCount data={dashboardCount} showIcon={false}/>
                </Col>
            </Row>
            <Row>
                <Col xs={24} lg={12}>
                    <div className={styles['schedule-div']}>
                        <Typography.Title level={3}>Today's Schedule</Typography.Title>
                        <div className={styles['hour-log-div']}>
                            <Typography.Title
                              level={4}
                              style={{color: 'var(--primary-blue)'}}>
                                June 12, 2022
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                Monday
                            </Typography.Text>
                            <br/>
                            <div>
                                {hourLogs.map((log: any, index: number) =>
                                  <div className={styles['hour-log']}>{log}</div>
                                )}
                            </div>

                        </div>
                    </div>
                    <AverageHours
                      averageHoursData={averageHoursData}
                      title={'Hours Tracked Per Week'}
                      caption={'Jan 2022'}
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <ActivityLog
                      user_id={authData?.user?.id as string}
                      title={' Time Tracking History'}
                    />
                </Col>
            </Row>
        </div>
    )
}

export default EmployeeDashboard;