import { gql, useMutation, useQuery } from '@apollo/client'
import { Table, Collapse, Space, Form, message } from 'antd'
import _ from 'lodash'

import NotPriority from '../../assets/images/not-priority.svg'
import Priority from '../../assets/images/priority.svg'

import { useStopwatch } from 'react-timer-hook'
import { authVar } from '../../App/link'
import { useState } from 'react'
import TaskDetail from '../../components/TaskDetail'
import AssignedUserAvatar from '../../components/AssignedUserAvatar'
import { QueryTaskArgs, Task, TaskPagingResult } from '../../interfaces/generated'

import NoContent from '../../components/NoContent/index';
import { GraphQLResponse } from '../../interfaces/graphql.interface'
import RouteLoader from '../../components/Skeleton/RouteLoader/index';
import TitleCard from '../../components/TitleCard/index';
import { computeDiff, CREATE_TIME_ENTRY } from '../Timesheet'
import moment from 'moment'
import { notifyGraphqlError } from '../../utils/error'
import { UPDATE_TIME_ENTRY } from '../Timesheet/EditTimesheet'
import TimerCard from '../../components/TimerCard'

import styles from './style.module.scss'

export const TASK = gql`
  query Task($input: TaskQueryInput!) {
    Task(input: $input) {
      activeTimeEntry {
        id
        startTime
        task_id
      }
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
  const authData = authVar()
  const { Panel } = Collapse
  const [form] = Form.useForm();

  let stopwatchOffset = new Date();

  const [visibility, setVisibility] = useState<boolean>(false)
  const [task, setTask] = useState<Task>()
  const [activeTask, setActiveTask] = useState({
    entry_id: '',
    task_id: '',
    autostart: false
  })
  const [createTimeEntry] = useMutation(CREATE_TIME_ENTRY, {
    onCompleted: (response: any) => {
      start();
      setActiveTask({
        entry_id: response?.TimeEntryCreate?.id,
        task_id: response?.TimeEntryCreate?.task_id,
        autostart: true
      });
    }
  });

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    reset
  } = useStopwatch({
    autoStart: activeTask?.autostart,
    offsetTimestamp: new Date()
  })

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
    onCompleted: (response: any) => {

      if (response?.Task?.activeTimeEntry) {
        setActiveTask({
          entry_id: response?.Task?.activeTimeEntry?.id,
          task_id: response?.Task?.activeTimeEntry?.task_id,
          autostart: true
        })
        stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + computeDiff(response?.Task?.activeTimeEntry?.startTime))
        reset(stopwatchOffset)
      }
    }
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

  const onFinish = () => {
    !isRunning ? createTaskEntry() : stopTimer();
  };

  const createTaskEntry = () => {
    stopwatchOffset = new Date()
    createTimeEntry({
      variables: {
        input: {
          startTime: moment(stopwatchOffset, "YYYY-MM-DD HH:mm:ss"),
          task_id: task?.id,
          project_id: task?.project?.id,
          company_id: authData?.company?.id,
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const [updateTimeEntry] = useMutation(UPDATE_TIME_ENTRY, {
    onCompleted: () => {
      reset(undefined, false)
      setActiveTask({ ...activeTask, autostart: false })
      message.success({
        content: `Time Entry is updated successfully!`,
        className: 'custom-message'
      });
    }
  });

  const stopTimer = () => {
    stopwatchOffset = new Date()
    updateTimeEntry({
      variables: {
        input: {
          id: activeTask?.entry_id,
          endTime: moment(stopwatchOffset, "YYYY-MM-DD HH:mm:ss"),
          company_id: authData?.company?.id
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const TaskTimer = () => {
    return (
      <div>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <TimerCard
            hours={hours}
            minutes={minutes}
            seconds={seconds}
            isRunning={isRunning}
            title={' timer'} />
        </Form>
      </div>
    )
  }

  return (
    <>
      <TitleCard title='Task Schedule' />
      {taskLoading ? <RouteLoader />
        :
        Object.keys(taskGroups) && !taskLoading ?
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
          <NoContent
            title='Task scheduled not added'
            subtitle='There are no task assigned to you at the moment' />
      }

      <TaskDetail
        visibility={visibility}
        setVisibility={setVisibility}
        data={task}
        employee={true}
        timerBody={(!isRunning || task?.id === activeTask?.task_id) ? <TaskTimer /> : ''}
        userId={authData?.user?.id}
      />
    </>
  );
};

export default Tasks;
