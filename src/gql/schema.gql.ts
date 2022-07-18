import { gql } from '@apollo/client';
import { authVar, sidebarVar, plansVar, currentPlanVar } from '../App/link';

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

  type Plan {
    name: String
    description: String
    price: String
    features: [String]
    subscriptionStatus: String
  }

  extend type Query {
    AuthUser: AuthUser
    Sidebar: Sidebar
    Plans: [Plan]
    CurrentPlan: Plan
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
  Plans: {
    read() {
      return plansVar();
    },
  },
  CurrentPlan: {
    read() {
      return currentPlanVar();
    },
  },
};

