import React, { useState } from "react";
import { Card, Col, message, Row, Table } from "antd";
import { DeleteOutlined } from '@ant-design/icons';
import styles from "./style.module.scss";
import PageHeader from "../../components/PageHeader";
import { useNavigate } from "react-router-dom";
import routes from "../../config/routes";
import { authVar } from "../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import moment from "moment";
import AddSchedule from "../../components/AddSchedule";
import { MutationWorkscheduleDeleteArgs, Workschedule } from "../../interfaces/generated";
import ModalConfirm from "../../components/Modal";


import deleteImg from '../../assets/images/delete_btn.svg';
import DeleteBody from "../../components/Delete";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { notifyGraphqlError } from "../../utils/error";

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

export const WORKSCHEDULE_DELETE = gql`
  mutation WorkscheduleDelete($input: DeleteInput!) {
    WorkscheduleDelete(input: $input) {
      id
      startDate
      endDate
    }
  }
`;

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
            order: ["startDate:DESC"],
          },
          query: {
            company_id: loggedInUser?.company?.id
          }
        },
      },
    }
  );

  const [workscheduleDelete] = useMutation<GraphQLResponse<'WorkscheduleDelete', Workschedule>, MutationWorkscheduleDeleteArgs>(WORKSCHEDULE_DELETE, {
    onCompleted() {
      message.success({
        content: `Workschedule is deleted successfully!`,
        className: "custom-message",
      });
      setVisibility(false);
    },
    onError(err) {
      setVisibility(false);
      notifyGraphqlError(err);
    },

    update(cache) {
      const normalizedId = cache.identify({ id: workschedule?.id, __typename: "Workschedule" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const [workschedule, setWorkschedule] = useState<any>()

  const [visibility, setVisibility] = useState<boolean>(false);

  const deleteWorkschedule = () => {
    setVisibility(false);
    workscheduleDelete({
      variables: {
        input: {
          id: workschedule?.id as string,
        },
      },
    });
  };

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
      dataIndex: "payrollUsageHours",
      render: (payrollUsage: number) => {
        const hour = ((payrollUsage ?? 0) / 3600).toFixed(2)
        return hour
      }
    },
    {
      title: "Status",
      dataIndex: "status"
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Workschedule) => (
        <>
          <span
            title='Delete schedule'
            className={`${styles["table-icon"]} ${styles["table-delete-icon"]}`}
            onClick={() => {
              setWorkschedule(record);
              setVisibility(true);
            }}
          >
            <DeleteOutlined />
          </span>
        </>
      )
    }
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

      <ModalConfirm
        visibility={visibility}
        setModalVisibility={visibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        closable
        modalBody={
          <DeleteBody
            title={
              <>
                Are you sure you want to delete it?{" "}
                {/* <strong> {project?.name}</strong> */}
              </>
            }
            subText={`All the data associated with this will be deleted permanently.`}
          />
        }
        onOkClick={deleteWorkschedule}
      />
    </>
  )
}

export default Schedule;
