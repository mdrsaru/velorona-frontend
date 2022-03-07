import React from 'react';
import { Card, Col, Row, Table } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import styles from "../style.module.scss";

const dataSource = [
  {
    key: '1',
    project: 'Mike',
    task: 32,
    start_time: '10 Downing Street',
    end_time: 'Downing Street',
    total_hours: '4hrs'
  },
  {
    key: '2',
    project: 'Mike',
    task: 32,
    start_time: '10 Downing Street',
    end_time: 'Downing Street',
    total_hours: '5hrs'
  },
  {
    key: '3',
    project: 'Mike',
    task: 32,
    start_time: '10 Downing Street',
    end_time: 'Downing Street',
    total_hours: '4hrs'
  },
  {
    key: '4',
    project: 'Mike',
    task: 32,
    start_time: '10 Downing Street',
    end_time: 'Downing Street',
    total_hours: '5hrs'
  },
];

const columns = [
  {
    title: 'Project',
    dataIndex: 'project',
    key: 'project',
  },
  {
    title: 'Task',
    dataIndex: 'task',
    key: 'task',
  },
  {
    title: 'Start Time',
    dataIndex: 'start_time',
    key: 'start-time',
  },
  {
    title: 'End Time',
    dataIndex: 'end_time',
    key: 'end_time',
  },
  {
    title: 'Total Hours',
    dataIndex: 'total_hours',
    key: 'total_hours',
  },
];

const DetailTimesheet = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false} className={styles.timesheetCard}>
        <Row className={styles.cardHeader}>
          <Col span={12} className={styles.formCol}>
            <ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; &nbsp; <span> Timesheet</span>
          </Col>
          <Col span={12} className={styles.formCol}>
            <span className={styles.dateSpan}>February 23, 2022</span>
          </Col>
        </Row>
      </Card>
      <br/>
      <Card bordered={false}>
        <Row className={styles.timeSheetDetail}>
          <Col span={12} className={styles.formCol}>
            <span>Time Sheet Details</span>
          </Col>
          <Col span={12} className={styles.formCol}>
            <span className={styles.status}>Pending</span>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table dataSource={dataSource} columns={columns} pagination={false} />
          </Col>
        </Row>
        <Row className={styles.totalRow}>
          <Col span={12}><span>Total</span></Col>
          <Col span={8}><span className={styles.totalCount}>7:41</span></Col>
        </Row>
      </Card>
    </div>
  )
}
export default DetailTimesheet;
