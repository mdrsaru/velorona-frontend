import moment from 'moment';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Select, Form, Button, Row } from 'antd';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { ProjectPagingResult, QueryProjectArgs, MutationTimeEntryCreateArgs, TimeEntry, ProjectStatus, QueryUserClientArgs, UserClientPagingResult, UserClientStatus } from '../../../interfaces/generated';
import { authVar } from "../../../App/link"

import styles from './style.module.scss';
import { notifyGraphqlError } from '../../../utils/error';
import { USER_PROJECT } from '../../../pages/Timesheet/DetailTimesheet';
import { USERCLIENT } from '../../../pages/Employee/DetailEmployee';

const PROJECT = gql`
  query Projects($input: ProjectQueryInput!) {
    Project(input: $input) {
      data {
        id
        name
      }
    }
  }
`;

export const CREATE_TIME_ENTRY = gql`
  mutation TimeEntryCreate($input: TimeEntryCreateInput!) {
    TimeEntryCreate(input: $input) {
      id
      startTime
      endTime
      duration
    }
  }
 `

interface IProps {
  startTimer: (id: string, date: string) => void;
  hideCheckInModal: () => void;
}

const CheckInForm = (props: IProps) => {
  const loggedInUser = authVar()
  const company_id = loggedInUser?.company?.id as string;

  const { data: projectData, loading: projectLoading } = useQuery<
    GraphQLResponse<'Project', ProjectPagingResult>,
    QueryProjectArgs
  >(PROJECT, {
    variables: {
      input: {
        query: {
          company_id,
          user_id:loggedInUser.user.id,
          status:ProjectStatus.Active
        },
        paging: {
          order: ['createdAt:DESC'],
        },
      },
    },
  });

  const { data: userClientData } = useQuery<
  GraphQLResponse<'UserClient', UserClientPagingResult>,
  QueryUserClientArgs
>(USERCLIENT, {
  fetchPolicy: "network-only",
  variables: {
    input: {
      query: {
        user_id: loggedInUser?.user?.id,
        status:UserClientStatus.Active
      },
      paging: {
        order: ['updatedAt:DESC']
      }
    },
  },
});


const client_id = userClientData?.UserClient?.data?.[0]?.client_id ?? ''
  const { data: userProjectData } = useQuery(USER_PROJECT, {
    skip: !client_id,
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          client_id:client_id,
          user_id : loggedInUser?.user?.id,
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })


  const [createTimeEntry, { loading: createTimeEntryLoading }] = useMutation<
    GraphQLResponse<'TimeEntryCreate', TimeEntry>,
    MutationTimeEntryCreateArgs 
  >(CREATE_TIME_ENTRY, {
      onCompleted: (response) => {
        const id = response.TimeEntryCreate.id;
        let startTime = response.TimeEntryCreate.startTime;
        startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss')
        props.startTimer(id, startTime);
        props.hideCheckInModal();
      },
	  onError:notifyGraphqlError,
    });

  const checkIn = (values: any) => {
    createTimeEntry({
      variables: {
        input: {
          company_id,
          startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
          project_id: values.project,
          created_by:loggedInUser.user.id as string,
          entry_type:loggedInUser.user.entryType as string
        }
      }
    })
  }

  // const projects = projectData?.Project?.data ?? [];

  return (
    <Form 
      layout="vertical"
      onFinish={checkIn}
    >
      <p className={styles['date']}>{moment().format('ddd, MMMM DD, YYYY ')}</p>

      <Form.Item
        label="Choose Project"
        name="project"
        rules={[{
          required: true,
          message: 'Choose the project'
        }]}
      >
        <Select
          loading={projectLoading}
          placeholder="Select Project"
        >
          {
            userProjectData?.UserProjectDetail?.map((project:any) => (
              <Select.Option key={project.projectId} value={project.projectId}>{project.projectName}</Select.Option>
            ))
          }
        </Select>
      </Form.Item>

      <Row justify="end">
        <Button htmlType="submit" type="primary" loading={createTimeEntryLoading}>Check in</Button>
      </Row>
    </Form>
  )
}

export default CheckInForm;
