import { Card, Col, Row } from "antd";

import {
  gql,
  useQuery,
  // useQuery
} from "@apollo/client";
import styles from "./style.module.scss";
import { authVar } from "../../App/link";
import _ from "lodash";
import TaskCard from "../../components/TaskCard";

export const TASK = gql`
    query Task($input: TaskQueryInput!) {
        Task(input: $input) {
            data {
                id
                name
                status
                active
                description
                archived
                company_id
                project_id
                active
                description
                manager{
                  fullName
                }
                users{
                  fullName
                }
            }
        }
    }
  
`;

const Tasks = () => {
  const authData = authVar();
  const { data: taskData } = useQuery(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id,
          user_id: authData?.user?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const tasks = taskData?.Task?.data;
  const groups = _.groupBy(tasks, "status");

  return (
    <>
      <div className={styles["main-div"]}>
        <Card bordered={false}>
          <Row>
            <Col span={24} className={styles["form-col"]}>
              <h1>My Tasks Schedule</h1>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles["task-header"]}>
                <div className={styles["task-status"]}>Scheduled Tasks</div>
                <div className={styles["count"]}>
                  {groups?.Scheduled?.length}
                </div>
              </div>
              {groups?.Scheduled?.map((task, index) => (
                <div key={index}>
                  <TaskCard task={task} />
                </div>
              ))}
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles["task-header"]}>
                <div className={styles["task-status"]}>On Going Tasks</div>
                <div className={styles["count"]}>
                  {groups?.InProgress?.length}
                </div>
              </div>
              {groups?.InProgress?.map((task, index) => (
                <div key={index}>
                  <TaskCard task={task} />
                </div>
              ))}
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles["task-header"]}>
                <div className={styles["task-status"]}>Completed Tasks</div>
                <div className={styles["count"]}>
                  {groups?.Completed?.length}
                </div>
              </div>
              {groups?.Completed?.map((task, index) => (
                <div key={index}>
                  <TaskCard task={task} />
                </div>
              ))}
            </Col>
          </Row>
        </Card>
      </div>
    </>
  );
};

export default Tasks;
