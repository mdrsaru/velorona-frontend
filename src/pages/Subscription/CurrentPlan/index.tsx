import { gql, useQuery } from '@apollo/client';

import { CURRENT_PLAN } from '../../../gql/subscripton.gql'
import { AUTH } from '../../../gql/auth.gql';
import { IPlan } from '../../../interfaces/subscription.interface';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';

import Plan from '../Plan';

const CurrentPlan = () => {
  const { data: currentPlanData } = useQuery<
    GraphQLResponse<'CurrentPlan', IPlan>
  >(CURRENT_PLAN);

  if(!currentPlanData?.CurrentPlan) {
    return null;
  }

  return (
    <Plan
      plan={currentPlanData?.CurrentPlan}
    />
  )
}

export default CurrentPlan;
