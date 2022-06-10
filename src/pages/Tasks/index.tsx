import { gql, useQuery } from '@apollo/client'
import { Table, Collapse, Space } from 'antd'
import _ from 'lodash'

import NotPriority from '../../assets/images/not-priority.svg'
import Priority from '../../assets/images/priority.svg'

import { authVar } from '../../App/link'
import { useState } from 'react'
import TaskDetail from '../../components/TaskDetail'
import AssignedUserAvatar from '../../components/AssignedUserAvatar'
import { QueryTaskArgs, Task, TaskPagingResult } from '../../interfaces/generated'
import styles from './style.module.scss'
import NoContent from '../../components/NoContent/index';
import { GraphQLResponse } from '../../interfaces/graphql.interface'
import RouteLoader from '../../components/Skeleton/RouteLoader/index';
import TitleCard from '../../components/TitleCard/index';

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
          id
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
        createdAt
      }
    }
  }
`;

const Tasks = () => {
  const authData = authVar();
  const { Panel } = Collapse;
  const [visibility, setVisibility] = useState<boolean>(false);
  const [task, setTask] = useState<Task>();

  const { data: taskData, loading: taskLoading } = useQuery<
    GraphQLResponse<'Task', TaskPagingResult>,
    QueryTaskArgs
  >(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id as string,
          user_id: authData?.user?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  })

  const tasks = taskData?.Task?.data;
  const taskGroups = _.groupBy(tasks, "status");

  const columns = [
    {
      title: "Task Name (Client:Project)",
      render: (task: Task) => {
        return (
          <>
            <span className={styles['task-name']}>{task?.name}</span>
            <span className={styles['client-project-name']}>
              {task?.project?.client?.name} : {task?.project?.name}
            </span>
          </>
        );
      },
      onCell: (task: Task) => {
        return {
          onClick: () => {
            setVisibility(!visibility);
            setTask(task);
          },
        };
      },
    }, {
      title: "Assigned To",
      key: "users",
      render: (task: Task) => {
        return <AssignedUserAvatar users={task?.users} />;
      },
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      render: (deadline: string) => {
        const deadlineDate = deadline?.split("T")?.[0];
        return <p className={styles["table-data"]}>{deadlineDate ?? "-"}</p>;
      },
    }, {
      title: "Prority",
      dataIndex: "priority",
      key: "status",
      render: (task: Task) => (
        <img src={task?.priority ? Priority : NotPriority} alt="task-priority" />
      ),
    },
  ];

  return (
    <>
      <TitleCard title='Task Schedule' />
      {taskLoading ? <RouteLoader />
      :
        Object.keys(taskGroups) &&  !taskLoading ?
          <div className={styles['task-div']}>
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex", marginTop: "1.5rem" }}
            >
              <Collapse accordion defaultActiveKey={['2']}>
                <Panel header="Scheduled" key="2">
                  <Table
                    loading={taskLoading}
                    dataSource={taskGroups?.Scheduled}
                    columns={columns}
                    rowKey={(task) => task?.id}
                    pagination={false}
                  />
                </Panel>
              </Collapse>
            </Space>

            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex", marginTop: "1.5rem" }}
            >
                <Collapse accordion>
                  <Panel header="In Progress" key="3">
                    <Table
                      loading={taskLoading}
                      dataSource={taskGroups?.InProgress}
                      columns={columns}
                      rowKey={(task) => task?.id}
                      pagination={false}
                    />
                  </Panel>
                </Collapse>
            </Space>

            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex", marginTop: "1.5rem" }}
            >
                <Collapse accordion >
                  <Panel header="Completed" key="4">
                    <Table
                      loading={taskLoading}
                      dataSource={taskGroups?.Completed}
                      columns={columns}
                      rowKey={(task) => task?.id}
                      pagination={false}
                    />
                  </Panel>
                </Collapse>
            </Space>

            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex", marginTop: "1.5rem" }}
            >

              <Collapse accordion>
                <Panel header="Unscheduled" key="1">
                    <Table
                      loading={taskLoading}
                      dataSource={taskGroups?.UnScheduled}
                      columns={columns}
                      rowKey={(task) => task?.id}
                      pagination={false}
                    />
                </Panel>
              </Collapse>
            </Space>
          </div>
          :
          <NoContent title='Task scheduled not added' subtitle='There are no task assigned to you at the moment' />
      }
      <TaskDetail
        visibility={visibility}
        setVisibility={setVisibility}
        data={task}
        employee={true}
        userId={authData?.user?.id}
      />
    </>
  );
};

export default Tasks;
