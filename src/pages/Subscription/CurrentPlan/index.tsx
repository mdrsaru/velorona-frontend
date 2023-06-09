import { useMemo } from 'react';
import {  useQuery } from '@apollo/client';

import { PLANS } from '../../../gql/subscripton.gql'
import { IPlan } from '../../../interfaces/subscription.interface';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';

import Plan from '../Plan';

const CurrentPlan = () => {
  const { data: planData } = useQuery<
    GraphQLResponse<'Plans', IPlan[]>
  >(PLANS);

  const currentPlan: IPlan | undefined = useMemo(() => {
    const plans = planData?.Plans ?? [];
    return plans.find((plan) => {
      return plan.isCurrent;
    });
  }, [planData?.Plans])

  if(!currentPlan) {
    return null;
  }

  return (
    <Plan
      plan={currentPlan}
    />
  )
}

export default CurrentPlan;
