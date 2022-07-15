
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
    date
			workschedule_id
      workschedule{
        payrollAllocatedHours
		    payrollUsageHours
		    startDate
      }
			user_id
			user{
				id
				fullName
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

  const { loading: workscheduleDetailLoading, data: workscheduleDetailData } = useQuery(
    WORKSCHEDULEDETAIL,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            user_id: loggedInUser?.user?.id
          }
        },
      },
    }
  );

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      render: (date: any) => {
        return <span style={{ cursor: 'pointer' }} >
          {moment(date).format('ddd, MMM D')}
        </span>
      },

    },
    {
      title: "Time Period",
      dataIndex: "timeDetail"
    },
    {
      title: "Total Hours",
      dataIndex: "total"
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
