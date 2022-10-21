import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import EditOutlined from "@ant-design/icons/lib/icons/EditOutlined";
import { gql, useLazyQuery } from "@apollo/client";
import { Modal } from "antd";
import { Table } from "antd";
import { useState } from "react";
import { UserPayRatePagingData } from "../../interfaces/graphql.interface";
import EditUserPayRateModal from "../EditUserPayRate";

import styles from "./styles.module.scss";
import { authVar } from '../../App/link';
import { useParams } from 'react-router-dom';

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  userPayRate?: any;
}

export const USER_PAY_RATE = gql`
  query UserPayRate($input: UserPayRateQueryInput!) {
    UserPayRate(input: $input) {
      data {
        id
        amount
        invoiceRate
        invoiceRateCurrency{
        id 
        name
        symbol 
        }
        userRateCurrency{
        id 
        name
        symbol 
        }
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
  const { visibility, data: employee, setVisibility, userPayRate } = props;
  const [editVisibility, setEditVisibility] = useState(false);
  const [userPayRateId, setUserPayRateId] = useState('')
  const [getUserPayRate, { data: userPayRateData }] = useLazyQuery<UserPayRatePagingData>(USER_PAY_RATE)

  const authData = authVar()
  const params = useParams()
  const handleEdit = (id: any, userId: string) => {
    setUserPayRateId(id)
    setVisibility(false);
    getUserPayRate({
      variables: {
        input: {
          query: {
            user_id: userId,
            id: id,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
    setEditVisibility(!editVisibility)
  }
  let columns;
  if (authData?.user?.id === params?.eid) {
    columns = [
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
        title: "Pay rate(per hour)",
        render: (payRate: any) => {
          return <p>{payRate?.userRateCurrency?.symbol && payRate?.userRateCurrency?.symbol } {payRate?.amount}</p>;
        },
      }
    ];
  }
  else {
    columns = [
      {
        title: "Project Name",
        render: (payRate: any) => {
          return <p>{payRate?.project?.name}</p>;
        },
      },
      {
        title: "Client Name",
        render: (payRate: any) => {
          return <p>{payRate?.project?.client?.name ?? '-'}</p>;
        },
      },
      {
        title: "Invoice rate(per hour)",
        render: (payRate: any) => {
          return <p><span>{payRate?.invoiceRateCurrency?.symbol && payRate?.invoiceRateCurrency?.symbol} </span>{`${payRate?.invoiceRate}`}</p>;
        },
      },
      {
        title: "Employee Pay rate(per hour)",
        render: (payRate: any) => {
          return <p><span>{payRate?.userRateCurrency?.symbol && payRate?.userRateCurrency?.symbol} </span>{`${payRate?.amount}`}</p>;
        },
      },
      {
        title: "Action",
        render: (payRate: any) => <EditOutlined onClick={() => handleEdit(payRate?.id, payRate?.user?.id)} />
      }
    ];
  }
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
        cancelButtonProps={{ style: { display: 'none' } }}
        width={869}
        okText="Close"
        onOk={() => setVisibility(false)}
      >
        <div className={styles["modal-body"]}>
          <span className={styles["title"]}>Employee Payrate</span>

          <p className={styles.employeeName}>
            {userPayRate?.UserPayRate?.data?.[0]?.user?.fullName}
          </p>

          <Table
            dataSource={userPayRate?.UserPayRate?.data}
            columns={columns}
            rowKey={(record) => record?.id}
            pagination={false}
          />
        </div>
      </Modal>

      <EditUserPayRateModal
        visibility={editVisibility}
        setVisibility={setEditVisibility}
        data={employee}
        id={userPayRateId}
        userPayRateData={userPayRateData}
      />
    </>
  );
};

export default ViewUserPayRate;
