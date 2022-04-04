import React, {useState} from "react";

import { Card, Col, Dropdown, Menu, Row, Table, Progress } from "antd";
import {Link} from "react-router-dom";
import routes from "../../config/routes";

import ModalConfirm from "../../components/Modal";

import deleteImg from "../../assets/images/delete_btn.svg";

import archiveImg from "../../assets/images/archive_btn.svg";
import styles from "./style.module.scss";
import {MoreOutlined} from "@ant-design/icons";




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
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  }

  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="edit">
        <div>Edit Project</div>
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
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
    },
    {
      title: 'Active Employees',
      dataIndex: 'active_employees',
      key: 'active_employees',
    },
    {
      title: 'Project Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
    },
    {
      title: 'Project Progress',
      key: 'progress',
      render: (record:any) =>
        <div style={{ width: 170 }}>
          <Progress percent={record?.progress} size="small" />
        </div>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        <div className={styles[`${status}-text`]}>
          {status}
        </div>,
    },
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

  const data = [
    {
      key: '1',
      name: 'Vellorum',
      vendor: 'Spark College',
      active_employees: '2',
      deadline: '02-02-2022',
      status: 'Active',
      progress: 30
    },
    {
      key: '2',
      name: 'Vellorum',
      vendor: 'Insight Workshop',
      active_employees: '2',
      deadline: '02-04-2022',
      status: 'Active',
      progress: 100
    },
    {
      key: '3',
      name: 'Vellorum',
      vendor: 'Araniko College',
      active_employees: '2',
      deadline: '02-04-2022',
      status: 'Closed',
      progress: 80
    },
    {
      key: '4',
      name: 'Vellorum',
      vendor: 'New College',
      active_employees: '2',
      deadline: '02-04-2022',
      status: 'Inactive',
      progress: 50
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
                <Link to={routes.addProject.path}>Add new project</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={data} columns={columns}/>
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
