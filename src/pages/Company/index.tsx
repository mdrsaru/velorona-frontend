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
const COMPANY = gql`
  query Company {
    Company {
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
      <p className={styles['warning-text']}>All the data associated with the company will be deleted permanently.</p>
    </div>
  )
}

const archiveBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={archiveImg} alt="archive-confirm"/></div> <br/>
      <p>Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['archive-text']}>Company will not be able to login to the system.</p>
    </div>
  )
}


const Company = () => {
  const {data: companyData} = useQuery(COMPANY)
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
        <Menu.Item key="Active">Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="Inactive">Inactive</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="Archived">Archived</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="2">
        <div onClick={() => setArchiveVisibility(true)}>Archive Company</div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="3">
        <div onClick={() => setModalVisibility(true)}>Delete Company</div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Company Name',
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
      <div className={styles['company-main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['form-col']}>
              <h1>Companies</h1>
            </Col>
            <Col span={12} className={styles['form-col']}>
              <div className={styles['add-new-company']}>
                <Link to={routes.addCompany.path}>Add new company</Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={companyData?.Company?.data} columns={columns} rowKey={(record => record?.id)}/>
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

export default Company;
