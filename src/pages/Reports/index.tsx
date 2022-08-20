import React from 'react'
import { Col, Row } from 'antd'

import EmployeeReport from './EmployeeReport'
import ProjectReport from './ProjectReport'
import EmployeeTimesheetReport from './EmployeeTimesheetReport'
import ClientReport from './ClientReport'
import InvoiceReport from './InvoiceReport'

  const Reports = () => {
  return (
    <Row gutter={[10,10]}>
    <Col span={24} >
      <EmployeeReport />
      </Col>
      <Col span={24} >
      <ProjectReport />
      </Col>
      <Col span={24} >
      <EmployeeTimesheetReport />
      </Col>
      <Col span={24} >
      <ClientReport />
      </Col>
      <Col span={24} >
      <InvoiceReport />
      </Col>
    </Row>
  )
}

export default Reports