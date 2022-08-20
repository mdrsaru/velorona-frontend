import { Row, Col } from 'antd';
import React from 'react';
import CompanyReport from './CompanyReport';
import PaymentReport from './PaymentReport';

const ReportsAdmin = () => {
  return (
    <div>
      <Row gutter={[10, 20]}>
        <Col span={24}>
          <CompanyReport />
        </Col>
        <Col span={24}>
          <PaymentReport />
        </Col>
      </Row>
    </div>
  );
};

export default ReportsAdmin;
