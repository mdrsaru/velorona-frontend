import { useState } from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import { Button, Modal } from 'antd';

import { AUTH } from '../../../gql/auth.gql';
import { notifyGraphqlError } from '../../../utils/error';
import { IPlan } from '../../../interfaces/subscription.interface';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { SubscriptionCreateResult, MutationSubscriptionCreateArgs } from '../../../interfaces/generated';

import Payment from '../Payment';

import styles from './style.module.scss';

const SUBSCRIPTION_CREATE = gql`
  mutation SubscriptionCreate($input: SubscriptionCreateInput!) {
    SubscriptionCreate(input: $input) {
      clientSecret
      subscriptionId
    }
  }
`;

interface IProps {
  plan: IPlan;
}

const Plan = (props: IProps) => {
  const plan = props.plan;
  const [subscriptionData, setSubscriptionData] = useState<null | SubscriptionCreateResult>(null);

  const { data: authData } = useQuery(AUTH)
  const company_id = authData.AuthUser?.company?.id as string;

  const [
    createSubscription, 
    { data: createSubscriptionData, loading: creatingSubscription },
  ] = useMutation<
    GraphQLResponse<'SubscriptionCreate', SubscriptionCreateResult>,
    MutationSubscriptionCreateArgs
  >(SUBSCRIPTION_CREATE, {
    variables: {
      input: {
        company_id,
      },
    },
    onCompleted(response) {
      if(response.SubscriptionCreate) {
        setSubscriptionData({
          clientSecret: response.SubscriptionCreate.clientSecret,
          subscriptionId: response.SubscriptionCreate.subscriptionId,
        });
      }
    },
    onError: notifyGraphqlError,
  });

  const createIncompleteSubscription = () => {
    if(plan.name === 'Professional') {
      createSubscription();
    }
  }

  const hidePaymentModal = () => {
    setSubscriptionData(null);
  }

  const getBtnText = () => {
    if(plan.subscriptionStatus === 'inactive' && plan.name === 'Starter') {
      return 'Inactive';
    }

    if(plan.subscriptionStatus === 'active') {
      return 'Active';
    }

    return 'Upgrade'
  } 

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <p className={styles['name']}>{plan.name}</p>
        <p>{plan.description}</p>

        <h1 className={styles['price']}>{plan.price}</h1>
      </div>

      {/* Need downgrade functionality */}
      <Button
        type={plan.name === 'Starter' && plan.subscriptionStatus === 'inactive' ? undefined : 'primary'}
        disabled={plan.subscriptionStatus === 'active'}
        loading={creatingSubscription}
        onClick={createIncompleteSubscription}
      >
        { getBtnText() }
      </Button>

      <ul>
        {
          plan.features.map(feature => (
            <li key={feature}>{feature}</li>
          ))
        }
      </ul>

      <Modal
        footer={null}
        destroyOnClose
        title="Payment"
        closable={false}
        visible={!!subscriptionData}
      >
        <Payment 
          clientSecret={createSubscriptionData?.SubscriptionCreate?.clientSecret as string}
          subscriptionId={createSubscriptionData?.SubscriptionCreate?.subscriptionId as string}
          hidePaymentModal={hidePaymentModal}
        />
      </Modal>

    </div>
  )
}

function isPlanActive(plan: IPlan): boolean {
  return plan.subscriptionStatus === 'active';
}


export default Plan;
