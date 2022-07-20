import React, { useState } from "react";
import { Card, Col, Row, Table } from "antd";

import styles from "./style.module.scss";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import routes from "../../config/routes";
import { authVar } from "../../App/link";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";
import AddSchedule from "../../components/AddSchedule";

export const WORKSCHEDULE = gql`
query Workschedule($input: WorkscheduleQueryInput!) {
  Workschedule(input: $input) {
    paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
    data {
			id
    startDate
		endDate
		payrollAllocatedHours
		payrollUsageHours
		status
		company{
			id
			name
		}
    }
  }
}`

const Schedule = () => {
  const loggedInUser = authVar()
  const navigate = useNavigate()

  const [showSchedule, setScheduleShow] = useState(false)


  const { loading: workscheduleLoading, data: workscheduleData, refetch: refetchWorkschedule } = useQuery(
    WORKSCHEDULE,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: loggedInUser?.company?.id
          }
        },
      },
    }
  );

  const columns = [
    {
      title: "Time Period",
      key: 'date',
      render: (schedule: any) => {
        return <span className={styles.date}>
          {`${moment(schedule?.startDate).format('ddd,MMM DD')} - ${moment(schedule?.endDate).format('ddd,MMM DD')}`}
        </span>

      },
      onCell: (record: any) => {
        return {
          onClick: () => {
            navigate(
              routes.detailSchedule.path(
                loggedInUser?.company?.code ?? "",
                record?.id ?? ""
              )
            );
          },
        };
      },
    },
    {
      title: "Payroll Allocated Hours",
      dataIndex: "payrollAllocatedHours",
      render: (payroll: any) => {
        const hour = (payroll / 3600).toFixed(2)
        return hour
      }
    },
    {
      title: "Payroll Usage Hours",
      dataIndex: "payrollUsageHours"
    },
    {
      title: "Status",
      dataIndex: "status"
    },
  ];
  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <PageHeader
            title="Scheduling"
            extra={[
              <div className={styles["add-new-schedule"]} key="new-client" onClick={() => setScheduleShow(!showSchedule)}>

                Add New Schedule
              </div>
            ]}

          />
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
      </div >
      <AddSchedule
        visibility={showSchedule}
        setVisibility={setScheduleShow}
        refetchWorkschedule={refetchWorkschedule} />
    </>
  )
}

export default Schedule;
