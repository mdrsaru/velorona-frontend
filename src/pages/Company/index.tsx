import moment from 'moment';
import { debounce } from 'lodash';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { SearchOutlined, SendOutlined, FormOutlined, UserOutlined, FileExcelOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { Card, Row, Col, Table, Menu, Dropdown, Form, Select, Button, Input, Popconfirm, message } from 'antd';

import routes from '../../config/routes';
import constants, { company_status } from '../../config/constants';
import { notifyGraphqlError } from '../../utils/error';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import {
  Company as ICompany,
  CompanyPagingResult,
  CompanyStatus,
  MutationCompanyUpdateArgs,
  QueryCompanyArgs,
  MutationCompanyResendInvitationArgs,
} from '../../interfaces/generated';

import Status from '../../components/Status';
import ModalConfirm from '../../components/Modal';

import deleteImg from './../../assets/images/delete_btn.svg';
import archiveImg from './../../assets/images/archive_btn.svg';
import filterImg from "../../assets/images/filter.svg"

import styles from './style.module.scss';

export const COMPANY = gql`
  query Company($input:CompanyQueryInput) {
    Company(input:$input) {
      paging {
        total
      }
      data {
        id
        name
        status
        createdAt 
        companyCode
        unapprovedNotification
        logo {
          id
          name
          url
        }
        admin{
          id
        email
        phone
        firstName
        middleName
        lastName
        fullName
        status
        designation
        address {
          country
          city
          streetAddress
          zipcode
          state
          aptOrSuite
        }
        }
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
      companyCode
      createdAt 
      subscriptionPeriodEnd
      logo{
        id
        name 
        url 
      }
    }
  }
`;

export const COMPANY_RESEND = gql`
  mutation CompanyResendInvitation($input: CompanyResendInvitationInput!) {
    CompanyResendInvitation(input: $input) 
  }
`;

const DeleteBody = () => {
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

const ArchiveBody = () => {
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

const {Option} = Select;
const Company = () => {
  const navigate = useNavigate();
  const [filterForm] = Form.useForm();

  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });

  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const { data: companyData, loading: dataLoading, refetch:refetchCompany } = useQuery<
    GraphQLResponse<'Company', CompanyPagingResult>,
    QueryCompanyArgs
  >(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    variables: {
      input: {
        paging: {
          skip: pagingInput.skip,
          take: constants.paging.perPage,
          order: ['createdAt:DESC'],
        }
      }
    }
  });
  
  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });


  const [updateCompany, { loading: updatingCompany }] = useMutation<
  GraphQLResponse<'CompanyUpdate', ICompany>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted: (response) => {
      if(response?.CompanyUpdate) {
        message.success('Status updated successfully.')
      }
    },
    onError: notifyGraphqlError,
  })

  const [visibility, setVisibility] = useState(false);
  const [showArchive, setArchiveModal] = useState(false);
  const setModalVisibility = (value: boolean) => {
    setVisibility(value)
  }

  const [resendCompanyInvitation, { loading: resendingEmail }] = useMutation<
  GraphQLResponse<'CompanyResendInvitation', string>,
    MutationCompanyResendInvitationArgs
  >(COMPANY_RESEND, {
    onCompleted(response) {
      if(response?.CompanyResendInvitation) {
        message.success(response.CompanyResendInvitation)
      }
    },
    onError: notifyGraphqlError,
  });

  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value)
  };

  const changeStatus = (value: string, id: string) => {
    updateCompany({
      variables: {
        input: {
          status: value as CompanyStatus,
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

  const refetchCompanies = () => {
    let values = filterForm.getFieldsValue(['search', 'role', 'status'])

    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ['createdAt:DESC'],
      },

      query: {}

    }

    let query: {
      status?: string,
      search?:boolean,
    } = {
    }


    if (values.status) {
      query['status'] = values.status;
    } 

    if (values.search) {
      query['search'] = values?.search
    }

    input['query'] = query

    refetchCompany({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchCompanies()
  }

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchCompany({
        input: {
          paging: {
            order: ["createdAt:DESC"],
          },
          query: { }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }

  const resendInvitation = (id: string) => {
    return () => {
      resendCompanyInvitation({
        variables: {
          input: {
            id,
          }
        }
      })
    }
  }

  const statusMenu = (data: ICompany) => {
    return (
      <Menu>
        <Menu.Item key="active"
          onClick={() => changeStatus('Active', data?.id) }>
          Active
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          key="inactive"
          onClick={() => changeStatus('Inactive', data?.id)}
        >
          Inactive
        </Menu.Item>

        <Menu.Divider />

        <Menu.Item
          key="unapproved"
          onClick={() => changeStatus('Unapproved', data?.id)}
        >
          Unapproved
        </Menu.Item>
      </Menu>
    )
  }

  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <Status status={status} />
      )
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
        <div className={styles['actions']}>
          <span className={styles['status-icon']} title="Login to company">
            <a href={`/${record.companyCode}`} target="_blank" rel="noreferrer">
              <UserOutlined />
            </a>
          </span>

          <span className={styles['status-icon']} title="Edit Company">
            <Link to={routes.editCompany.path(record.id)}>
              <FormOutlined />
            </Link>
          </span>

          <span className={styles['status-icon']} title="Change status">
            <Dropdown
              trigger={['click']}
              overlay={statusMenu(record)}
              placement="bottomRight"
            >
              {
                record.status === 'Active'   
                  ? <CheckCircleOutlined style={{ color: 'var(--primary-green)' }} />
                  : record.status === 'Inactive'
                  ? <CloseCircleOutlined  style={{ color: 'var(--primary-red)' }} />
                  : <FileExcelOutlined style={{ color: 'var(--primary-orange)' }} />
              }
            </Dropdown>
          </span>

          <span className={styles['status-icon']} title="Resend invitation">
            <Popconfirm
              placement="topLeft"
              title='Are you sure?'
              onConfirm={resendInvitation(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <SendOutlined />
            </Popconfirm>
          </span>
        </div>
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
        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form">
          <Row gutter={[32, 0]}>
            <Col xs={24} sm={24} md={16} lg={17} xl={20}>
              <Form.Item name="search" label="">
                <Input
                  prefix={<SearchOutlined className="site-form-item-icon" />}
                  placeholder="Search by company name"
                  onChange={debouncedResults}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={24} md={8} lg={7} xl={4}>
              <div className={styles['filter-col']}>
                <Button
                  type="text"
                  onClick={openFilterRow}
                  icon={<img
                    src={filterImg}
                    alt="filter"
                    className={styles['filter-image']} />}>
                  &nbsp; &nbsp;
                  {filterProperty?.filter ? 'Reset' : 'Filter'}
                </Button>
              </div>
            </Col>
          </Row>
          <br />
          {filterProperty?.filter &&
            <Row gutter={[32, 0]} className={styles["role-status-col"]}>

              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name="status" label="">
                  <Select
                    placeholder="Select status"
                    onChange={onChangeFilter}
                  >
                    {company_status?.map((status: any) =>
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>}
        </Form>
        <Row className='container-row'>
          <Col span={24}>
            <Table
              loading={dataLoading || resendingEmail || updatingCompany}
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
        modalBody={<DeleteBody />}
      />
      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={'Archive'}
        modalBody={<ArchiveBody />} />
    </div>
  )
}

export default Company;
