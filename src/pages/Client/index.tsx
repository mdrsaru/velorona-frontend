import { useQuery, gql } from '@apollo/client';
import { useState } from "react";

import { Card, Row, Col, Table, Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import {Link} from "react-router-dom";
import routes from "../../config/routes";

import deleteImg from "./../../assets/images/delete_btn.svg";
import archiveImg from "./../../assets/images/archive_btn.svg";
import styles from "./style.module.scss";
import ModalConfirm from "../../components/Modal";


const {SubMenu} = Menu;
const CLIENT = gql`
  query Client {
    Client {
      data {
        id
        name
        status
      }
    }
  }
`
const deleteBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={deleteImg} alt="confirm" /></div><br/>
      <p>Are you sure you want to delete <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['warning-text']}>All the data associated with the client will be deleted permanently.</p>
    </div>
  )
}

const archiveBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={archiveImg} alt="archive-confirm"/></div> <br/>
      <p>Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['archive-text']}>Client will not be able to login to the system.</p>
    </div>
  )
}


const Client = () => {
  const {data: clientData} = useQuery(CLIENT)
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  }

  const menu = (
    <Menu>
      <SubMenu title="Change status" key="4">
        <Menu.Item key="0">Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="1">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="2">
        <div onClick={() => setArchiveVisibility(true)}>Archive Client</div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="3">
        <div onClick={() => setModalVisibility(true)}>Delete Client</div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      render: () =>
        <div className={styles['dropdown-menu']}>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <div className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{paddingLeft: '1rem'}}>
              <MoreOutlined/>
            </div>
          </Dropdown>
        </div>,
    },
  ];

  return (
    <>
      <div className={styles['client-main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['form-col']}>
              <h1>Clients</h1>
            </Col>
            <Col span={12} className={styles['form-col']}>
              <div className={styles['add-new-client']}>
                <Link to={routes.addClient.routePath}>Add new client</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={clientData?.Client?.data} columns={columns} rowKey={(record => record?.id)}/>
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

export default Client;
