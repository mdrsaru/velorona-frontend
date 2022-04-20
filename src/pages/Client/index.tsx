import React from "react";
import { Card, Col, Dropdown, Menu, Row, Table } from "antd";

import { Link } from "react-router-dom";
import routes from "../../config/routes";
import { authVar } from "../../App/link";

import { useQuery } from "@apollo/client";
import { MoreOutlined } from "@ant-design/icons";

import styles from "./style.module.scss";
import {USER} from "../Employee";
import constants from "../../config/constants";

const { SubMenu } = Menu;



const Client = () => {
  const loggedInUser = authVar();
  const { data: clientData } = useQuery(USER, {
    variables: {
      input: {
        query: {
          role: constants.roles.Client
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item key="active">Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="inactive">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="archive">
        <div>Archive Client</div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Phone Number',
      dataIndex: 'phone',
      key: 'phone'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        <span className={status === 'Active' ? styles['active-status'] : styles['inactive-status']}>
          {status}
        </span>
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

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['client-col']}>
              <h1>Client</h1>
            </Col>
            <Col span={12} className={styles['client-col']}>
              <div className={styles['add-new-client']}>
                <Link to={routes.addClient.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>
                  Add New Client
                </Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={clientData?.User?.data} columns={columns} rowKey={(record => record?.id)}/>
            </Col>
          </Row>
        </Card>
    </div>
  )
}

export default Client;
