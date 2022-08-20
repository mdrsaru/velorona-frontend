import { useEffect, useState } from 'react'
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client'

import { Avatar, Button, Card, Col, Dropdown, Form, Menu, message,  Row, Select, Typography } from 'antd'
import { Link } from 'react-router-dom'
import { SearchOutlined, DownloadOutlined, FormOutlined, CheckCircleFilled,CloseCircleFilled, DeleteOutlined , UserOutlined} from "@ant-design/icons"

import PageHeader from '../../../components/PageHeader';

import deleteImg from '../../../assets/images/delete_btn.svg';
import filterImg from "../../../assets/images/filter.svg"
import archiveImg from '../../../assets/images/archive_btn.svg';





import { debounce } from 'lodash'
import { GraphQLResponse } from '../../../interfaces/graphql.interface'
import { downloadCSV } from '../../../utils/common'
import { authVar } from '../../../App/link'
import ArchiveBody from '../../../components/Archive'
import ModalConfirm from '../../../components/Modal'
import constants, {status} from '../../../config/constants'
import routes from '../../../config/routes'
import { ProjectPagingResult, QueryProjectArgs, MutationProjectUpdateArgs, ProjectStatus, Project } from '../../../interfaces/generated'
import { notifyGraphqlError } from '../../../utils/error'
import { PROJECT, PROJECT_UPDATE } from '../../Project'


const DeleteBody = () => {
  return (
    <div >
      <div>
        <img src={deleteImg} alt="confirm" />
      </div>
      <br />
      <p>
        Are you sure you want to delete
        <strong>Insight Workshop Pvt. Ltd?</strong>
      </p>
      <p >
        All the data associated with the project will be deleted permanently.
      </p>
    </div>
  );
};

const csvHeader: Array<{ label: string, key: string, subKey?: string }> = [
  { label: "Project Name", key: "name" },
  { label: "Client", key: "client", subKey: "name" },
  { label: "Client Email", key: "client", subKey: "email" },
  { label: "Status", key: "status" },
  { label: "Company", key: "company", subKey: "name" }
]


const { Option } = Select;

const ProjectReport = () => {
  const loggedInUser = authVar();
  const [visibility, setVisibility] = useState<boolean>(false);
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [project, setProject] = useState<Project>();

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

  const [fetchDownloadData, { data: projectDownloadData }] = useLazyQuery<GraphQLResponse<'Project', ProjectPagingResult>, QueryProjectArgs>(PROJECT, {
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
    onCompleted: () => {
      downloadCSV(projectDownloadData?.Project?.data, csvHeader, 'Projects.csv')
    }
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

  const downloadReport = () => {
    fetchDownloadData({
      variables: {
        input: {
          query: {
            company_id: loggedInUser?.company?.id ?? '',
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
  };

  const refetchProjects = () => {

    let values = filterForm.getFieldsValue(['search', 'role', 'status'])

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
      search?:boolean,
      company_id: string;
    } = {
      company_id: loggedInUser?.company?.id as string
    }


    if (values.status === 'Active' || values.status === 'Inactive') {
      query['status'] = values.status;
    } else {
      query['archived'] = values.status === 'Archived' ? true : false;
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

  const assignedMenu = (record: any) => (
	    <Menu>
	      <p >
	        Employee List ({record.users.length}){" "}
	      </p>
	      {record.users?.map((user: any, index: number) => (
	        <div key={index}>
	          <Menu.Item >{user?.fullName}</Menu.Item>
			 </div>
		  ))}
		  </Menu>
		)

  return (

    <div >
      <Card bordered={false}>
        <PageHeader
          title="Projects" extra={[<Button
            key="btn-filter"

            type="text"
            onClick={openFilterRow}
            icon={<img
              src={filterImg}
              alt="filter"
               />}>
            &nbsp; &nbsp;
            {filterProperty?.filter ? 'Reset' : 'Filter'}
          </Button>]}
        />

        <Form
          form={filterForm}
          layout="vertical"
          onFinish={() => { }}
          autoComplete="off"
          name="filter-form">
          
           
          {filterProperty?.filter &&
            <Row gutter={[32, 0]}>

              <Col sm={12} md={10} lg={5}>
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
            </Row>
            }
        </Form>
        <Row>
          <Col span={24}>
            {
              !!projectData?.Project?.data?.length ? (
                  <Button
                    type="link"
                    onClick={downloadReport}
                    icon={<DownloadOutlined />}
                  >
                    Download Report
                  </Button>
              ):
              <Typography.Text type="secondary" >No files to Download</Typography.Text>
 
            }</Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProjectReport;
