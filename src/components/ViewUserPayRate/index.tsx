import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { gql, useQuery } from "@apollo/client";
import { Modal } from "antd";
import { Table } from "antd";
import { useState } from "react";
import { UserPayRatePagingData } from "../../interfaces/graphql.interface";
import EditUserPayRateModal from "../EditUserPayRate";

import styles from "./styles.module.scss";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
}

export const USER_PAY_RATE = gql`
  query UserPayRate($input: UserPayRateQueryInput!) {
    UserPayRate(input: $input) {
      data {
        id
        amount
        project {
          id
          name
          client{
          id
          name
          }
        }
        user {
          id
          fullName
        }
      }
    }
  }
`;

const ViewUserPayRate = (props: IProps) => {
  const { visibility, data:employee, setVisibility } = props;
  const [editVisibility, setEditVisibility] = useState(false);
  const [userPayRateId,setUserPayRateId] = useState('')
  const { data: userPayRate, loading } = useQuery<UserPayRatePagingData>(USER_PAY_RATE, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          user_id: employee?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const handleEdit = (id: any) => {
    setUserPayRateId(id)
    setVisibility(false)
    setEditVisibility(!editVisibility)
  }
  const columns = [
    {
      title: "Project Name",
      render: (payRate: any) => {
        return <p>{payRate?.project?.name}</p>;
      },
    },
    {
      title: "Client Name",
      render: (payRate: any) => {
        return <p>{payRate?.project?.client?.name}</p>;
      },
    },
    {
      title: "Payrate(per hour)",
      render: (payRate: any) => {
        return <p>${payRate?.amount}</p>;
      },
    },
    {
      title: "Action",
      render: (payRate: any) => <EditOutlined onClick={() => handleEdit(payRate?.id)} />
    }
  ];

  return (
    <>
      <Modal
        centered
        visible={visibility}
        className={styles["user-pay-rate"]}
        closeIcon={[
          <div onClick={() => setVisibility(false)} key={1}>
            <div className={styles["close-icon-div"]}>
              <CloseOutlined />
            </div>
          </div>,
        ]}
        width={869}
        okText="Close"
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => setVisibility(false)}
      >
        <div className={styles["modal-body"]}>
          <span className={styles["title"]}>Payrate</span>

          <p className={styles.employeeName}>
            {userPayRate?.UserPayRate?.data?.[0]?.user?.fullName}
          </p>

          <Table
            loading={loading}
            dataSource={userPayRate?.UserPayRate?.data}
            columns={columns}
            pagination={false}
          />
        </div>
      </Modal>

      <EditUserPayRateModal
            visibility={editVisibility}
            setVisibility={setEditVisibility}
            data={employee}
            id= {userPayRateId}
          />
    </>
  );
};

export default ViewUserPayRate;
