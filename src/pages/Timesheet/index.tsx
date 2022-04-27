import React, { useState } from "react";
import { Card, Col, Row, Table, DatePicker, Modal, Form, Select } from 'antd';
import {
  CloseOutlined,
  LeftOutlined, PlusCircleOutlined,
  RightOutlined
} from '@ant-design/icons';

import routes from "../../config/routes";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.scss";
import {authVar} from "../../App/link";



const Timesheet = () => {
  let navigate = useNavigate();
  const authData = authVar();
  const { Option } = Select;
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Time Period',
      dataIndex: 'time_period',
      key: 'time_period',
    },
    {
      title: 'Total Hours',
      dataIndex: 'total_hours',
      key: 'total_hours',
    },
    {
      title: 'Total Expense',
      dataIndex: 'total_expense',
      key: 'total_expense',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']} onClick={(e) => {
          navigate(routes.detailTimesheet.path(authData?.company?.code ?? '', record?.key))
        }}>
          <PlusCircleOutlined /> &nbsp; &nbsp; <span>Add</span>
        </div>,
    },
  ];

  const data = [
    {
      key: '1',
      project: 'Vellorum',
      client: 'Spark',
      time_period: '2',
      total_hours: '45',
      total_expense: '$45',
      status: 'Pending'
    },
    {
      key: '2',
      project: 'Vellorum',
      client: 'Spark',
      time_period: '2',
      total_hours: '22',
      total_expense: '$45',
      status: 'Pending'
    },
    {
      key: '3',
      project: 'Data Visualization',
      client: 'Spark',
      time_period: '2',
      total_hours: '43',
      total_expense: '$45',
      status: 'Pending'
    },
    {
      key: '4',
      project: 'School Management',
      client: 'Spark',
      time_period: '2',
      total_hours: '88',
      total_expense: '$45',
      status: 'Pending'
    },
  ];

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false}>
        <Row>
          <Col span={12}>
            <div className={styles['timesheet']}>My Timesheet</div>
          </Col>
          <Col span={12}>
            <div className={styles['add-time-stamp']} onClick={() => setVisible(true)}>
              Add Project
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={12} sm={16} md={18} lg={20}>
            <div className={styles['data-picker']}><DatePicker.RangePicker style={{ width: '100%' }} /></div>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <div className={styles['next-icon']}>
              <LeftOutlined />
            </div>
          </Col>
          <Col xs={6} sm={4} md={3} lg={2}>
            <div className={styles['next-icon']}>
              <RightOutlined />
            </div>
          </Col>
          <Col span={24} className={styles['card-col-timesheet']}>
            <Table dataSource={data} columns={columns}/>
          </Col>
        </Row>
      </Card>
      <Modal
        title=""
        centered
        visible={visible}
        closeIcon={[
          <div onClick={() => setVisible(false)}>
              <span className={styles['close-icon-div']}>
                <CloseOutlined />
              </span>
          </div>
        ]}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        okText={'Proceed'}
        width={1000}>
        <div className={styles['modal-title']}>Select Project</div>
        <div className={styles['form-modal']}>
          <Form form={form} layout="vertical">
            <Form.Item name="client" label="Client">
              <Select placeholder="Select Client">
                <Option value="client1">Client 1</Option>
                <Option value="client2">Client 2</Option>
              </Select>
            </Form.Item>
            <Form.Item name="project" label="Project">
              <Select placeholder="Select Project">
                <Option value="project1">Project 1</Option>
                <Option value="project2">Project 2</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </div>
  )
}

export default Timesheet;
