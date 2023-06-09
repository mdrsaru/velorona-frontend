import { Fragment, useEffect, useState } from "react";
import { Col, Empty, Row, Typography } from "antd";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import employeesImg from "../../../assets/images/employees.svg";
import clientsImg from "../../../assets/images/clients.svg";
import projectsImg from "../../../assets/images/projects.svg";
import DashboardCount from "../../../components/Dashboard/DashboardCount";
import { IDashboardCount } from "../../../interfaces/IDashboard";
import AverageHours from "../../../components/Dashboard/AverageHours";
import ActivityLog from "../../../components/Dashboard/ActivityLog";
import { authVar } from "../../../App/link";
import { TIME_WEEKLY } from "../../Timesheet";
import styles from "./styles.module.scss";
import { WORKSCHEDULEDETAIL } from "../../EmployeeSchedule";
import _ from "lodash";


export const COUNT = gql`
query Count($totalDurationInput: TotalDurationCountInput!, $projectInvolvedInput: ProjectCountInput!,$activeProjectCountInput:ActiveProjectCountInput!) {
  TotalDuration(input: $totalDurationInput)
  ProjectInvolvedCount(input: $projectInvolvedInput)
  ActiveProjectInvolvedCount(input:$activeProjectCountInput)
}

`
const EmployeeDashboard = () => {

    const authData = authVar();
    const [date,setDate] = useState(new Date())
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
                        company_id: authData?.company?.id,
                        user_id: authData?.user?.id,
                        weekStartDate: moment(date).startOf('month').format('YYYY/MM/DD'),
                        weekEndDate: moment(date).endOf('month').format("YYYY/MM/DD"),            
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
		const timesheet = timesheetDetail?.Timesheet?.data;
		const timesheetGroups = _.groupBy(timesheet, "weekStartDate");
	
		Object.keys(timesheetGroups).map(function (key) {
			const startDate = moment(timesheetGroups[key]?.[0]?.weekStartDate).format('MMM D');
			const endDate = moment(timesheetGroups[key]?.[0]?.weekEndDate).format('MMM D');
			let totalTimesheetHour: number = 0;
			timesheetGroups[key].forEach((timesheet) => {
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


    const [today, setToday] = useState<any>()
    useEffect(() => {
        const today = new Date();
        const split = today.toISOString().split('T')
        setToday(split?.[0])
    }, [])
    const {
        data: workscheduleDetailData } = useQuery(WORKSCHEDULEDETAIL, {
            fetchPolicy: "network-only",
            nextFetchPolicy: "cache-first",
            variables: {
                input: {
                    query: {
                        schedule_date: today,
                        user_id:authData?.user?.id
                    },
                    paging: {
                    }
                }
            }
        });


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
                    <DashboardCount data={dashboardCount} showIcon={false} />
                </Col>
            </Row>
            <Row>
                <Col xs={24} lg={12}>
                    <div className={styles['schedule-div']}>
                        <Typography.Title level={3}>Today's Schedule</Typography.Title>
                        <div className={styles['hour-log-div']}>
                            <Typography.Title
                                level={4}
                                style={{ color: 'var(--primary-blue)' }}>
                                {moment(today).format('MMM DD,YYYY')}
                            </Typography.Title>
                            <Typography.Text type="secondary">
                                {moment(today).format('ddd')}
                            </Typography.Text>
                            <br />
                            {workscheduleDetailData?.WorkscheduleDetail.data?.length ?
                              <div>
                                    {workscheduleDetailData?.WorkscheduleDetail.data.map((workscheduleDetail: any, index: number) => {
                                        return (
                                            <Fragment key={index}>
                                                {workscheduleDetail?.workscheduleTimeDetail?.map((timeDetail: any, index: number) =>

                                                    <div key={index} className={styles['hour-log']}>{`${moment(timeDetail.startTime).utc().format('HH:mm')} - ${moment(timeDetail.endTime).utc().format('HH:mm')}`}</div>

                                                )
                                                }
                                            </Fragment>
                                        )
                                    }

                                    )}
                                </div>
                                :
                                <Empty description='No Schedule for today' />
                            }
                    </div>
                    </div>
                    <AverageHours
                        averageHoursData={averageHoursData}
                        title={'Hours Tracked Per Week'}
                        caption={'Jan 2022'}
                        setDate = {setDate}
                        employee={true}
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