import React from "react";
import { Card, Col, Dropdown, Menu, Row, Table } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import { authVar } from "../../App/link";
import { Link } from "react-router-dom";
import routes from "../../config/routes";

import styles from "./style.module.scss";


const {SubMenu} = Menu;

const Invoice = () => {
  const loggedInUser = authVar();

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item key="active">Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="inactive">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="archive">
        <div>Archive Invoice</div>
      </Menu.Item>
    </Menu>
  );

  const data = [
    {
      key: '1',
      project_name: '02-02-2022',
      client_name: '02-04-2022',
      email: '2',
      date: '02-04-2022',
      amount: '$250',
      status: 'Pending'
    },
    {
      key: '2',
      project_name: '02-02-2022',
      client_name: '02-04-2022',
      email: '2',
      date: '02-04-2022',
      amount: '$250',
      status: 'Pending'
    },
    {
      key: '3',
      project_name: '02-02-2022',
      client_name: '02-04-2022',
      email: '2',
      date: '02-04-2022',
      amount: '$250',
      status: 'Pending'
    },
    {
      key: '4',
      project_name: '02-02-2022',
      client_name: '02-04-2022',
      email: '2',
      date: '02-04-2022',
      amount: '$250',
      status: 'Pending'
    },
  ];


  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'project_name',
      key: 'project_name',
    },
    {
      title: 'Client Name',
      dataIndex: 'client_name',
      key: 'client_name'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Issued Date',
      dataIndex: 'date',
      key: 'date'
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount'
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
          <Col span={12} className={styles['invoice-col']}>
            <h1>Invoice History</h1>
          </Col>
          <Col span={12} className={styles['invoice-col']}>
            <div className={styles['add-new-invoice']}>
              <Link to={routes.addInvoice.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>
                Add Invoice
              </Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table dataSource={data} columns={columns} rowKey={(record => record?.key)}/>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Invoice;
