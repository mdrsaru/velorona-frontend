import { gql } from '@apollo/client';

export const SIDEBAR = gql`
  query Sidebar {
    Sidebar {
      collapsed
    }
  }
`;

