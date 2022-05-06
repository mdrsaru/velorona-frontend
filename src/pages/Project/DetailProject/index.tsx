import { Card, Col, Dropdown, Menu, Row, Table } from "antd";
import { ArrowLeftOutlined, MoreOutlined } from "@ant-design/icons";
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { authVar } from "../../../App/link";
import { useQuery } from "@apollo/client";

import { PROJECT } from "../index";
import { TASK } from "../../Tasks";
import routes from "../../../config/routes";

import styles from "../style.module.scss";

const { SubMenu } = Menu;

const DetailProject = () => {
  let params = useParams();
  const navigate = useNavigate();
  const loggedInUser = authVar();

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item key="active">Active</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="inactive">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider />

      <Menu.Item key="archive">
        <div>Archive Project</div>
      </Menu.Item>
      <Menu.Divider />
      
      <Menu.Item key="delete">
        <div>Delete Project</div>
      </Menu.Item>
    </Menu>
  );
  const columns = [
    {
      title: 'Task Name',
      key: 'name',
      render: (task: any) => {
        return <div className={styles['task-name']}>
          <p>{task?.name}</p>
        </div>
      },
      onCell: (record: any) => {
        return {
          onClick: () => {
            navigate(routes.detailProject.path(loggedInUser?.company?.code ?? '', record?.id ?? ''));
          },
        };
      },
    },
    {
      title: 'Task Manager',
      key: 'manager',
      render: (task: any) => {
        return <div>
          <p>{task?.name}</p>
        </div>
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div
          className={styles['dropdown-menu']}
          onClick={(event) => event.stopPropagation()}>
          <Dropdown
            overlay={menu(record)}
            trigger={['click']}
            placement="bottomRight">
            <div
              className="ant-dropdown-link"
              onClick={e => e.preventDefault()}
              style={{ paddingLeft: '1rem' }}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>,
    },
  ];

  const { data: projectData } = useQuery(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          id: params?.pid
        },
      }
    }
  })

  const { data: taskData } = useQuery(TASK, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          project_id: params?.pid
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['project-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Project :&nbsp;
              <span>{projectData?.Project?.data[0]?.name ?? ''}</span>
            </h1>
          </Col>
          <Col span={12} className={styles['project-add-task']}>
            <div>
              <Link to={routes.addTasksProject.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '',
                params?.pid ?? '')}>
                Add new Task
              </Link>
            </div>
          </Col>
        </Row>
      </Card>
      <br />
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['project-col']}>
            <h1>Task List</h1>
          </Col>
        </Row>
        <br />
        <Row>
          <Col span={24}>
            <Table
              dataSource={taskData?.Task?.data}
              columns={columns}
              rowKey={(record => record?.id)} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default DetailProject;
