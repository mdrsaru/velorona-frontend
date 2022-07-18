import { useQuery } from '@apollo/client';

import { PLANS } from '../../../gql/subscripton.gql'
import { IPlan } from '../../../interfaces/subscription.interface';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';

import Plan from '../Plan';

import styles from './style.module.scss';

const AvailablePlans = () => {
  const { data: planData } = useQuery<
    GraphQLResponse<'Plans', IPlan[]>
  >(PLANS);

  return (
    <>
      {/* <p className={styles['remaining-time']}>21 days remaining</p> */}

      <div className={styles['plans']}>
        {
          planData?.Plans?.map((plan, index) => (
            <Plan key={`${plan}-${index}`} plan={plan} />
          ))
        }
      </div>
    </>
  )
}

export default AvailablePlans;
