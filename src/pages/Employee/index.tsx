import { Card, Row, Col, Table, Dropdown, Menu } from 'antd';
import { MoreOutlined } from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import routes from "../../config/routes";

import styles from './style.module.scss';
import { gql, useMutation, useQuery } from "@apollo/client";
import { authVar } from "../../App/link";
import { useState } from "react";
import deleteImg from "../../assets/images/delete_btn.svg";
import archiveImg from "../../assets/images/archive_btn.svg";
import ModalConfirm from "../../components/Modal";
import moment from "moment";
import { notifyGraphqlError } from "../../utils/error";
import AppLoader from "../../components/Skeleton/AppLoader";

const {SubMenu} = Menu;

const USER = gql`
  query User($input: UserQueryInput) {
    User(input: $input) {
      data {
        id
        email
        phone
        fullName
        status
        roles {
          id
          name
        }
        address {
          streetAddress
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

const EMPLOYEE_UPDATE = gql`
  mutation UserUpdate($input: UserUpdateInput!) {
      UserUpdate(input: $input) {
          id
          firstName
          lastName
          email
          status
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
  const navigate = useNavigate();
  const [EmployeeUpdate] = useMutation(EMPLOYEE_UPDATE);
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  }

  const { loading: employeeLoading, data: employeeData } = useQuery(USER, {
    variables: {
      input: {
        query: {
          // name: constants.roles.Employee
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const changeStatus = (value: string, id: string) => {
    EmployeeUpdate({
      variables: {
        input: {
          status: value,
          id: id
        }
      }
    }).then((response: any) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      }
    }).catch(notifyGraphqlError)
  }

  const onRowClick = (record: any, rowIndex: any) => {
    return {
      onClick: (event: any) => {
        navigate(routes.detailEmployee.path(loggedInUser?.company?.code ?? '', record?.id ?? ''));
      },
    };
  };

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item key="active" onClick={() => changeStatus('Active', data?.id)}>Active</Menu.Item>
        <Menu.Divider/>
        <Menu.Item key="inactive" onClick={() => changeStatus('Inactive', data?.id)}>Inactive</Menu.Item>
      </SubMenu>
      <Menu.Divider/>
      <Menu.Item key="edit">
        <div><Link to={routes.editEmployee.path(loggedInUser?.company?.code ?? '1', data?.id ?? '1')}>Edit Employee</Link></div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="archive">
        <div onClick={() => setArchiveVisibility(true)}>Archive Employee</div>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item key="delete"><div onClick={() => setModalVisibility(true)}>Delete Employee</div></Menu.Item>
    </Menu>
  );
  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
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
        return <div>
          <p>{moment(user?.record?.startDate).format('Do MMMM YYYY') ?? 'N/A'}</p>
        </div>
      }
    },
    {
      title: 'End Date',
      render: (user: any) => {
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
      {employeeLoading ?
        <AppLoader loading={employeeLoading} count={14}/> :
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['employee-col']}>
              <h1>Employee</h1>
            </Col>
            <Col span={12} className={styles['employee-col']}>
              <div className={styles['add-new-employee']}>
                <Link to={routes.addEmployee.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>Add
                  New Employee
                </Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={employeeData?.User?.data} columns={columns} rowKey={(record => record?.id)}
                     onRow={onRowClick}/>
            </Col>
          </Row>
        </Card>}
      <ModalConfirm visibility={visibility} setModalVisibility={setModalVisibility} imgSrc={deleteImg}
                    okText={'Delete'} modalBody={deleteBody}/>
      <ModalConfirm visibility={showArchive} setModalVisibility={setArchiveVisibility} imgSrc={archiveImg}
                    okText={'Archive'} modalBody={archiveBody}/>
    </div>
  )
}

export default Employee;
