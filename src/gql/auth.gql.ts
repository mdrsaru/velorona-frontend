import { gql } from '@apollo/client';

export const AUTH = gql`
  query GetUserAuth {
    AuthUser @client {
      token
      isLoggedIn
      user {
        id
        roles
        type
      }
      company {
        code
        id
      }
      avatar {
        id
        url
      }
      fullName
    }
  }
`;

