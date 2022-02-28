import { gql } from '@apollo/client';
import { authVar, sidebarVar } from '../App/link';

export const typeDefs = gql`
  type AuthUser {
    token: String
    isLoggedIn: Boolean
    user: User
  }

  type User {
    id: String
  }

  type Sidebar {
    collapesed: Boolean
  }

  extend type Query {
    AuthUser: AuthUser
    Sidebar: Sidebar
  }
`

export const fieldPolicy = {
  AuthUser: {
    read() {
      return authVar();
    },
  },
  Sidebar: {
    read() {
      return sidebarVar();
    },
  },
};

