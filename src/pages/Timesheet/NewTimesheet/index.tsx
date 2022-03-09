import React from 'react';
import { Card, Col, Row, Form, DatePicker, Input, Button, Space, TimePicker } from "antd";
import { ArrowLeftOutlined, DownOutlined } from '@ant-design/icons';

import DropdownMenu from "../../../components/Dropdown";
import { useNavigate } from 'react-router-dom';

import styles from "../style.module.scss";


const NewTimesheet = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false}>
        <Row className={styles.cardHeaderRow}>
          <Col span={24}>
            <ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; <span>Add Timesheet</span>
          </Col>
        </Row>
        <Form form={form} layout="vertical">
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="date-picker" label="Date">
                <DatePicker bordered={false} placeholder={'Select Date'} suffixIcon={<DownOutlined/>}/>
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item label="Project">
                <DropdownMenu title={'Select Project'} spanClass={'spanInput'}/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles.formCol}>
              <Form.Item label="Task">
                <Input placeholder="Enter Task"/>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="start-time-picker" label="Start Time">
                <TimePicker placeholder={"Enter Start Time"} suffixIcon={""} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <Form.Item name="end-time-picker" label="End Time">
                <TimePicker placeholder={"Enter End Time"} suffixIcon={""} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <div className={styles.totalTimeDiv}>
                <span>Total Hours</span>
                <span className={styles.hours}>0 Hrs</span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12} className={styles.formCol}>
              <div className={styles.totalTimeDiv}>
                <span>Total Expense</span>
                <span className={styles.hours}>$20/hr</span>
              </div>
            </Col>
          </Row>
          <br/><br/>
          <Row justify="end">
            <Col>
              <Form.Item>
                <Space>
                  <Button type="default" htmlType="button">Cancel</Button>
                  <Button type="primary" htmlType="submit">Submit</Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}
export default NewTimesheet;
