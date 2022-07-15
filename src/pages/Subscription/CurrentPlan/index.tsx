import { gql, useQuery } from '@apollo/client';

import { AUTH } from '../../../gql/auth.gql';
import { IPlan } from '../../../interfaces/subscription.interface';

import Plan from '../Plan';

interface IProps {
  plan: IPlan;
}

const CurrentPlan = (props: IProps) => {
  return (
    <Plan
      plan={props.plan}
    />
  )
}

export default CurrentPlan;
