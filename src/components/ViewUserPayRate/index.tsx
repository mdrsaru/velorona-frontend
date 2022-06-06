import CloseOutlined from "@ant-design/icons/lib/icons/CloseOutlined";
import { gql, useQuery } from "@apollo/client";
import { Modal } from "antd";
import { Table } from "antd";
// import { UserPayRate } from "../../interfaces/generated";
import { UserPayRatePagingData } from "../../interfaces/graphql.interface";

import styles from "./styles.module.scss";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
}

const USER_PAY_RATE = gql`
  query UserPayRate($input: UserPayRateQueryInput!) {
    UserPayRate(input: $input) {
      data {
        id
        amount
        project {
          id
          name
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
  const { visibility, data, setVisibility } = props;

  const { data: userPayRate, loading } = useQuery<UserPayRatePagingData>(USER_PAY_RATE, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          user_id: data.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

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
        return <p>{payRate?.user?.fullName}</p>;
      },
    },
    {
      title: "Project Name",
      render: (payRate: any) => {
        return <p>{payRate?.amount}</p>;
      },
    },
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
    </>
  );
};

export default ViewUserPayRate;
