import { Card, Col, Dropdown, Menu, Row, Table, message, Button, Form, Select } from 'antd';
import { ArrowLeftOutlined, MoreOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { authVar } from '../../../App/link';
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { notifyGraphqlError } from '../../../utils/error';

import { PROJECT } from '../index';
import { TASK } from '../../Tasks';
import routes from '../../../config/routes';
import constants, { status } from '../../../config/constants';

import deleteImg from '../../../assets/images/delete_btn.svg';
import archiveImg from '../../../assets/images/archive_btn.svg';
import filterImg from "../../../assets/images/filter.svg"

import ModalConfirm from '../../../components/Modal';
import ArchiveBody from '../../../components/Archive';
import DeleteBody from '../../../components/Delete';
import TaskDetail from '../../../components/TaskDetail';
import Status from '../../../components/Status';

import InfoCircleOutlined from '@ant-design/icons/lib/icons/InfoCircleOutlined';
import DownloadOutlined from '@ant-design/icons/lib/icons/DownloadOutlined';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import styles from '../style.module.scss';
import {
  MutationTaskDeleteArgs,
  MutationTaskUpdateArgs,
  ProjectPagingResult,
  QueryProjectArgs,
  QueryTaskArgs,
  // MutationTaskDeleteArgs, 
  Task,
  TaskPagingResult,
} from '../../../interfaces/generated';
import { downloadCSV } from '../../../utils/common';

const { SubMenu } = Menu;

export const TASK_UPDATE = gql`
  mutation TaskUpdate($input: TaskUpdateInput!) {
    TaskUpdate(input: $input) {
      id
      name
      status
      archived
      active
      description
      deadline
      priority
    }
  }
`;

export const TASK_DELETE = gql`
  mutation TaskDelete($input: DeleteInput!) {
    TaskDelete(input: $input) {
      id
      name
      status
      active
      description
      archived
    }
  }
`;

const DetailProject = () => {
  let params = useParams();
  const navigate = useNavigate();
  const loggedInUser = authVar();

  const [filterForm] = Form.useForm();

  const [taskUpdate, { loading: updateLoading }] = useMutation<GraphQLResponse<'TaskUpdate', Task>, MutationTaskUpdateArgs>(TASK_UPDATE, {
    onCompleted() {
      message.success({
        content: `Task is updated successfully!`,
        className: "custom-message",
      });
      setArchiveVisibility(false);
    },
    onError(err) {
      setArchiveVisibility(false);
      notifyGraphqlError(err);
    },
    update(cache) {
      const normalizedId = cache.identify({ id: task?.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });
  const [taskDelete, { loading }] = useMutation<GraphQLResponse<'TaskDelete', Task>, MutationTaskDeleteArgs>(TASK_DELETE, {
    onCompleted() {
      message.success({
        content: `Task is deleted successfully!`,
        className: "custom-message",
      });
      setVisibility(false);
    },
    onError(err) {
      setVisibility(false);
      notifyGraphqlError(err);
    },

    update(cache) {
      const normalizedId = cache.identify({ id: task?.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const [task, setTask] = useState<any>();
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);

  const setModalVisibility = (value: boolean) => {
    setVisibility(value);
  };

  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const changeStatus = (value: boolean, id: string) => {
    taskUpdate({
      variables: {
        input: {
          active: value,
          id: id,
          company_id: loggedInUser?.company?.id ?? '',
        },
      },
    });
  };

  const archiveTask = () => {
    taskUpdate({
      variables: {
        input: {
          id: task?.id ?? '',
          archived: !task?.archived,
          company_id: loggedInUser?.company?.id ?? '',
        },
      },
    });
  };
  const deleteTask = () => {
    setVisibility(false);
    taskDelete({
      variables: {
        input: {
          id: task?.id as string,
        },
      },
    });
  };

  const csvHeader: Array<{ label: string, key: string, subKey?: string }> = [
    { label: "Task Name", key: "name" },
    { label: "Task Manager", key: "manager", subKey: "fullName" },
    { label: "Project", key: "project", subKey: "name" },
    { label: "Status", key: "status" }
  ]

  const [detailVisibility, setDetailVisibility] = useState(false);
  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu" className={styles.list}>
        <Menu.Item
          key="active"
          className={styles.list}
          onClick={() => {
            if (data?.active === false) {
              changeStatus(true, data?.id);
            }
          }}
        >
          Active
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="inactive"
          onClick={() => {
            if (data?.active === true) {
              changeStatus(false, data?.id);
            }
          }}
        >
          Inactive
        </Menu.Item>
      </SubMenu>
      <Menu.Divider />

      <Menu.Item key="archive" className={styles.list}>
        <div
          onClick={() => {
            setTask(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Task" : "Archive Task"}
        </div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="viewDetails" className={styles.list}>
        <div
          onClick={() => {
            setDetailVisibility(!detailVisibility);
            setTask(data);
          }}
        >
          View Details
        </div>
      </Menu.Item>

      <Menu.Item key="edit" className={styles.list}>
        <div
          onClick={() => {
            navigate(
              routes.editTasksProject.path(
                loggedInUser?.company?.code ? loggedInUser?.company?.code : "",
                params?.pid ?? "",
                data?.id
              )
            );
          }}
        >
          Edit Task
        </div>
      </Menu.Item>

      <Menu.Item key="delete" className={styles.list}>
        <div
          onClick={() => {
            setModalVisibility(true);
            setTask(data);
          }}
        >
          Delete Task
        </div>
      </Menu.Item>
    </Menu>
  );

  const assignedMenu = (record: any) => (
    <Menu>
      <p className={styles.employeeTitle}>
        Employee List ({record.users.length}){" "}
      </p>
      {record.users?.map((user: any, index: number) => (
        <div key={index}>
          <Menu.Item className={styles.list}>{user?.fullName}</Menu.Item>
          <Menu.Divider />
        </div>
      ))}
    </Menu>
  );
  const columns = [
    {
      title: "Task Name",
      key: "name",
      render: (task: any) => {
        return (
          <div className={styles["task-name"]}>
            <p>{task?.name}</p>
          </div>
        );
      },
      onCell: (record: any) => ({
        onClick: () => {
          setDetailVisibility(!detailVisibility);
          setTask(record);
        }
      }),
    },
    {
      title: "Task Manager",
      key: "manager",
      render: (task: any) => {
        return (
          <div>
            <p>{task?.manager?.fullName}</p>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "active",
      key: "status",
      render: (active: boolean) => (
        <Status status={active ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Dropdown
            overlay={assignedMenu(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ marginRight: "0.6rem" }}
              title="Assigned User"
            >
              <InfoCircleOutlined className={styles.icons} />
            </div>
          </Dropdown>

          <Dropdown
            overlay={menu(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ paddingLeft: "1rem" }}
            >
              <MoreOutlined className={styles.icons} />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];

  const { data: projectData } = useQuery<GraphQLResponse<'Project', ProjectPagingResult>, QueryProjectArgs>(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
          id: params?.pid,
        },
      },
    },
  });

  const onUpdateAction = (args: any) => {
    let updatedValue = {};
    updatedValue = { [args?.title]: args?.value };
    setTask({
      ...task,
      ...updatedValue
    });
  }


  const { data: taskData, loading: taskLoading, refetch: refetchTask } = useQuery<GraphQLResponse<'Task', TaskPagingResult>, QueryTaskArgs>(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
          project_id: params?.pid,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [fetchDownloadData, { data: taskDownloadData }] = useLazyQuery<GraphQLResponse<'Task', TaskPagingResult>, QueryTaskArgs>(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
          project_id: params?.pid,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
    onCompleted: () => {
      downloadCSV(taskDownloadData?.Task?.data, csvHeader, 'Tasks.csv')
    }
  });

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {
            company_id: loggedInUser?.company?.id as string,
            project_id: params?.pid,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
  }

  const refetchTasks = () => {

    let values = filterForm.getFieldsValue(['search', 'role', 'status'])

    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      },

      query: {
        company_id: loggedInUser?.company?.id,
        project_id: params?.pid,
      }

    }

    let query: {
      active?: boolean,
      archived?: boolean,
      company_id: string;
      project_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string,
      project_id: params?.pid as string,
    }


    if (values.status === 'Active' || values.status === 'Inactive') {
      query['active'] = values.status === 'Active' ? true : false;
    } else {
      query['archived'] = values.status === 'Archived' ? true : false;
    }

    input['query'] = query

    refetchTask({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchTasks()
  }

  const openFilterRow = () => {
    filterForm.resetFields()
    refetchTask({
      input: {
        query: {
          company_id: loggedInUser?.company?.id as string,
          project_id: params?.pid,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    })
  }

  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles["project-col"]}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Project :&nbsp;
              <span>{projectData?.Project?.data[0]?.name ?? ""}</span>
            </h1>
          </Col>
          <Col span={12} className={styles["project-add-task"]}>
            <div>
              <Link
                to={routes.addTasksProject.path(
                  loggedInUser?.company?.code
                    ? loggedInUser?.company?.code
                    : "",
                  params?.pid ?? ""
                )}
              >
                Add new Task
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
      <br />
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles["project-col"]}>
            <h1>Task List</h1>
          </Col>
        </Row>
        <br />
        <Row >
          <Col span={6} >
            <Form
              form={filterForm}
              layout="vertical"
              onFinish={() => { }}
              autoComplete="off"
              name="filter-form">
              <Form.Item name="status" label="">
                <Select
                  placeholder="Select status"
                  onChange={onChangeFilter}
                >
                  {status?.map((status: any) =>
                    <option value={status?.value} key={status?.name}>
                      {status?.name}
                    </option>)}
                </Select>
              </Form.Item>
            </Form>

          </Col>
          <Col>
            <div className={styles['filter-col']}>
              <Button
                type="text"
                onClick={openFilterRow}
                icon={<img
                  src={filterImg}
                  alt="filter"
                  className={styles['filter-image']} />}>
                &nbsp; &nbsp;
                {'Reset'}
              </Button>
            </div>
          </Col>

        </Row>
        <Row>
          <Col span={24}>
            <Table
              loading={loading || updateLoading || taskLoading}
              dataSource={taskData?.Task?.data}
              columns={columns}
              rowKey={(record) => record?.id}
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: taskData?.Task?.paging?.total,
                pageSize: constants.paging.perPage
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col>
            {
              !!taskData?.Task?.data?.length && (
                <div className={styles['download-report']}>
                  <Button
                    type="link"
                    onClick={downloadReport}
                    icon={<DownloadOutlined />}
                  >
                    Download Report
                  </Button>
                </div>
              )
            }
          </Col>
        </Row>
      </Card>

      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={"Delete"}
        closable
        modalBody={() =>
          <DeleteBody
            title={
              <>
                {" "}
                Are you sure you want to delete
                <strong> {task?.name}?</strong>
              </>
            }
            subText={
              <>
                All the data associated with the task will be deleted
                permanently.
              </>
            }
          />
        }
        onOkClick={deleteTask}
      />

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={task?.archived ? "Unarchive" : "Archive"}
        closable
        modalBody={
          <ArchiveBody
            title={
              <>
                Are you sure you want to{" "}
                {task?.archived ? "unarchive" : "archive"}
                <strong> {task?.name}?</strong>
              </>
            }
            subText={`Task will ${task?.archived ? "" : "not"} be able to assigned to any employee`}
          />
        }
        onOkClick={archiveTask}
      />
      <TaskDetail
        visibility={detailVisibility}
        setVisibility={setDetailVisibility}
        data={task}
        onUpdateAction={onUpdateAction}
      />
    </div>
  );
};

export default DetailProject;
