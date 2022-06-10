import moment from 'moment';
import isNil from 'lodash/isNil';
import { Card, Col, Row } from 'antd';
import {
  ArrowLeftOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

import routes from '../../../../config/routes';
import { authVar } from '../../../../App/link';
import { RoleName, Timesheet } from '../../../../interfaces/generated';

import PageHeader from '../../../../components/PageHeader';

import styles from './style.module.scss';

const statusMap = {
  'Approved': 'Approved',
  'Pending': 'Pending',
  'PartiallyApproved': 'Partially Approved',
};

interface IProps {
  timesheet: Timesheet;
}

const TimesheetInformation = (props: IProps) => {

  const authData = authVar();
  const companyCode = authData?.company?.code as string;
  const timesheet = props.timesheet;

  return (
    <Card
      bordered={false}
      className={styles['timesheet-information']}
    >
      <PageHeader
        title={
          <>
            {authData?.user?.roles.includes(RoleName.Employee) ?
              <Link to={
                routes.timesheet.path(companyCode)}
              >
                <ArrowLeftOutlined />
              </Link>
              :
              <Link to={
                routes.employeeTimesheet.path(companyCode)}>
                <ArrowLeftOutlined />
              </Link>
            }
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

            <div>
              { !isNil(timesheet?.totalExpense) ? `$${timesheet.totalExpense}` : 'N/A' }
            </div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Status
            </div>
            <div>
              { statusMap[timesheet.status] || 'N/A' }
            </div>
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

            <div>
              { timesheet.lastSubmittedAt ? moment(timesheet.lastSubmittedAt).format('LLL') : 'N/A' }
            </div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Last Approved
            </div>

            <div>
              { timesheet.lastApprovedAt ? moment(timesheet.lastApprovedAt).format('LLL') : 'N/A' }
            </div>
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
