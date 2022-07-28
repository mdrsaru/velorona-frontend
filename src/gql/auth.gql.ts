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
        name
        logo{
        id 
        name 
        url 
        }
      }
      avatar {
        id
        url
      }
      fullName
    }
  }
`;

