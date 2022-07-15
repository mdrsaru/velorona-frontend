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

