import React from "react";
import {Col, Row} from "antd";
import employeesImg from "../../../assets/images/employees.svg";
import clientsImg from "../../../assets/images/clients.svg";
import projectsImg from "../../../assets/images/projects.svg";
import DashboardCount from "../../../components/Dashboard/DashboardCount";
import { IDashboardCount} from "../../../interfaces/IDashboard";
import AverageHours from "../../../components/Dashboard/AverageHours";
import TotalExpenses from "../../../components/Dashboard/TotalExpenses";
import ActivityLog from "../../../components/Dashboard/ActivityLog";
import { gql, useQuery } from "@apollo/client";
import { authVar } from "../../../App/link";
import { TIME_WEEKLY } from "../../Timesheet";
import moment from "moment";
import _ from "lodash";


export const COUNT = gql`
query Count($userInput: UserCountInput!, $clientInput: ClientCountInput!,$projectInput:ProjectCountInput!) {
  UserCount(input: $userInput)
  ClientCount(input: $clientInput)
  ProjectCount(input:$projectInput)
}

`
const CompanyAdminDashboard = () => {

  const authData = authVar()

  const { data: overallCount } = useQuery(
    COUNT,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        userInput: {
          company_id: authData?.company?.id as string
        },
        clientInput: {
          company_id: authData?.company?.id as string
        },
        projectInput: {
          company_id: authData?.company?.id as string
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


  let averageHoursData: any = [];
  let totalExpensesData: any = [];

  const timesheet = timesheetDetail?.Timesheet?.data;
  const timesheetGroups = _.groupBy(timesheet, "weekStartDate");

  Object.keys(timesheetGroups).forEach(function (key) {
    const startDate = moment(timesheetGroups[key]?.[0]?.weekStartDate).format('MMM D');
    const endDate = moment(timesheetGroups[key]?.[0]?.weekEndDate).format('MMM D');
    let totalTimesheetHour: number = 0;
    let totalExpense = 0;
    timesheetGroups[key].forEach((timesheet) => {
      const hour = secondsToHms(timesheet.duration);
      totalTimesheetHour = totalTimesheetHour + parseFloat(hour);
      totalExpense = totalExpense + timesheet.totalExpense
    })
    averageHoursData.push({
      label: startDate + ' - ' + endDate,
      value: totalTimesheetHour
    })

    totalExpensesData.push({
      label: startDate + ' - ' + endDate,
      value: totalExpense
    })
  })


  const dashboardCount: IDashboardCount[] = [
    {
      title: 'Users',
      count: overallCount?.UserCount as number,
      icon: employeesImg
    },
    {
      title: 'Client',
      count: overallCount?.ClientCount as number,
      icon: clientsImg
    },
    {
      title: 'Projects',
      count: overallCount?.ProjectCount as number,
      icon: projectsImg
    },
  ];

  return (
    <div>
      <DashboardCount data={dashboardCount}/>
      <Row>
        <Col xs={24} lg={12}>
          <AverageHours
            averageHoursData={averageHoursData}
            title = {'Average Hours Tracked'}
            caption={'Jan 2022'}
          />
          <TotalExpenses totalExpensesData={totalExpensesData} caption={'Jan 2022'}/>
        </Col>
        <Col xs={24} lg={12}>
          <ActivityLog title='Activity Log'/>
        </Col>
      </Row>
    </div>
  )
}

export default CompanyAdminDashboard;