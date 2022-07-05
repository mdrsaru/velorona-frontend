import { gql } from '@apollo/client';
import { authVar, sidebarVar } from '../App/link';

export const typeDefs = gql`
  type AuthUser {
    token: String
    isLoggedIn: Boolean
    user: User
    company: Company
    avatar: Avatar
    fullName: String
  }

  type User {
    id: String
    roles: [String]
    type: String
  }

  type Avatar {
    id: String
    url: String
  }

  type Company {
    code: String
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

