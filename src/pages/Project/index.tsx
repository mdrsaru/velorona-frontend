import { useEffect, useState } from 'react'
import { gql, useMutation, useQuery } from '@apollo/client'

import { Avatar, Button, Card, Col, Dropdown, Form, Input, Menu, message, Row, Select, Table } from 'antd'
import { Link } from 'react-router-dom'
import routes from '../../config/routes'
import { SearchOutlined, FormOutlined, CheckCircleFilled, CloseCircleFilled, DeleteOutlined, UserOutlined,FileSyncOutlined } from "@ant-design/icons"

import { authVar } from '../../App/link';
import ModalConfirm from '../../components/Modal';

import constants, { archived, status } from '../../config/constants';
import deleteImg from '../../assets/images/delete_btn.svg';
import filterImg from "../../assets/images/filter.svg"
import archiveImg from '../../assets/images/archive_btn.svg';

import ArchiveBody from '../../components/Archive';
import { notifyGraphqlError } from '../../utils/error';

import { MutationProjectUpdateArgs, Project, ProjectPagingResult, ProjectStatus, QueryProjectArgs } from '../../interfaces/generated';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import styles from './style.module.scss';
import PageHeader from '../../components/PageHeader'
import { debounce } from 'lodash'
import AssignedUser from './AssignedUser'

export const PROJECT = gql`
  query Project($input: ProjectQueryInput!) {
    Project(input: $input) {
      data {
        id
        name
        client {
          id
          email
          name
        }
        company {
          id
          name
        }
        status
        archived
        users{
          id
          fullName
          email
          userPayRate{
          id
          }
        }
      }
    }
  }
`;

export const PROJECT_UPDATE = gql`
  mutation ProjectUpdate($input: ProjectUpdateInput!) {
    ProjectUpdate(input: $input) {
      id
      name
      client {
        id
        email
        name
      }
      status
      archived
      company {
        id
        name
      }
    }
  }
`;

const DeleteBody = () => {
  return (
    <div className={styles["modal-message"]}>
      <div>
        <img src={deleteImg} alt="confirm" />
      </div>
      <br />
      <p>
        Are you sure you want to delete
        <strong>Insight Workshop Pvt. Ltd?</strong>
      </p>
      <p className={styles["warning-text"]}>
        All the data associated with the project will be deleted permanently.
      </p>
    </div>
  );
};


const { Option } = Select;

const ProjectPage = () => {
  const loggedInUser = authVar();
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [project, setProject] = useState<Project>();
  const [showAssignedUser, setShowAssignedUser] = useState<boolean>(false)

  const [filterForm] = Form.useForm();
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const [filterProperty, setFilterProperty] = useState<any>({
    filter: false,
  });

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const setModalVisibility = (value: boolean) => {
    setVisibility(value);
  };
  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };
  const { data: projectData, refetch: refetchProject } = useQuery<GraphQLResponse<'Project', ProjectPagingResult>, QueryProjectArgs>(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id ?? '',
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [projectUpdate, { loading: updateLoading }] = useMutation<GraphQLResponse<'ProjectUpdate', Project>, MutationProjectUpdateArgs>(
    PROJECT_UPDATE, {
    onCompleted() {
      message.success({
        content: `Project is updated successfully!`,
        className: "custom-message",
      });
      setArchiveVisibility(false);
    },
    onError(err) {
      setArchiveVisibility(false);
      notifyGraphqlError(err);
    },
    update(cache) {
      const normalizedId = cache.identify({ id: project?.id, __typename: "Project" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  }
  );

  const refetchProjects = () => {

    let values = filterForm.getFieldsValue(['search', 'role', 'status','archived'])

    let input: {
      paging?: any,
      query: any
    } = {
      paging: {
        order: ["updatedAt:DESC"],
      },

      query: {
        company_id: loggedInUser?.company?.id
      }

    }

    let query: {
      status?: string,
      archived?: boolean,
      search?: boolean,
      company_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string
    }


    if (values.status) {
      if (values.status === 'Active' || values.status === 'Inactive') {
        query['status'] = values.status;
      }
    }

    if (values.archived) {
      query['archived'] = values?.archived
    }

    if (values.search) {
      query['search'] = values?.search
    }

    input['query'] = query

    refetchProject({
      input: input
    })
  }

  const onChangeFilter = () => {
    refetchProjects()
  }

  const openFilterRow = () => {
    if (filterProperty?.filter) {
      refetchProject({
        input: {
          paging: {
            order: ["updatedAt:DESC"],
          },
          query: {
            company_id: loggedInUser?.company?.id as string,
          }
        }
      })
    }
    filterForm.resetFields()
    setFilterProperty({
      filter: !filterProperty?.filter
    })
  }


  const debouncedResults = debounce(() => { onChangeFilter() }, 600);

  useEffect(() => {
    return () => {
      debouncedResults.cancel();
    };
  });
  const archiveProject = () => {
    projectUpdate({
      variables: {
        input: {
          id: project?.id ?? '',
          archived: !project?.archived,
          company_id: loggedInUser?.company?.id ?? '',
          name: project?.name ?? '',
        },
      },
    });
  };

  const changeStatus = (value: ProjectStatus, id: string, name: string) => {
    projectUpdate({
      variables: {
        input: {
          status: value ?? '',
          id: id,
          name: name,
          company_id: loggedInUser?.company?.id ?? '',
        },
      },
    });
  };

  const menu = (data: Project) => (
    <Menu>
      {/* <SubMenu title="Change status" key="mainMenu"> */}
      <Menu.Item
        key="active"
        onClick={() => {
          setProject(data);
          if (data?.status === "Inactive") {
            changeStatus(ProjectStatus?.Active, data?.id, data?.name);
          }
        }}
      >
        Active
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item
        key="inactive"
        onClick={() => {
          if (data?.status === "Active") {
            setProject(data);
            changeStatus(ProjectStatus?.Inactive, data?.id, data?.name);
          }
        }}
      >
        Inactive
      </Menu.Item>
      {/* </SubMenu> */}
      <Menu.Divider />

      {/* <Menu.Item key="edit">
        <Link
          to={routes.editProject.path(
            loggedInUser?.company?.code ?? "1",
            data?.id ?? "1"
          )}
        >
          Edit Project
        </Link>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="archive" className={styles.list}>
        <div
          onClick={() => {
            setProject(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Project" : "Archive Project"}
        </div>
      </Menu.Item>
      <Menu.Divider /> */}

      {/* <Menu.Item key="delete">
        <div onClick={() => setModalVisibility(true)}>
          Delete Project
        </div>
      </Menu.Item> */}
    </Menu>
  );

  const handleViewAssignedUser = (record: any) => {
    setShowAssignedUser(!showAssignedUser)
    setProject(record)
  }

  const columns = [
    {
      title: "Project Name",
      key: "name",
      render: (record: Project) => <div>{record?.name}</div>
    },
    {
      title: "Client Name",
      key: "client",
      render: (record: Project) => <div>{record?.client?.name ? record?.client?.name : '-'}</div>,
    },
    {
      title: "Client Email",
      key: "client",
      render: (record: Project) => <div>{record?.client?.email ? record?.client?.email : '-'}</div>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <div className={styles[`${status}-text`]}>{status}</div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Project) => (
        <>
          {/* <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Dropdown
            overlay={menu(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ paddingLeft: "1rem" }}
            >
              <MoreOutlined />
            </div>
          </Dropdown>
        </div> */}
          <Row style={{ marginTop: '11px' }}>
            <Col>
              <div
                className={styles["table-icon"]}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  onClick={() => handleViewAssignedUser(record)}
                  title="Assigned User"
                >
                  <Avatar size={28} icon={<UserOutlined />} />
                </div>
              </div>
            </Col>
            <Col>
              <div
                className={styles["table-icon"]}
                onClick={(event) => event.stopPropagation()}
              >
                <Dropdown
                  overlay={menu(record)}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <div
                    className="ant-dropdown-link"
                    onClick={(e) => e.preventDefault()}
                    title='Change Status'
                  >
                    {record?.status === 'Active' ?
                      <div className={styles["table-inactive-status-icon"]} >
                        <CloseCircleFilled />
                      </div>
                      :
                      <div className={styles["table-active-status-icon"]}>

                        <CheckCircleFilled />
                      </div>
                    }
                  </div>
                </Dropdown>
              </div>
            </Col>
            <Col>
              <Link
                to={routes.editProject.path(
                  loggedInUser?.company?.code ?? "1",
                  record?.id ?? "1"
                )}
                className={`${styles["table-icon"]} ${styles["table-client-icon"]}`}
                title='Edit Project'
              >
                <FormOutlined />
              </Link>
            </Col>
            <Col>

              <div
                onClick={() => {
                  setProject(record);
                  setArchiveVisibility(true);
                }}
                className={`${styles["table-icon"]} ${styles["table-archive-icon"]}`}
                title={!record.archived ? 'Archive Project' :'Unarchive Project'}
              >
                { !record.archived ?<DeleteOutlined /> : <FileSyncOutlined />}
              </div>

            </Col>
          </Row>
        </>
      ),
    },
  ];

  return (

    <div className={styles["project-main-div"]}>
      <Card bordered={false}>
        <PageHeader
          title="Projects"
          extra={[
            <div className={styles["add-new"]} key="new-project">
              <Link
                to={routes.addProject.path(
                  loggedInUser?.company?.code
                    ? loggedInUser?.company?.code
                    : ""
                )}
              >
                Add new project
              </Link>
            </div>
          ]}
        />

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
                  placeholder="Search by Project name"
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
          {filterProperty?.filter &&
            <Row gutter={[32, 0]} className={styles["role-status-col"]}>

              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name="status" label="">
                  <Select
                    placeholder="Select status"
                    onChange={onChangeFilter}
                  >
                    {status?.map((status: any) =>
                      <Option value={status?.value} key={status?.name}>
                        {status?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={10} lg={8} xl={5}>
                <Form.Item name="archived" label="">
                  <Select
                    placeholder="Archived status"
                    onChange={onChangeFilter}
                  >
                    {archived?.map((archived: any) =>
                      <Option value={archived?.value} key={archived?.name}>
                        {archived?.name}
                      </Option>)}
                  </Select>
                </Form.Item>
              </Col>
            </Row>}
        </Form>
        <Row className='container-row'>
          <Col span={24}>
            <Table
              dataSource={projectData?.Project?.data}
              columns={columns}
              rowKey={(record) => record?.id}
              loading={updateLoading}
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: projectData?.Project?.paging?.total,
                pageSize: constants.paging.perPage
              }}
            />
          </Col>
        </Row>
      </Card>

      <ModalConfirm
        visibility={visibility}
        setModalVisibility={setModalVisibility}
        imgSrc={deleteImg}
        okText={"Delete"}
        modalBody={<DeleteBody />}
      />

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={project?.archived ? "Unarchive" : "Archive"}
        closable
        modalBody={
          <ArchiveBody
            title={
              <>
                Are you sure you want to{" "}
                {project?.archived ? "unarchive" : "archive"}
                <strong> {project?.name}</strong>
              </>
            }
            subText={`Project will ${project?.archived ? "" : "not"} be able to assigned to any employee`}
          />
        }
        onOkClick={archiveProject}
      />

      {showAssignedUser ?
        <AssignedUser
          visibility={showAssignedUser}
          setVisibility={setShowAssignedUser}
          project={project}
          refetch={refetchProject}
        />
        :
        null}
    </div>
  );
};

export default ProjectPage;
