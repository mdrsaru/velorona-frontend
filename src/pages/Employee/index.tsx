import { Card, Row, Col, Table, Dropdown, Menu } from 'antd';
import {MoreOutlined} from "@ant-design/icons";

import { Link } from "react-router-dom";
import routes from "../../config/routes";

import styles from './style.module.scss';
import {gql, useQuery} from "@apollo/client";
import constants from "../../config/constants";
import {authVar} from "../../App/link";

const { SubMenu } = Menu;

const ROLE = gql`
  query Role($input: RoleQueryInput) {
    Role(input: $input) {
      data {
        id
        name
        description
      }
    }
  }
`

const Employee = () => {
  const loggedInUser = authVar();
  const {data: employeeData} = useQuery(ROLE, {
    variables: {
      input: {
        query: {
          name: constants.roles.Employee
        }
      }
    }
  })

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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
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
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['employee-col']}>
            <h1>Employee</h1>
          </Col>
          <Col span={12} className={styles['employee-col']}>
            <div className={styles['add-new-employee']}>
              <Link to={routes.addEmployee.routePath(loggedInUser?.client?.code ? loggedInUser?.client?.code : '')}>Add New Employee</Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table dataSource={employeeData?.Role?.data} columns={columns} rowKey={(record => record?.id)} />
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default Employee;
