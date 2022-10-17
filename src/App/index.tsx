import moment from 'moment';
import { useEffect, useState } from 'react';
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';

import * as link from './link';
import { authVar } from './link';
import TokenService from '../services/TokenService';
import {
  fieldPolicy,
  typeDefs,
} from '../gql/schema.gql';
import { notifySubscriptionExpiration } from '../utils/common';
import { RoleName } from '../interfaces/generated';

import Routes from './Routes';
import AppLoader from "../components/Skeleton/AppLoader";
import './App.scss'

const client = new ApolloClient({
  link: ApolloLink.from([
    //link.errorLink,
    link.refreshLink,
    link.authLink,
    link.httpLink,
  ]),
  typeDefs,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          ClientById: {
            read(_, { args, toReference }) {
              return toReference({
                __typename: 'Client',
                id: args?.id,
              });
            },
          },
          ...fieldPolicy,
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'none',
    },
    //query: {
    //errorPolicy: 'ignore',
    //},
    //mutate: { errorPolicy: 'ignore' },
  },
});

function App() {
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    TokenService.renewAccessToken()
      .then((response) => response.json())
      .then((response) => {
        if (response?.data) {
          const roles = response?.data?.roles?.map((role: any) => role.name);
          const subscriptionPeriodEnd = response?.data?.company?.subscriptionPeriodEnd ?? null;
          const trialEndDate = response?.data?.company?.trialEndDate ?? null;
          const subscriptionStatus = response?.data?.company?.subscriptionStatus ?? null;

          authVar({
            isLoggedIn: true,
            token: response?.data?.accessToken,
            user: {
              id: response?.data?._id ?? null,
              entryType: response?.data?.entryType,
              roles,
            },
            company: {
              id: response?.data?.company?.id ?? null,
              code: response?.data?.company?.companyCode ?? null,
              name: response?.data?.company?.name ?? null,
              plan: response?.data?.company?.plan ?? null,
              subscriptionStatus: response?.data?.company?.subscriptionStatus ?? null,
              subscriptionPeriodEnd,
              logo:{
                id: response?.data?.company?.logo?.id ?? null,
                name: response?.data?.company?.logo?.name ?? null,
                url: response?.data?.company?.logo?.url ?? null,
                
              }
            },
            fullName:response?.data?.fullName,
            avatar:{
              id: response?.data?.avatar?.id ?? null,
              url: response?.data?.avatar?.url ?? null,
            },
          })

          if(roles.includes(RoleName.CompanyAdmin) && (subscriptionPeriodEnd || trialEndDate)) {
            notifySubscriptionExpiration({
              periodEnd: subscriptionPeriodEnd,
              status: subscriptionStatus,
              trialEndDate,
            })
          }
        }
      })
      .finally(() => {
        setAppLoading(false);
      });
  }, []);

  return (
    <>
      {appLoading ?
        <AppLoader/> : (
        <ApolloProvider client={client}>
          <Routes />
        </ApolloProvider>
      )}
    </>
  );
}

export default App;

