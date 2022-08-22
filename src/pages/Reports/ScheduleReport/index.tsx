import { useQuery } from '@apollo/client';
import { Card, Row, Col, Table } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

import { authVar } from '../../../App/link';
import PageHeader from '../../../components/PageHeader';
import routes from '../../../config/routes';
import { WORKSCHEDULE } from '../../Schedule';

import styles from './style.module.scss';

const ScheduleReport = () => {
  const loggedInUser = authVar();
  const navigate = useNavigate();

  const {
    loading: workscheduleLoading,
    data: workscheduleData,
    refetch: refetchWorkschedule,
  } = useQuery(WORKSCHEDULE, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        paging: {
          order: ['updatedAt:DESC'],
        },
        query: {
          company_id: loggedInUser?.company?.id,
        },
      },
    },
  });

  const columns = [
    {
      title: 'Time Period',
      key: 'date',
      render: (schedule: any) => {
        return (
          <span className={styles.date}>
            {`${moment(schedule?.startDate).format('ddd,MMM DD')} - ${moment(schedule?.endDate).format('ddd,MMM DD')}`}
          </span>
        );
      },

      onCell: (record: any) => {
        return {
          onClick: () => {
            navigate(routes.detailScheduleReport.path(loggedInUser?.company?.code ?? '', record?.id ?? ''));
          },
        };
      },
    },
    {
      title: 'Payroll Allocated Hours',
      dataIndex: 'payrollAllocatedHours',
      render: (payroll: any) => {
        const hour = (payroll / 3600).toFixed(2);
        return hour;
      },
    },
    {
      title: 'Payroll Usage Hours',
      dataIndex: 'payrollUsageHours',
      render: (payrollUsage: number) => {
        const hour = ((payrollUsage ?? 0) / 3600).toFixed(2);
        return hour;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
  ];

  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <PageHeader title='Scheduling Report' />
          <Row className='container-row'>
            <Col span={24}>
              <Table
                dataSource={workscheduleData?.Workschedule?.data}
                columns={columns}
                loading={workscheduleLoading}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default ScheduleReport;
