import moment from 'moment';
import { useMutation, useQuery, gql } from '@apollo/client';
import { Form, Button, Input, message } from 'antd';

import { AUTH } from '../../../../../gql/auth.gql';
import { getDurationFromTimeFormat } from '../../../../../utils/common';
import { TimeEntry, MutationTimeEntryCreateArgs } from '../../../../../interfaces/generated';
import { GraphQLResponse } from '../../../../../interfaces/graphql.interface';

const TIME_ENTRY_CREATE = gql`
  mutation TimeEntryCreate($input: TimeEntryCreateInput!) {
    TimeEntryCreate(input: $input) {
      id
    }
  }
`;

interface IProps {
  date: string;
  refetch: any;
  project_id: string;
  timesheet_id: string;
  onHideModal: () => void;
}

const NewTimeEntry = (props: IProps) => {
  const { data: authData } = useQuery(AUTH)
  const company_id = authData.AuthUser?.company?.id as string;

  const [createTimeEntry, { loading }] = useMutation<
    GraphQLResponse<'TimeEntryCreate', TimeEntry>,
    MutationTimeEntryCreateArgs
  >(TIME_ENTRY_CREATE, {
    onCompleted(response) {
      if(response.TimeEntryCreate) {
        props.onHideModal();
        props.refetch();
        message.success('Time entry created')
      }
    }
  })

  const onFinish = (values: any) => {
    const format = moment(values.timeFormat, 'HH:mm:ss').format('HH:mm:ss');
    const duration = getDurationFromTimeFormat(format);

    const startTime = `${props.date}T09:00:00`;
    const endTime = moment(startTime).add(duration, 'seconds')

    createTimeEntry({
      variables: {
        input: {
          company_id,
          project_id: props.project_id,
          description: values.description,
          startTime,
          endTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
        },
      },
    })
  }

  return (
    <div>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--gray-secondary)' }}>
        {moment(props?.date).format('ddd, MMM D, YYYY')}
      </p>

      <Form
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item 
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Descripton is required' }]}
        >
          <Input placeholder="Description" />
        </Form.Item>

        <Form.Item 
          name="timeFormat"
          label="Duration"
          rules={[{ required: true, message: 'Duration is required' }]}
        >
          <Input placeholder="HH:mm:ss" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={loading}>
          Submit
        </Button>
      </Form>

    </div>
  )

}

export default NewTimeEntry;
