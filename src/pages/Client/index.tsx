import { Modal, Card, Row, Col, Table, Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';
import { useQuery, gql } from '@apollo/client';

import {useState} from "react";
import { Link } from "react-router-dom";

import routes from "../../config/routes";

import styles from "./style.module.scss";
import deleteImg from "./../../assets/images/delete_btn.svg";
import archiveImg from "./../../assets/images/archive_btn.svg";

const { SubMenu } = Menu;
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

const Client = () => {
  const {data: clientData} = useQuery(CLIENT,{
    variables: {

    }
  })
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
        <Menu.Divider />
        <Menu.Item key="1">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider />
      <Menu.Item key="2">
        <div onClick={() => setArchiveVisibility(true)}>Archive Client</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3"><div onClick={() => setModalVisibility(true)}>Delete Client</div></Menu.Item>
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
              <MoreOutlined />
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
              <Table dataSource={clientData?.Client?.data} columns={columns} rowKey={(record => record?.id)} />
            </Col>
          </Row>
        </Card>
      </div>
      <Modal
        title=""
        centered
        visible={visibility}
        okText="Delete"
        closable={false}
        onOk={() => setModalVisibility(false)}
        onCancel={() => setModalVisibility(false)}
        width={1000}>
        <div className={styles['client-modal-message']}>
          <div> <img src={deleteImg} alt="delete-confirm" /></div> <br/>
          <p>Are you sure you want to delete <strong>Insight Workshop Pvt. Ltd?</strong></p>
          <p className={styles['warning-text']}>All the data associated with the client will be deleted permanently.</p>
        </div>
      </Modal>
      <Modal
        title=""
        centered
        visible={showArchive}
        okText="Archive"
        closable={false}
        onOk={() => setArchiveVisibility(false)}
        onCancel={() => setArchiveVisibility(false)}
        width={1000}>
        <div className={styles['client-modal-message']}>
          <div> <img src={archiveImg} alt="archive-confirm"/></div> <br/>
          <p>Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong></p>
          <p className={styles['archive-text']}>Client will not be able to login to the system.</p>
        </div>
      </Modal>
    </>
  )
}

export default Client;
