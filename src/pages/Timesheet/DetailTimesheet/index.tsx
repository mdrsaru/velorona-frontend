import React  from 'react';
import { Card, Col, DatePicker, Row, TimePicker, Button, Space } from "antd";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined, CloseCircleOutlined } from "@ant-design/icons";
import moment from 'moment';

import { useQuery } from '@apollo/client';
import { useNavigate, useParams } from "react-router-dom";
import { authVar } from '../../../App/link';
import { TIMESHEET } from '../index';

import styles from "../style.module.scss";



const DetailTimesheet = () => {
  let params = useParams();
  const navigate = useNavigate();
  const authData = authVar();
  console.log(params);
  const { data: timesheetData } = useQuery(TIMESHEET, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          id: params?.id
        },
        paging: {
          order: ['createdAt:DESC']
        }
      }
    }
  });

  console.log(timesheetData);

  return (
    <div className={styles['site-card-wrapper']}>
      <Card bordered={false} className={styles.timesheetCard}>
        <Row className={styles.cardHeader}>
          <Col span={24} className={styles.formColDetail}>
            <ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; &nbsp; <span> My Timesheet</span>
          </Col>
        </Row>
        <Row className={styles.cardBody}>
          <Col span={12}>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Candidate Name</div>
              <div>{timesheetData?.Timesheet?.data[0]?.company?.name}</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Time Period</div>
              <div>Mon-Sun</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Total Expense</div>
              <div>$600</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Approver/Manager</div>
              <div>Thomas Holland</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Status</div>
              <div>Open</div>
            </div>
          </Col>
          <Col span={12}>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Project Name</div>
              <div>{timesheetData?.Timesheet?.data[0]?.project?.name}</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Client Name</div>
              <div>Araniko College Pvt Ltd</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Client Location</div>
              <div>{timesheetData?.Timesheet?.data[0]?.clientLocation ?? 'N/A'}</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Last Submitted</div>
              <div>{moment(timesheetData?.Timesheet?.data[0]?.end).format('L')}</div>
            </div>
            <div className={styles.timesheetDiv}>
              <div className={styles.header}>Approved By</div>
              <div>{timesheetData?.Timesheet?.data[0]?.approver ?? 'N/A'}</div>
            </div>
          </Col>
        </Row>
      </Card>
      <br/>
      <Card bordered={false}>
        <Row className={styles.timeSheetDetail}>
          <Col span={6} className={styles.formCol1}>
            <span>Time Entry Details</span>
          </Col>
          <Col span={12}>
            <div className={styles['data-picker']}><DatePicker.RangePicker style={{ width: '100%' }} /></div>
          </Col>
          <Col span={3}>
            <div className={styles['next-icon']}>
              <LeftOutlined />
            </div>
          </Col>
          <Col span={3}>
            <div className={styles['next-icon']}>
              <RightOutlined />
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24} className={styles.formCol}>
            <div className={styles['resp-table']}>
              <div className={styles["resp-table-header"]}>
                <div className={styles['table-header-cell']}>
                  Header 1
                </div>
                <div className={styles['table-header-cell']}>
                  Header 2
                </div>
                <div className={styles['table-header-cell']}>
                  Header 3
                </div>
                <div className={styles['table-header-cell']}>
                  Header 4
                </div>
                <div className={styles['table-header-cell']}>
                  Header 5
                </div>
                <div className={styles['table-header-cell']}>
                  Header 6
                </div>
                <div className={styles['table-header-cell']}>
                  Header 7
                </div>
                <div className={styles['table-header-cell']}>
                  Header 8
                </div>
                <div className={styles['table-header-cell']}>
                  Header 9
                </div>
              </div>
              <div className={styles["resp-table-body"]}>
                <div className={styles["table-body-cell"]}>
                  Data 1
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('02:03:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('02:05:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('06:00:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('00:30:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('00:03:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('02:50:20', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <TimePicker defaultValue={moment('07:23:00', 'HH:mm:ss')} suffixIcon={null}/>
                </div>
                <div className={styles["table-body-cell"]}>
                  <span>40:00:00 </span> &nbsp; &nbsp; <CloseCircleOutlined />
                </div>
              </div>
            </div>
          </Col>
        </Row>
        <br/>
        <Row justify={"end"}>
          <Col className={styles.formCol}>
           <Space>
             <Button type="primary" htmlType="button">
               Save and Exit
             </Button>
             <Button type="default" htmlType="button">
               Submit
             </Button>
           </Space>
          </Col>
        </Row>
        <br/>
      </Card>
    </div>
  )
}
export default DetailTimesheet;
