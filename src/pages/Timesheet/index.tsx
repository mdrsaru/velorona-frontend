import { Card, Col, Row, Table, DatePicker } from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { Link } from "react-router-dom";

import { columns, data } from "../../utils/dummyData";
import { useNavigate } from "react-router-dom";

import DropdownMenu from "../../components/Dropdown";

import styles from "./style.module.scss";
import routes from "../../config/routes";


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
              <DatePicker bordered={false} placeholder={'Date'} suffixIcon={<DownOutlined />}/>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style']}>
              <DropdownMenu title={'Select Project'} spanClass={'span14'}/>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style2']}>
              <div className={styles['add-time-stamp']}>
                <Link to={routes.newTimesheet.routePath}>Add Time Stamp</Link>
              </div>
            </Card.Grid>
            <Card.Grid hoverable={false} className={styles['grid-style-full']}>
              <Table dataSource={data} columns={columns} onRow={record => ({
                onClick: (e) => {
                  navigate(routes.detailTimesheet.routePath(record?.key))
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
