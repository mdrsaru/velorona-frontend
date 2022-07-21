import { gql } from '@apollo/client';

export const TIMESHEET_COMMENT_FIELDS = gql`
  fragment timesheetCommentFields on TimesheetComment {
    id
    comment
    timesheet_id
    reply_id
    replyCount
    createdAt
    user {
      id
      fullName
      avatar {
        url
      }
    }
}
`;
export const REPLY_TIMESHEET_COMMENT_FIELDS = gql`
  fragment replyTimesheetCommentFields on TimesheetComment {
    id
    comment
    reply_id
    createdAt
    user {
      id
      fullName
      avatar {
        url
      }
    }
  }
`;
