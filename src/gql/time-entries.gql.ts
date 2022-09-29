import { gql } from '@apollo/client';

export const TIME_ENTRY_FIELDS = gql`
  fragment timeEntryFields on TimeEntry {
    id
    startTime
    endTime
    createdAt
    duration
    clientLocation
    description
    breakDuration
    breakTime{
      id 
      startTime 
      endTime 
      duration 
    }
    company {
      id
      name
    }
    project_id
    project {
      id
      name
      client {
        id
        name
      }
    }
  }
`;
