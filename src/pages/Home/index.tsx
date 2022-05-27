// import React from "react";
import { 
  Row, 
  Col, 
  // Typography, 
  // Card, 
  // Button, 
  Space, 
  // Table, 
  // Select 
} from 'antd';
// import { columns, data } from "../../utils/dummyData";

import styles from './style.module.scss';


// const { Title } = Typography;
// const { Option } = Select;

const Home = () => {
  return (
    <Space
      direction="vertical"
      className={styles['full-space']}>
      <Row className={styles['dashboard-row']}>
        <Col xs={24} sm={24} md={12} className={styles['dashboard-col']}>
          <div className={styles['main-title']}>
            Welcome Vellorum User!
          </div>
          {/* <div className={styles['sub-text']}>
            Please checkin to confirm your attendance.
          </div> */}
        </Col>
{/*     <Col xs={24} sm={8} md={4}>
          <div className={styles['analytics']}>
            Attendance
            <Title level={2}>95%</Title>
          </div>
        </Col>

        <Col xs={24} sm={8} md={4}>
          <div className={styles['analytics']}>
            Project Involved
            <Title level={2}>12</Title>
          </div>
        </Col>

        <Col xs={24} sm={8} md={4}>
          <div className={styles['analytics']}>
            Active Projects
            <Title level={2}>4</Title>
          </div>
        </Col> */}
      </Row>
      {/* <Row className={styles['dashboard-row']}>
        <Col xs={24} sm={24} md={12} className={styles['dashboard-col']}>
          <Card>
            <Card.Grid
              hoverable={false}
              className={styles['grid-style']}>
              <b>Check-in</b>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['grid-style-second']}>
              <span>Wednesday, February 23, 2022</span>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['grid-style']}>
              <Button type="primary">Check-in</Button>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['grid-style-second']}>
              <p>00:00:00 AM</p>
            </Card.Grid>
          </Card> <br />

          <Card className={styles['leave-report-card']}>
            <Card.Grid
              hoverable={false}
              className={styles['grid-style']}>
              <b>Leave Reports</b>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['grid-style-second']}>
              <p className={styles['request-text']}>Request Leave</p>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['leave-report-table']}>
              <Table
                dataSource={data}
                columns={columns} />
            </Card.Grid>
          </Card>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Card className={styles['attendance-card']}>
            <Card.Grid
              hoverable={false}
              className={styles['full-space']}>
              <b>My Attendance</b>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['drop-option-grid']}>
              <Select placeholder="This Week">
                <Option value="project1">Project 1</Option>
                <Option value="project2">Project 2</Option>
              </Select>
            </Card.Grid>

            <Card.Grid
              hoverable={false}
              className={styles['attendance-table']}>
              <Table
                dataSource={data}
                columns={columns} />
            </Card.Grid>
          </Card>
        </Col>
      </Row> */}
    </Space>
  )
}

export default Home;
