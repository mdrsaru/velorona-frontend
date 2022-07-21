import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Row, Space } from 'antd';

import { notifyGraphqlError } from '../../../../utils/error';
import { TIMESHEET_COMMENT_FIELDS } from '../../../../gql/timesheet-comment.gql';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import {
  TimesheetComment,
  MutationTimesheetCommentCreateArgs,
  MutationTimeEntriesUnlockArgs,
  TimesheetCommentPagingResult,
} from '../../../../interfaces/generated';

const COMMENT = gql`
  ${TIMESHEET_COMMENT_FIELDS}

  query TimesheetComment($input: TimesheetCommentQueryInput!) {
    TimesheetComment(input: $input) {
      data {
        ...timesheetCommentFields
      }
    }
  }
`;

const COMMENT_CREATE = gql`
  ${TIMESHEET_COMMENT_FIELDS}

  mutation TimesheetCommentCreate($input: TimesheetCommentCreateInput!) {
    TimesheetCommentCreate(input: $input) {
      ...timesheetCommentFields
    }
  }
`;

const TIME_ENTRIES_UNLOCK = gql`
  mutation TimeEntriesUnlock($input: TimeEntryUnlockInput!) {
    TimeEntriesUnlock(input: $input) 
  }
`;

interface IProps {
  timesheet_id: string;
  company_id: string,
  user_id: string;
  commentType: 'Reject' | 'UnlockApproved' | 'UnlockRejected' | undefined;
  onHideModal: () => void;
  refetchTimesheet: any;
}

const CommentForm = (props: IProps) => {

  const statusToUnlock = props.commentType === 'UnlockApproved' ? 'Approved' : 'Rejected';

  const [createComment, { loading: creatingComment }] = useMutation<
    GraphQLResponse<'TimesheetCommentCreate', TimesheetComment>,
    MutationTimesheetCommentCreateArgs
  >(COMMENT_CREATE, {
    onCompleted(response) {
      if(response.TimesheetCommentCreate) {
        props.onHideModal();
      }
    },
    onError: notifyGraphqlError,
    update: (cache, result) => {
      const newComment = result.data?.TimesheetCommentCreate;
      const input = {
        query: {
          timesheet_id: props.timesheet_id,
          company_id: props.company_id,
          parent: true,
        }
      };

      if(newComment) {
        const data = cache.readQuery<
          GraphQLResponse<'TimesheetComment', TimesheetCommentPagingResult>
        >({
          query: COMMENT,
          variables: { input },
        });

        const timesheetComments = data?.TimesheetComment?.data ?? [];

        cache.writeQuery({
          query: COMMENT,
          variables: { input },
          data: {
            TimesheetComment: {
              data: [...timesheetComments, newComment]
            }
          },
        });
      }
    },
    
  })

  const [unlockTimeEntries, { loading: unlockingTimeEntries }] = useMutation<
    GraphQLResponse<'TimeEntriesUnlock', boolean>,
    MutationTimeEntriesUnlockArgs
  >(TIME_ENTRIES_UNLOCK, {
    onError: notifyGraphqlError,
    onCompleted(response) {
      if(response.TimeEntriesUnlock) {
        props.refetchTimesheet();
      }
    }
  })

  const onFinish = (values: any) => {
    unlockTimeEntries({
      variables: {
        input: {
          company_id: props.company_id,
          timesheet_id: props.timesheet_id,
          statusToUnlock,
          user_id: props.user_id
        }
      }
    })

    createComment({
      variables: {
        input: {
          comment: values.comment,
          company_id: props.company_id,
          timesheet_id: props.timesheet_id,
        }
      }
    })
  }

  return (
    <div>
      <Form 
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Comment" name="comment">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Row justify="end">
          <Space>
            <Button onClick={props.onHideModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creatingComment || unlockingTimeEntries}>Submit</Button>
          </Space>
        </Row>
      </Form>
    </div>
  )
}

export default CommentForm;
