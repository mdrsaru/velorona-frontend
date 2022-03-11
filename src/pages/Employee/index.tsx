import { Card, Row, Col, Table, Dropdown, Menu } from 'antd';
import {MoreOutlined} from "@ant-design/icons";

import { Link } from "react-router-dom";
import routes from "../../config/routes";

import styles from './style.module.scss';

const { SubMenu } = Menu;

const Employee = () => {
  const menu = (
    <Menu>
      <SubMenu title="Change status" key="4">
        <Menu.Item key="0">Active</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="1">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider />
      <Menu.Item key="2">
        <div>Archive Employee</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3"><div>Delete Employee</div></Menu.Item>
    </Menu>
  );
  const columns = [
    {
      title: 'Employee Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Reports to',
      dataIndex: 'reports_to',
      key: 'reports_to',
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
  const dataSource = [
    {
      key: '1',
      name: 'Mike',
      role: 32,
      email: "mike@gmail.com",
      reports_to: '10 Downing Street',
      status: 'Active',
      actions: ''
    },
    {
      key: '2',
      name: 'John',
      role: 42,
      email: "john@gmail.com",
      reports_to: '10 Downing Street',
      status: 'Active',
      actions: ''
    },
    {
      key: '3',
      name: 'John',
      role: 42,
      email: "john@gmail.com",
      reports_to: '10 Downing Street',
      status: 'Active',
      actions: ''
    },
    {
      key: '4',
      name: 'John',
      role: 42,
      email: "john@gmail.com",
      reports_to: '10 Downing Street',
      status: 'Active',
      actions: ''
    },
  ];
  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['employee-col']}>
            <h1>Employee</h1>
          </Col>
          <Col span={12} className={styles['employee-col']}>
            <div className={styles['add-new-employee']}>
              <Link to={routes.addEmployee.routePath}>Add New Employee</Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table dataSource={dataSource} columns={columns} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Employee;
