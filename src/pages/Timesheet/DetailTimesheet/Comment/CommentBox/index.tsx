import { useState } from 'react';
import { Input, Row, Button } from 'antd';
import { gql, useLazyQuery, useMutation } from '@apollo/client';

import { notifyGraphqlError } from '../../../../../utils/error';
import { REPLY_TIMESHEET_COMMENT_FIELDS } from '../../../../../gql/timesheet-comment.gql';
import { GraphQLResponse } from '../../../../../interfaces/graphql.interface';
import {
  TimesheetComment,
  TimesheetCommentPagingResult,
  QueryTimesheetCommentArgs, 
  MutationTimesheetCommentCreateArgs,
} from '../../../../../interfaces/generated';

import CommentBody from '../../../../../components/CommentBody';
import Loader from '../../../../../components/Loader';

import playImg from '../../../../../assets/images/play.svg';

import styles from './style.module.scss';

const COMMENT = gql`
  ${REPLY_TIMESHEET_COMMENT_FIELDS}

  query TimesheetComment($input: TimesheetCommentQueryInput!) {
    TimesheetComment(input: $input) {
      paging {
        total
      }
      data {
        ...replyTimesheetCommentFields
      }
    }
  }
`;

const COMMENT_CREATE = gql`
  ${REPLY_TIMESHEET_COMMENT_FIELDS}

  mutation TimesheetCommentCreate($input: TimesheetCommentCreateInput!) {
    TimesheetCommentCreate(input: $input) {
      ...replyTimesheetCommentFields
    }
  }
`;

interface IProps {
  company_id: string;
  comment: TimesheetComment;
}

const Comment = (props: IProps) => {
  const comment = props.comment;
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [reply, setReply] = useState('');

  const [createComment, { loading: creatingComment }] = useMutation<
    GraphQLResponse<'TimesheetCommentCreate', TimesheetComment>,
    MutationTimesheetCommentCreateArgs
  >(COMMENT_CREATE, {
    onCompleted() {
      setReply('');
    },
    onError: notifyGraphqlError,
    update: (cache, result) => {
      const newComment = result.data?.TimesheetCommentCreate;
      const input = {
        query: {
          timesheet_id: comment.timesheet_id,
          company_id: props.company_id,
          reply_id: comment.id,
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

  const [loadReplies, { data: repliesData, loading: loadingReplies }] = useLazyQuery<
      GraphQLResponse<'TimesheetComment', TimesheetCommentPagingResult>,
      QueryTimesheetCommentArgs
  >(COMMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          timesheet_id: comment.timesheet_id,
          company_id: props.company_id,
          reply_id: comment.id,
        }
      }
    },
    onCompleted() {
      setIsReplyOpen(true);
    },
  });

  const openReply = () => {
    loadReplies()
  }

  const createReply = () => {
    createComment({
      variables: {
        input: {
          comment: reply,
          company_id: props.company_id,
          reply_id: comment.id,
          timesheet_id: comment.timesheet_id,
        }
      }
    })
  }

  return (
    <div className={styles['container']}>
      <CommentBody
        name={comment.user.fullName as string}
        date={comment.createdAt}
        comment={comment.comment}
        avatar={comment.user?.avatar?.url}
      />

      {
        isReplyOpen && (
          <div>
            {
              loadingReplies 
              ? <Loader />
              : repliesData?.TimesheetComment?.data?.map((reply) => (
                <div className={styles['reply-box']}>
                  <CommentBody
                    name={reply.user.fullName as string}
                    date={reply.createdAt}
                    comment={reply.comment}
                    avatar={reply.user.avatar?.url}
                  />
                </div>
              ))
            }
            <Input.TextArea 
              placeholder="Add comment"
              bordered={false}
              rows={4}
              autoSize={{ minRows: 4, maxRows: 8 }}
              value={reply}
              onChange={(e: any) => setReply(e.target.value)}
            />

            <Row justify="end" style={{ padding: '8px 0', borderTop: '1px solid var(--gray-secondary)' }}>
              <Button 
                loading={creatingComment}
                type="primary" 
                onClick={createReply}
              >
                <img src={playImg} alt="play" />
              </Button>
            </Row>
          </div>
        )
      }

      {
        !isReplyOpen && (
          <Row justify="end">
            <div className={styles['footer']}>
              <span 
                className={styles['replies']}
                onClick={openReply}
              >
                {
                  comment.replyCount ? (
                    <span>{comment.replyCount} Replies</span>
                  ) : (
                    <span>Reply</span>
                  )
                }
              </span>
            </div>
          </Row>
        )
      }
    </div>
  )
}

export default Comment;
