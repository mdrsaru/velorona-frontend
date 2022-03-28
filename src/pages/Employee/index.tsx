import { Card, Row, Col, Table, Dropdown, Menu } from 'antd';
import {MoreOutlined} from "@ant-design/icons";

import { Link } from "react-router-dom";
import routes from "../../config/routes";

import styles from './style.module.scss';
import {gql, useQuery} from "@apollo/client";
import {authVar} from "../../App/link";
import {useState} from "react";
import deleteImg from "../../assets/images/delete_btn.svg";
import archiveImg from "../../assets/images/archive_btn.svg";
import ModalConfirm from "../../components/Modal";
import moment from "moment";

const {SubMenu} = Menu;

const USER = gql`
  query User($input: UserQueryInput) {
    User(input: $input) {
      data {
        id
        email
        phone
        fullName
        firstName
        lastName
        middleName
        status
        roles {
          id
          name
        }
        address {
          streetAddress
          city
          zipcode
        }
        record {
          startDate 
          endDate
          payRate
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
      <p className={styles['warning-text']}>All the data associated with the employee will be deleted permanently.</p>
    </div>
  )
}

const archiveBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div><img src={archiveImg} alt="archive-confirm"/></div> <br/>
      <p>Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong></p>
      <p className={styles['archive-text']}>Employee will not be able to login to the system.</p>
    </div>
  )
}

const Employee = () => {
  const loggedInUser = authVar();
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  }

  const {data: employeeData} = useQuery(USER, {
    variables: {
      input: {
        query: {
          // name: constants.roles.Employee
        }
      }
    }
  })

  const menu = (id: string) => (
    <Menu>
      <SubMenu title="Change status" key="5">
        <Menu.Item key="0">Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="1">Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="2">
        <div><Link to={routes.editEmployee.routePath(loggedInUser?.client?.code ?? '1', id ?? '1')}>Edit Employee</Link></div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="3">
        <div onClick={() => setArchiveVisibility(true)}>Archive Employee</div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="4"><div onClick={() => setModalVisibility(true)}>Delete Employee</div></Menu.Item>
    </Menu>
  );
  const columns = [
    {
      title: 'Employee Info',
      render: (user: any) => {
        return <div>
          <p>Name: {user?.fullName}</p>
          <p>Phone: {user?.phone}</p>
          <p>Email: {user?.email}</p>
          <p>Address: {user?.address?.streetAddress}</p>
        </div>
      }
    },
    {
      title: 'Role',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: { name: string; id: string;}[]) => `${roles[0]?.name}`
    },
    {
      title: 'Start Date',
      render: (user: any) => {
        console.log(user);
        return <div>
          <p>{moment(user?.record?.startDate).format('Do MMMM YYYY') ?? 'N/A'}</p>
        </div>
      }
    },
    {
      title: 'End Date',
      render: (user: any) => {
        console.log(user);
        return <div>
          <p>{moment(user?.record?.endDate).format('Do MMMM YYYY') ?? 'N/A'}</p>
        </div>
      }
    },
    {
      title: 'Pay Rate',
      render: (user: any) => {
        return <div>
          <p>{user?.record?.payRate ?? 'N/A'}</p>
        </div>
      }
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
      dataIndex: 'id',
      key: 'actions',
      render: (id: string) =>
        <div className={styles['dropdown-menu']}>
          <Dropdown overlay={menu(id)} trigger={['click']} placement="bottomRight">
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
            <Table dataSource={employeeData?.User?.data} columns={columns} rowKey={(record => record?.id)} />
          </Col>
        </Row>
      </Card>
      <ModalConfirm visibility={visibility} setModalVisibility={setModalVisibility} imgSrc={deleteImg}
                    okText={'Delete'} modalBody={deleteBody}/>
      <ModalConfirm visibility={showArchive} setModalVisibility={setArchiveVisibility} imgSrc={archiveImg}
                    okText={'Archive'} modalBody={archiveBody}/>
    </div>
  )
}

export default Employee;
