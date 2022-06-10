import moment from 'moment';
import { Card, Col, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Timesheet } from '../../../../interfaces/generated';

import PageHeader from '../../../../components/PageHeader';

import styles from './style.module.scss';

interface IProps {
  timesheet: Timesheet;
}

const TimesheetInformation = (props: IProps) => {
  const navigate = useNavigate();
  const timesheet = props.timesheet;

  return (
    <Card
      bordered={false}
      className={styles['timesheet-information']}
    >
      <PageHeader
        title={
          <>
            <span onClick={() => navigate(-1)} style={{ cursor: 'pointer' }}>
              <ArrowLeftOutlined />
            </span>
            &nbsp; My Timesheet
          </>
        }
      />

      <Row className={styles['card-body']}>
        <Col xs={24} sm={24} md={24} lg={12} xl={12}>
          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Candidate Name
            </div>

            <div>{timesheet?.user?.email}</div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Time Period
            </div>

            <div>Mon-Sun</div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Total Expense
            </div>

            <div>{timesheet?.totalExpense ?? 'N/A'}</div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Status
            </div>
            <div>{timesheet?.status ?? 'N/A'}</div>
          </div>
        </Col>

        <Col xs={24} sm={24} md={24} lg={12} xl={12}>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Client Name
            </div>
            <div>{timesheet?.client?.name ?? 'N/A'}</div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Last Submitted
            </div>

            <div>{moment(timesheet?.weekEndDate).format('L')}</div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Last Approved
            </div>

            <div>{timesheet?.lastApprovedAt ?? 'N/A'}</div>
          </div>
          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Approver/Manager
            </div>
            <div>{timesheet?.approver?.fullName ?? 'N/A'}</div>
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default TimesheetInformation;
