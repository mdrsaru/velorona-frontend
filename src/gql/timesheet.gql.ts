import { gql } from '@apollo/client';

export const ATTACHED_TIMESHEET_FIELDS = gql`
  fragment attachedTimesheetFields on AttachedTimesheet {
    id 
    description
    createdAt
    company{
      id
      name
    }
    attachments {
      id
      url
      name
    }
    timesheet {
      id 
      duration 
    }
    amount
    type
    date 

  }

`
