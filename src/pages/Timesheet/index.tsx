import { Card, Col, Row, Table, DatePicker } from 'antd';

import { columns, data } from "../../config/constants";

import DropdownMenu from "../../components/Dropdown";

import styles from "./style.module.scss";


const Timesheet = () => {
  return (
    <div className={styles['site-card-wrapper']}>
      <Row>
        <Col span={23}>
          <Card bordered={false}>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <div className={styles['timesheet']}>My Timesheet</div>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <DatePicker bordered={false} placeholder={'Date'}/>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <DropdownMenu title={'Select Project'}/>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <div className={styles['add-time-stamp']}>Add Time Stamp</div>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style-full']}>
              <Table dataSource={data} columns={columns}/>
            </Card.Grid>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Timesheet;
