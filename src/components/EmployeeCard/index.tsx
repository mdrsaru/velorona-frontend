import ArrowLeftOutlined from "@ant-design/icons/lib/icons/ArrowLeftOutlined";
import { useQuery } from "@apollo/client";
import { Card } from "antd";
import { useNavigate } from "react-router";
import routes from "../../config/routes";
import { UserData } from "../../pages/Client";
import { USER } from "../../pages/Employee";

import styles from "./styles.module.scss";

interface IProps {
  user: any;
}

const EmployeeCard = (props: IProps) => {
  const navigate = useNavigate();

  const { data: userData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          id: props.user,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  return (
    <Card>
      <ArrowLeftOutlined
        className={styles.backArrow}
        onClick={() => navigate(routes.home.path)}
      />
      <span className={styles.employeeName}>
        {userData?.User?.data?.[0]?.fullName}
      </span>
    </Card>
  );
};

export default EmployeeCard;
