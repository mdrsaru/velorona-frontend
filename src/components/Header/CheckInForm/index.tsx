import moment from 'moment';
import { gql, useQuery, useMutation } from '@apollo/client';
import { Select, Form, Button, Row } from 'antd';

import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { ProjectPagingResult, QueryProjectArgs, MutationTimeEntryCreateArgs, TimeEntry, ProjectStatus } from '../../../interfaces/generated';
import { authVar } from "../../../App/link"

import styles from './style.module.scss';
import { notifyGraphqlError } from '../../../utils/error';

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
        }
      }
    })
  }

  const projects = projectData?.Project?.data ?? [];

  return (
    <Form 
      layout="vertical"
      onFinish={checkIn}
    >
      <p className={styles['date']}>{moment().format('ddd, MMMM M, YYYY ')}</p>

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
            projects.map((project) => (
              <Select.Option key={project.id} value={project.id}>{project.name}</Select.Option>
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
