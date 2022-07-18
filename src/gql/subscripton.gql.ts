import { gql } from '@apollo/client';

export const PLANS = gql`
  query GetPlans {
    Plans @client {
      name
      description
      price
      features
      subscriptionStatus
    }
  }
`;


export const CURRENT_PLAN = gql`
  query CurrentPlan {
    CurrentPlan @client {
      name
      description
      price
      features
      subscriptionStatus
    }
  }
`;

