import React from "react";
import { Col, Row } from "antd";
import employeesImg from "../../assets/images/employees.svg";
import clientsImg from "../../assets/images/clients.svg";
import DashboardCount from "../../components/Dashboard/DashboardCount";
import { IDashboardCount } from "../../interfaces/IDashboard";
import { gql, useQuery } from "@apollo/client";
import CompanyGrowth from '../../components/CompanyGrowth/index';


export const COUNT = gql`
query Count($companyCount: CompanyCountInput!, $userCount: UserCountByAdminInput!) {
  CompanyCount(input: $companyCount)
  UserCountByAdmin(input: $userCount)
}

`

export const COMPANY_GROWTH = gql`
query CompanyGrowth($input:CompanyCountInput){
      CompanyGrowth(input:$input){
      count,
      createdAt
}
}
`
const SuperAdminDashboard = () => {

  const { data: overallCount } = useQuery(
    COUNT,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        companyCount: {},
        userCount: {},
      },
    }
  );

  const { data: companyGrowthData } = useQuery(
    COMPANY_GROWTH,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {}
      },
    }
  );


  let companyGrowthList: any = [];

  companyGrowthData?.CompanyGrowth?.map((companyGrowth: any, index: number) => {
    const month = new Date(companyGrowth?.createdAt).toLocaleString('en-us', { month: 'short' })
    return companyGrowthList.push({ label: month, value: companyGrowth?.count })

  })
  const dashboardCount: IDashboardCount[] = [
    {
      title: 'Companies',
      count: overallCount?.CompanyCount as number,
      icon: employeesImg
    },
    {
      title: 'Users',
      count: overallCount?.UserCountByAdmin as number,
      icon: clientsImg
    },
  ];

  return (
    <div>
      <DashboardCount data={dashboardCount} />
      <Row>
        <Col xs={24} lg={12}>
          <CompanyGrowth totalExpensesData={companyGrowthList} caption={'2022'} />
        </Col>
      </Row>
    </div>
  )
}

export default SuperAdminDashboard;