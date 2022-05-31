import LinkOutlined from "@ant-design/icons/lib/icons/LinkOutlined";
import { useQuery } from "@apollo/client";
import { Avatar, Card } from "antd";
import { useState } from "react";
import { authVar } from "../../App/link";
import { UserData } from "../../pages/Client";
import { USER } from "../../pages/Employee";
import TaskDetail from "../TaskDetail";

import styles from "./styles.module.scss";

interface IProps {
  task?: any;
}
const TaskCard = (props: IProps) => {
  const authData = authVar();
  const [visibility, setVisibility] = useState(false);

  const { data: userData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          id: authData.user.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });
  const avatar = userData?.User?.data[0]?.avatar?.url;
  const task = props.task;
  return (
    <div className={styles["main-div"]}>
      <Card
        className={styles["task-card"]}
        onClick={() => {
          setVisibility(true);
        }}
      >
        <Card.Grid hoverable={false} className={styles.gridStyle70}>
          <span className={styles["task-name"]}>{task?.name}</span>
        </Card.Grid>

        <Card.Grid hoverable={false} className={styles.gridStyle30}>
          <Avatar icon={<img src={avatar} alt='avatar-img' />} />
        </Card.Grid>
        {task.attachments.map((attachment: any, index: number) => (
          <Card.Grid hoverable={false} className={styles.gridStyle} key={index}>
            <span className={styles["file-attach"]}>
              <LinkOutlined />
            </span>{" "}
            &nbsp;
            <span className={styles["file-name"]}>{attachment.name}</span>
          </Card.Grid>
        ))}
      </Card>

      {visibility && (
        <TaskDetail
          visibility={visibility}
          setVisibility={setVisibility}
          data={task}
          employee={true}
        />
      )}
    </div>
  );
};

export default TaskCard;
