import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";

import { Card, Col, Dropdown, Menu, Row, Table } from "antd";
import { Link } from "react-router-dom";
import routes from "../../config/routes";
import { MoreOutlined } from "@ant-design/icons";

import { authVar } from "../../App/link";
import ModalConfirm from "../../components/Modal";

import deleteImg from "../../assets/images/delete_btn.svg";
import archiveImg from "../../assets/images/archive_btn.svg";

import styles from "./style.module.scss";




const PROJECT = gql`
    query Project($input: ProjectQueryInput!) {
      Project(input: $input) {
        data {
          id
          name
          client {
            id
            email
          }
          company {
            id
            name
          }
        }
      }
    }
   `


const deleteBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={deleteImg} alt="confirm" /></div><br/>
      <p>Are you sure you want to delete <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['warning-text']}>All the data associated with the project will be deleted permanently.</p>
    </div>
  )
}

const archiveBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={archiveImg} alt="archive-confirm"/></div> <br/>
      <p>Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['archive-text']}>Project will not be able to login to the system.</p>
    </div>
  )
}

const Project = () => {
  const loggedInUser = authVar();
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  }

  const { data: projectData } = useQuery(PROJECT, {
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="edit">
        <Link to={routes.editProject.path(loggedInUser?.company?.code ?? '1', data?.id ?? '1')}>Edit Project</Link>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="archive">
        <div onClick={() => setArchiveVisibility(true)}>Archive Project</div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="delete"><div onClick={() => setModalVisibility(true)}>Delete Project</div></Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Client',
      key: 'client',
      render: (record:any) =>
        <div>
          {record?.client?.email}
        </div>
    },
    // {
    //   title: 'Active Employees',
    //   dataIndex: 'active_employees',
    //   key: 'active_employees',
    // },
    // {
    //   title: 'Project Deadline',
    //   dataIndex: 'deadline',
    //   key: 'deadline',
    // },
    // {
    //   title: 'Project Progress',
    //   key: 'progress',
    //   render: (record:any) =>
    //     <div style={{ width: 170 }}>
    //       <Progress percent={record?.progress} size="small" />
    //     </div>
    // },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   render: (status: string) =>
    //     <div className={styles[`${status}-text`]}>
    //       {status}
    //     </div>,
    // },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']} onClick={(event) => event.stopPropagation()}>
          <Dropdown overlay={menu(record)} trigger={['click']} placement="bottomRight">
            <div className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{paddingLeft: '1rem'}}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>,
    },
  ];

  return (
    <>
      <div className={styles['project-main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['form-col']}>
              <h1>Projects</h1>
            </Col>
            <Col span={12} className={styles['form-col']}>
              <div className={styles['add-new']}>
                <Link to={routes.addProject.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>Add new project</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={projectData?.Project?.data} columns={columns}/>
            </Col>
          </Row>
        </Card>
      </div>
      <ModalConfirm visibility={visibility} setModalVisibility={setModalVisibility} imgSrc={deleteImg}
                    okText={'Delete'} modalBody={deleteBody}/>
      <ModalConfirm visibility={showArchive} setModalVisibility={setArchiveVisibility} imgSrc={archiveImg}
                    okText={'Archive'} modalBody={archiveBody}/>
    </>
  )
}

export default Project;
