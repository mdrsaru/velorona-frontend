
import { Card, Col, Row, Table } from "antd";

import styles from "./style.module.scss";
import PageHeader from "../../components/PageHeader";
import { authVar } from "../../App/link";
import { gql, useQuery } from "@apollo/client";
import moment from "moment";

export const WORKSCHEDULEDETAIL = gql`
query WorkscheduleDetail($input:WorkscheduleDetailQueryInput!){
WorkscheduleDetail(input:$input){
  paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
    data {
			id
      schedule_date
      duration
			workschedule_id
      duration
      workschedule{
        payrollAllocatedHours
		    payrollUsageHours
		    startDate
      }
			user_id
			user{
				id
				fullName
				designation
			}
      workscheduleTimeDetail{
       id
			 startTime		
       endTime
				
			}
		}
} 
}
`
const EmployeeSchedule = () => {
  const loggedInUser = authVar()

  const today = moment().format('YYYY-MM-DD')
  const weekStartDate = moment(today).startOf('isoWeek')
  const weekEndDate = moment(today).endOf('isoWeek')
  const { loading: workscheduleDetailLoading, data: workscheduleDetailData } = useQuery(
    WORKSCHEDULEDETAIL,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["schedule_date:ASC"],
          },
          query: {
            user_id: loggedInUser?.user?.id,
            weekStartDate,
            weekEndDate
          }
        },
      },
    }
  );

  const columns = [
    {
      title: "Date",
      dataIndex: "schedule_date",
      render: (date: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {moment(date).format('ddd, MMM D')}
        </span>
      },

    },
    {
      title: "Time Period",
      dataIndex: "workscheduleTimeDetail",
      render: (timeDetail: any) => {

        return timeDetail?.map((timeDetail: any, index: any) => {
          return (
            <>
              <span>{`${moment(timeDetail.startTime).utc().format('HH:mm')} - ${moment(timeDetail.endTime).utc().format('HH:mm')}`}</span>
              <br />
            </>
          )
        })

      }
    },
    {
      title: "Total Hours",
      dataIndex: "duration",
      render: (duration: any) => {
        let hour = (duration / 3600).toFixed(2);

        return <>
          {hour}
        </>
      }
    },

  ];
  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <PageHeader
            title=" My Schedule"

          />
          <Row className='container-row'>
            <Col span={24}>
              <Table
                loading={workscheduleDetailLoading}
                dataSource={workscheduleDetailData?.WorkscheduleDetail.data}
                columns={columns}
                pagination={false}
              />
            </Col>
          </Row>
        </Card>
      </div>
    </>
  )
}

export default EmployeeSchedule;
