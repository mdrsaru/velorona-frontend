import { useQuery, gql, useMutation } from '@apollo/client';
import { useState } from 'react';

import { Card, Row, Col, Table, Menu, Dropdown } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

import { Link, useNavigate } from 'react-router-dom';
import routes from '../../config/routes';

import deleteImg from './../../assets/images/delete_btn.svg';
import archiveImg from './../../assets/images/archive_btn.svg';
import ModalConfirm from '../../components/Modal';
import constants from '../../config/constants';

import { notifyGraphqlError } from '../../utils/error';
import moment from 'moment';
import styles from './style.module.scss';

const { SubMenu } = Menu;
export const COMPANY = gql`
  query Company {
    Company {
      paging {
        total
      }
      data {
        id
        name
        status
        createdAt 
      }
    }
  }
`

export const COMPANY_UPDATE = gql`
  mutation ClientUpdate($input: CompanyUpdateInput!) {
    CompanyUpdate(input: $input) {
      id
      name
      status
      createdAt 
    }
  }
`
const deleteBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div>
        <img src={deleteImg} alt="confirm" />
      </div>
      <br />
      <p>
        Are you sure you want to delete <strong>Insight Workshop Pvt. Ltd?</strong>
      </p>
      <p className={styles['warning-text']}>
        All the data associated with the company will be deleted permanently.
      </p>
    </div>
  )
}

const archiveBody = () => {
  return (
    <div className={styles['modal-message']}>
      <div>
        <img src={archiveImg} alt="archive-confirm" />
      </div>
      <br />
      <p>
        Are you sure you want to archive <strong>Insight Workshop Pvt. Ltd?</strong>
      </p>
      <p className={styles['archive-text']}>
        Company will not be able to login to the system.
      </p>
    </div>
  )
}


const Company = () => {
  const navigate = useNavigate();
  const { data: companyData, loading: dataLoading } = useQuery(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only'
  });
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });
  const [updateCompany] = useMutation(COMPANY_UPDATE)
  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  };

  const changeStatus = (value: string, id: string) => {

    updateCompany({
      variables: {
        input: {
          status: value,
          id: id
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      };
    }).catch(notifyGraphqlError)
  };

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };


  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="1">
        <div onClick={() => navigate(routes.editCompany.path(data?.id ?? '1'))}>
          Edit Company
        </div>
      </Menu.Item>
      <Menu.Divider />
      <SubMenu title="Change status" key="2">
        <Menu.Item key="active"
          onClick={() => {
            if (data?.status === 'Inactive') {
              changeStatus('Active', data?.id)
            }
          }}>
          Active
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="inactive"
          onClick={() => {
            if (data?.status === 'Active') {
              changeStatus('Inactive', data?.id)
            }
          }}>
          Inactive
        </Menu.Item>
      </SubMenu>
      {/* <Menu.Divider />
      <Menu.Item key="3">
        <div onClick={() => setArchiveVisibility(true)}>Archive Company</div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="4">
        <div onClick={() => setModalVisibility(true)}>Delete Company</div>
      </Menu.Item> */}
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
      render: (status: string) =>
        <span className={status === 'Active' ? styles['active-status'] : styles['inactive-status']}>
          {status}
        </span>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: string) =>
        <span>
          {moment(createdAt).format('YYYY/MM/DD')}
        </span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']}>
          <Dropdown
            overlay={menu(record)}
            trigger={['click']}
            placement="bottomRight">
            <div
              className="ant-dropdown-link"
              onClick={e => e.preventDefault()}
              style={{ paddingLeft: '1rem' }}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>,
    },
  ];

  return (
    
    <div className={styles['company-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col
            span={12}
            className={styles['form-col']}>
            <h1>Companies</h1>
          </Col>
          <Col
            span={12}
            className={styles['form-col']}>
            <div className={styles['add-new-company']}>
              <Link to={routes.addCompany.path}>
                Add new company
              </Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              loading={dataLoading}
              dataSource={companyData?.Company?.data}
              columns={columns}
              rowKey={(record => record?.id)}
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: companyData?.Company?.paging?.total,
                pageSize: constants.paging.perPage
              }} />
          </Col>
        </Row>
      </Card>
      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={'Delete'}
        modalBody={deleteBody} />
      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={'Archive'}
        modalBody={archiveBody} />
    </div>
  )
}

export default Company;
