import React from "react";
import { Card, Col, Row, Table, DatePicker, Select, Form } from 'antd';

import { DownOutlined } from '@ant-design/icons';

import { Link } from "react-router-dom";
import { columns, data } from "../../utils/dummyData";

import routes from "../../config/routes";
import { useNavigate } from "react-router-dom";
import styles from "./style.module.scss";

const { Option } = Select;

const Timesheet = () => {
  let navigate = useNavigate();

  return (
    <div className={styles['site-card-wrapper']}>
      <Row>
        <Col span={23}>
          <Card bordered={false}>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <div className={styles['timesheet']}>My Timesheet</div>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              {/*<DatePicker bordered={false} placeholder={'Date'} suffixIcon={<DownOutlined />}/>*/}
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <Form.Item name="week">
                <Select placeholder="Select Project">
                  <Option value="project1">Project 1</Option>
                  <Option value="project2">Project 2</Option>
                </Select>
              </Form.Item>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style2']}>
              <div className={styles['add-time-stamp']}>
                <Link to={routes.newTimesheet.path}>Add Time Stamp</Link>
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style-full']}>
              <Table dataSource={data} columns={columns} onRow={record => ({
                onClick: (e) => {
                  navigate(routes.detailTimesheet.path(record?.key))
                }
              })}/>
            </Card.Grid>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Timesheet;
