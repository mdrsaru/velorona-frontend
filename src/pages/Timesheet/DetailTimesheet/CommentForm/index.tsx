import { gql, useMutation } from '@apollo/client';
import { Form, Input, Button, Row, Space } from 'antd';

import { notifyGraphqlError } from '../../../../utils/error';
import { TIMESHEET_COMMENT_FIELDS } from '../../../../gql/timesheet-comment.gql';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import {
  TimesheetComment,
  MutationTimesheetCommentCreateArgs,
  TimesheetCommentPagingResult,
  Timesheet,
  MutationTimesheetSubmitUndoArgs,
  TimesheetSubmitInput,
  TimeEntryUnlockInput,
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
  mutation TimeEntriesUnlockAndUndoSubmint(
    $unlockInput: TimeEntryUnlockInput!, 
    $undoSubmitInput: TimesheetSubmitInput!,
  ) {
    TimeEntriesUnlock(input: $unlockInput) 
    TimesheetSubmitUndo(input: $undoSubmitInput) {
      id
    }
  }
`;

const TIMESHEET_SUBMIT_UNDO = gql`
  mutation TimesheetSubmitUndo($input: TimesheetSubmitInput!) {
    TimesheetSubmitUndo(input: $input) {
      id
    }
  }
`;

type UnlockTimeEntries = {
  TimeEntriesUnlock: boolean;
  TimesheetSubmitUndo: Timesheet;
}

type UnlockTimeEntriesArgs = {
  unlockInput: TimeEntryUnlockInput;
  undoSubmitInput: TimesheetSubmitInput;
}


interface IProps {
  timesheet_id: string;
  company_id: string,
  user_id: string;
  commentType: 'Reject' | 'UnlockApproved' | 'UnlockRejected' | 'UndoSubmit' | undefined;
  onHideModal: () => void;
  refetchTimesheet: any;
}

const CommentForm = (props: IProps) => {

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
    UnlockTimeEntries,
    UnlockTimeEntriesArgs
  >(TIME_ENTRIES_UNLOCK, {
    onError: notifyGraphqlError,
    onCompleted(response) {
      if(response.TimeEntriesUnlock && response.TimesheetSubmitUndo) {
        props.refetchTimesheet();
      }
    }
  })

  const [undoTimesheetSubmit, { loading: loadingUndo }] = useMutation<
    GraphQLResponse<'TimesheetSubmitUndo', Timesheet>,
    MutationTimesheetSubmitUndoArgs
  >(TIMESHEET_SUBMIT_UNDO, {
    onError: notifyGraphqlError,
    onCompleted(response) {
      if(response.TimesheetSubmitUndo) {
        props.refetchTimesheet();
      }
    }
  })

  const onFinish = (values: any) => {
    let statusToUnlock: string | undefined;
    if(props.commentType === 'UnlockApproved') {
      statusToUnlock = 'Approved';
    } else if(props.commentType === 'UnlockRejected') {
      statusToUnlock = 'Rejected';
    }

    if(statusToUnlock) {
      unlockTimeEntries({
        variables: {
          undoSubmitInput: {
            id: props.timesheet_id,
            company_id: props.company_id,
          },
          unlockInput: {
            company_id: props.company_id,
            timesheet_id: props.timesheet_id,
            statusToUnlock,
            user_id: props.user_id
          },
        }
      }).then((response) => {
        if(response.data?.TimeEntriesUnlock) {
          _createComment(values);
        }
      })
    } else if(props.commentType === 'UndoSubmit') {
      undoTimesheetSubmit({
        variables: {
          input: {
            id: props.timesheet_id,
            company_id: props.company_id,
          }
        }
      }).then((response) => {
        if(response.data?.TimesheetSubmitUndo) {
          _createComment(values);
        }
      })
    }

    function _createComment(values: any) {
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
  }

  return (
    <div>
      <Form 
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Comment" name="comment" 
		rules={[{
			required: true,
			message: 'Please enter comment'
		}]}>
          <Input.TextArea rows={4} />
        </Form.Item>

        <Row justify="end">
          <Space>
            <Button onClick={props.onHideModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={creatingComment || unlockingTimeEntries || loadingUndo}>Submit</Button>
          </Space>
        </Row>
      </Form>
    </div>
  )
}

export default CommentForm;
