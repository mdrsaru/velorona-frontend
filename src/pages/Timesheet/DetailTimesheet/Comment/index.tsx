import { gql, useQuery } from '@apollo/client';
import { Skeleton } from 'antd';

import { TIMESHEET_COMMENT_FIELDS } from '../../../../gql/timesheet-comment.gql';
import { GraphQLResponse } from '../../../../interfaces/graphql.interface';
import { 
  TimesheetCommentPagingResult,
  QueryTimesheetCommentArgs,
} from '../../../../interfaces/generated';

import CommentBox from './CommentBox';

import styles from './style.module.scss';

const COMMENT = gql`
  ${TIMESHEET_COMMENT_FIELDS}

  query TimesheetComment($input: TimesheetCommentQueryInput!) {
    TimesheetComment(input: $input) {
      paging {
        total
      }
      data {
        ...timesheetCommentFields
      }
    }
  }
`;

interface IProps {
  company_id: string;
  timesheet_id: string;
}

const Comment = (props: IProps) => {

  const { data: commentData, loading: commentLoading } = useQuery<
    GraphQLResponse<'TimesheetComment', TimesheetCommentPagingResult>,
    QueryTimesheetCommentArgs
  >(COMMENT, {
    variables: {
      input: {
        query: {
          timesheet_id: props.timesheet_id,
          company_id: props.company_id,
          parent: true,
        }
      }
    }
  })

  if(commentLoading) {
    <Skeleton />
  }

  if(!commentData?.TimesheetComment?.paging?.total) {
    return null;
  }

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <span>Comments</span>
        <span>{commentData?.TimesheetComment?.paging.total} Comments</span>
      </div>

      {
        commentData?.TimesheetComment?.data?.map((comment) => (
          <CommentBox 
            key={comment.id}
            company_id={props.company_id}
            comment={comment}
          />
        ))
      }

    </div>
  )
}

export default Comment;
