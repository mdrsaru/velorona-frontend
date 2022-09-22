import moment from 'moment';
import isNil from 'lodash/isNil';
import { Card, Col, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import { Timesheet } from '../../../../interfaces/generated';


import PageHeader from '../../../../components/PageHeader';
import constants from '../../../../config/constants';

import styles from './style.module.scss';
import { authVar } from '../../../../App/link';
import routes from '../../../../config/routes';

const statusMap = {
  'Approved': 'Approved',
  'Pending': 'Pending',
  'Rejected': 'Rejected',
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
    >
      <PageHeader
        title={
          <>
            {authData?.user?.roles[0] === constants.roles.Employee ?
              <Link to={routes.timesheet.path(companyCode)}>
                <ArrowLeftOutlined />
              </Link> :
              <Link to={routes.employeeTimesheet.path(companyCode)}>
                <ArrowLeftOutlined />
              </Link>
            }
            &nbsp; TimeLog
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

            <div>
              {moment(timesheet?.weekStartDate).format('YYYY/MM/DD')} - {moment(timesheet?.weekEndDate).format('YYYY/MM/DD')}
              </div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Total Expense
            </div>

            <div>
              {!isNil(timesheet?.totalExpense) ? `$${timesheet.totalExpense}` : 'N/A'}
            </div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Status
            </div>
            <div>
              {statusMap[timesheet.status] || 'N/A'}
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
              {timesheet.lastSubmittedAt ? moment(timesheet.lastSubmittedAt).format('LLL') : 'N/A'}
            </div>
          </div>

          <div className={styles['detail-row']}>
            <div className={styles['header']}>
              Last Approved
            </div>

            <div>
              {timesheet.lastApprovedAt ? moment(timesheet.lastApprovedAt).format('LLL') : 'N/A'}
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
