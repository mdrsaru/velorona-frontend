import { useState } from 'react';
import { Button, Modal, Popconfirm, message } from 'antd';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { gql, useMutation, useQuery, useLazyQuery } from '@apollo/client';

import { AUTH } from '../../../gql/auth.gql';
import { stripeSetting } from '../../../config/constants';
import { notifyGraphqlError } from '../../../utils/error';
import { IPlan } from '../../../interfaces/subscription.interface';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import {
  SubscriptionCreateResult,
  MutationSubscriptionCreateArgs,
  SetupIntentResult,
  MutationSubscriptionDowngradeArgs,
} from '../../../interfaces/generated';

import Payment from '../Payment';
import UpdatePaymentDetails from '../UpdatePaymentDetails';

import styles from './style.module.scss';

const stripePromise = loadStripe(stripeSetting.publishableKey);

const statusMap: any = {
  active: 'Active',
  inactive: 'Inactive',
  canceled: 'Canceled',
  trialing: 'Trialing',
  past_due: 'Past due',
  unpaid: 'Unpaid',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete expired',
}

const SUBSCRIPTION_CREATE = gql`
  mutation SubscriptionCreate($input: SubscriptionCreateInput!) {
    SubscriptionCreate(input: $input) {
      clientSecret
      subscriptionId
    }
  }
`;

const SETUP_INTENT_SECRET = gql`
  query SetupInteSecret($input: SetupIntentSecretInput!) {
    SetupIntentSecret(input: $input) {
      clientSecret
    }
  }
`;

const RETRIEVE_SUBSCRIPTION = gql`
  query RetrieveSubscription($input: RetrieveSubscriptionInput!) {
    RetrieveSubscription(input: $input) {
      id 
      current_period_end
    }
  }
`;

const SUBSCRIPTION_DOWNGRADE = gql`
  mutation SubscriptionDowngrade($input: SubscriptionDowngradeInput!) {
    SubscriptionDowngrade(input: $input)
  }
`;

interface IProps {
  plan: IPlan;
}

const Plan = (props: IProps) => {
  const plan = props.plan;
  const [subscriptionData, setSubscriptionData] = useState<null | SubscriptionCreateResult>(null);
  const [showUpdatePaymentModal, setShowUpdatePaymentModal] = useState(false);

  const { data: authData } = useQuery(AUTH)
  const company_id = authData.AuthUser?.company?.id as string;
  const { data: subscriptionRetrieveData } = useQuery(
    RETRIEVE_SUBSCRIPTION,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          company_id: company_id
        }
      }
    },
  );

  const periodEndDate = subscriptionRetrieveData?.RetrieveSubscription?.current_period_end

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
      if (response?.SubscriptionCreate) {
        setSubscriptionData({
          clientSecret: response.SubscriptionCreate.clientSecret,
          subscriptionId: response.SubscriptionCreate.subscriptionId,
        });
      }
    },
    onError: notifyGraphqlError,
  });

  const [
    getSetupIntentSecret,
    {
      data: setupIntentSecretData,
    }
  ] = useLazyQuery<
    GraphQLResponse<'SetupIntentSecret', SetupIntentResult>,
    MutationSubscriptionCreateArgs
  >(SETUP_INTENT_SECRET, {
    onCompleted(response) {
      if (response?.SetupIntentSecret) {
        setShowUpdatePaymentModal(true);
      }
    },
    onError: notifyGraphqlError,
  });

  const [
    downgradeSubscription,
    { data: downgradeSubscriptionData, loading: downgrading },
  ] = useMutation<
    GraphQLResponse<'SubscriptionDowngrade', string>,
    MutationSubscriptionDowngradeArgs
  >(SUBSCRIPTION_DOWNGRADE, {
    variables: {
      input: {
        company_id,
      },
    },
    onCompleted(response) {
      if (response?.SubscriptionDowngrade) {
        message.success(response.SubscriptionDowngrade)
      }
    },
    onError: notifyGraphqlError,
  });

  const createIncompleteSubscription = () => {
    if (plan.name === 'Professional') {
      createSubscription();
    }
  }

  const handlePlanActionClick = () => {
    if (plan.name === 'Starter') {
      if (plan.isCurrent) {
        return;
      }

      downgradeSubscription();
      return;
    }

    if (plan.subscriptionStatus === 'trialing' || plan.subscriptionStatus === 'past_due' || plan.subscriptionStatus === 'active') {
      getSetupIntentSecret({
        variables: {
          input: {
            company_id,
          },
        },
      })
    } else {
      createSubscription();
    }
  }

  const hidePaymentModal = () => {
    setSubscriptionData(null);
  }

  const hidePaymentUpdateModal = () => {
    setShowUpdatePaymentModal(false);
  }

  const getBtnText = () => {
    if (plan.name === 'Starter' && !plan.isCurrent) {
      return 'Downgrade';
    }

    if ([
      'active',
      'trialing',
      'past_due',
      'incomplete',
      'incomplete_expired',
    ].includes(plan.subscriptionStatus as string)) {
      return statusMap[plan.subscriptionStatus as string];
    }

    return 'Upgrade'
  }

  return (
    <div className={styles['container']}>
      <div className={styles['header']}>
        <p className={styles['name']}>{plan.name}</p>
        <p>{plan.description}</p>

        <h1 className={styles['price']}>{plan.price}</h1>

        {plan.name === 'Professional' &&
          <h4>Free Trial for 3 months/No credit card needed</h4>
        }
      </div>
      <div className={styles.buttonDiv}>
        {plan.subscriptionStatus === 'active' || periodEndDate !== null ?
          // {/* Need downgrade functionality */}

          <Button
            type="primary"
            disabled={plan.subscriptionStatus === 'active' || !!periodEndDate}
            loading={creatingSubscription || downgrading}
          >
            {getBtnText()}
          </Button>

          :
          <Popconfirm
            placement="top"
            title="Are you sure?"
            onConfirm={handlePlanActionClick}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              disabled={plan.subscriptionStatus === 'active' || !!periodEndDate}
              loading={creatingSubscription || downgrading}
            >
              {getBtnText()}
            </Button>
          </Popconfirm>
        }
        {plan.name === 'Professional' && plan.subscriptionStatus === 'active' &&
          <Popconfirm
            placement="top"
            title="Are you sure?"
            onConfirm={handlePlanActionClick}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              loading={creatingSubscription || downgrading}
              className={styles.payNowBtn}
            >
              Pay Now
            </Button>
          </Popconfirm>
        }
      </div>
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
        closable={true}
        visible={!!subscriptionData}
        onCancel={hidePaymentModal}
      >
        <Payment
          clientSecret={createSubscriptionData?.SubscriptionCreate?.clientSecret as string}
          subscriptionId={createSubscriptionData?.SubscriptionCreate?.subscriptionId as string}
          hidePaymentModal={hidePaymentModal}
        />
      </Modal>

      <Modal
        footer={null}
        destroyOnClose
        title="Update Payment"
        closable
        onCancel={() => setShowUpdatePaymentModal(false)}
        visible={showUpdatePaymentModal}
      >
        {
          setupIntentSecretData?.SetupIntentSecret?.clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret: setupIntentSecretData?.SetupIntentSecret?.clientSecret
              }}
            >
              <UpdatePaymentDetails
                hidePaymentUpdateModal={hidePaymentUpdateModal}
                clientSecret={setupIntentSecretData?.SetupIntentSecret?.clientSecret}
                companyId={company_id}
              />
            </Elements>
          )
        }
      </Modal>


    </div>
  )
}

export default Plan;
