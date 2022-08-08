import { gql, useQuery } from '@apollo/client';
import { Card, Tabs } from 'antd';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import { plansVar, currentPlanVar } from '../../App/link';
import { subscription, stripeSetting } from '../../config/constants';
import { AUTH } from '../../gql/auth.gql';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { Company, QueryCompanyByIdArgs } from '../../interfaces/generated';
import { IPlan } from '../../interfaces/subscription.interface';

import PageHeader from '../../components/PageHeader'
import CurrentPlan from './CurrentPlan';
import InvoiceAndPayment from './InvoiceAndPayment';
import AvailablePlans from './AvailablePlans';

import styles from './style.module.scss';

const stripePromise = loadStripe(stripeSetting.publishableKey);

const COMPANY = gql`
  query CompanyById($input: CompanyByIdInput!) {
    CompanyById(input: $input) {
      id
      plan
      subscriptionStatus
    }
  }
`;

type TabTextProps = {
  name: string
}

const TabText = (props: TabTextProps) => {
  return <span className={styles['tab-name']}>{props.name}</span>
}

const Subscription = () => {
  const { data: authData } = useQuery(AUTH)
  const company_id = authData.AuthUser?.company?.id as string;

  const { loading: companyLoading } = useQuery<
    GraphQLResponse<'CompanyById', Company>,
    QueryCompanyByIdArgs
  >(COMPANY, {
    variables: {
      input: {
        id: company_id,
      },
    },
    onCompleted(response) {
      const company = response.CompanyById;
      const plan = company?.plan as 'Starter' | 'Professional';

      const currentPlan: IPlan = {
        name: company?.plan as string,
        description: company?.plan ? subscription.description[plan] : '',
        price: subscription.price[plan] as string,
        features: subscription.features[plan] as string[] ?? [],
        subscriptionStatus: company?.subscriptionStatus as string,
      }
      const plans = getPlans(currentPlan);
      plansVar(plans);
      currentPlanVar(currentPlan);
    }
  });

  if(companyLoading) {
    return null;
  }

  return (
    <Elements stripe={stripePromise}>
      <div className={styles['container']}>
        <Card bordered={false}>

          <PageHeader title="My Subscription" />

          <Tabs defaultActiveKey="currentPlan">
            <Tabs.TabPane 
              key="currentPlan"
              tab={<TabText name="Current Plan" />} 
            >
              <CurrentPlan />
            </Tabs.TabPane>

            <Tabs.TabPane 
              key="availablePlans"
              tab={<TabText name="Available Plans" />} 
            >
              <AvailablePlans />
            </Tabs.TabPane>

            <Tabs.TabPane 
              key="invoiceAndPayment"
              tab={<TabText name="Invoice and Payments" />} 
            >
              <InvoiceAndPayment />
            </Tabs.TabPane>

          </Tabs>

        </Card>
      </div>
    </Elements>
  )
}

function getPlans(currentPlan: IPlan) {
  const plans = [
    {
      name: 'Starter',
      description: subscription.description.Starter,
      price: subscription.price.Starter,
      subscriptionStatus: 'inactive',
      features: subscription.features.Starter,
    },
    {
      name: 'Professional',
      description: subscription.description.Professional,
      price: subscription.price.Professional,
      subscriptionStatus: currentPlan.name === 'Professional' ? 'active' : 'inactive',
      features: subscription.features.Professional,
    },
  ];

  return plans;
}



export default Subscription;
