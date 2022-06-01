import { gql, useQuery } from "@apollo/client";
import { Avatar, Table, Tooltip, Collapse, Space } from "antd";
import _ from "lodash";
import { Column } from "rc-table";

import NotPriority from "../../assets/images/not-priority.svg";
import Priority from "../../assets/images/priority.svg";

import { authVar } from "../../App/link";
import { TaskStatus, User } from "../../interfaces/generated";

import styles from "./style.module.scss";
import EmployeeCard from "../../components/EmployeeCard";

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
        project {
          id
          name
          client {
            name
          }
        }
        active
        description
        manager {
          fullName
        }
        users {
          id
          fullName
          avatar {
            url
          }
        }
        attachments {
          id
          url
          name
        }
        deadline
        priority
      }
    }
  }
`;
const Tasks = () => {
  const authData = authVar();
  const { Panel } = Collapse;
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
  const taskGroups = _.groupBy(tasks, "status");
  console.log(taskGroups, "groups");

  const columns = [
    {
      title: "",
      render: (task: any) => {
        console.log(task, "task");
        return (
          <>
            <span className={styles.taskName}>{task.name}</span>
            <span className={styles.clientProjectName}>
              {task.project.client.name}:{task.project.name}
            </span>
          </>
        );
      },
    },
    {
      title: "Assigned To",
      key: "client",
      render: (task: any) => (
        <Avatar.Group
          maxCount={2}
          size="large"
          maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
        >
          {task.users.map((user: User, index: any) => (
            <>
              <Tooltip title={user?.fullName} placement="top">
                {user?.avatar?.url ? (
                  <Avatar src={user.avatar?.url}></Avatar>
                ) : (
                  <Avatar style={{ backgroundColor: "#f56a00" }}>
                    {user?.fullName.charAt(0)}
                  </Avatar>
                )}
              </Tooltip>
            </>
          ))}
        </Avatar.Group>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "active_employees",
      render: (task: any) => {
        const deadlineDate = task?.deadline.split("T");
        const deadline = deadlineDate?.[0];
        return <p className={styles["table-data"]}>{deadline}</p>;
      },
    },

    {
      title: "Prority",
      dataIndex: "priority",
      key: "status",
      render: (task: any) => (
        <img src={task?.priority ? Priority : NotPriority} />
      ),
    },
  ];

  return (
    <>
      <EmployeeCard user={authData?.user?.id} />
      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex", marginTop: "1.5rem" }}
      >
        {taskGroups?.UnScheduled?.length && (
          <Collapse
            accordion
          >
            <Panel header="UnScheduled" key="1">
              <Table
                dataSource={taskGroups?.UnScheduled}
                columns={columns}
                rowKey={(task) => task?.id}
                pagination={false}
              />
            </Panel>
          </Collapse>
        )}
      </Space>

      <Space
        direction="vertical"
        size="middle"
      >
        {taskGroups?.Schedule?.length && (
          <Collapse accordion>
            <Panel header="Schedule" key="2">
              <Table
                dataSource={taskGroups?.Schedule}
                columns={columns}
                rowKey={(task) => task?.id}
                pagination={false}
              />
            </Panel>
          </Collapse>
        )}
      </Space>

      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex", marginTop: "1.5rem" }}
      >
        {taskGroups?.InProgress?.length && (
          <Collapse accordion>
            <Panel header="InProgress" key="3">
              <Table
                dataSource={taskGroups?.InProgress}
                columns={columns}
                rowKey={(task) => task?.id}
                pagination={false}
              />
            </Panel>
          </Collapse>
        )}
      </Space>

      <Space
        direction="vertical"
        size="middle"
        style={{ display: "flex", marginTop: "1.5rem" }}
      >
        {taskGroups?.Completed?.length && (
          <Collapse accordion>
            <Panel header="Completed" key="4">
              <Table
                dataSource={taskGroups?.Completed}
                columns={columns}
                rowKey={(task) => task?.id}
                pagination={false}
              />
            </Panel>
          </Collapse>
        )}
      </Space>
    </>
  );
};

export default Tasks;
