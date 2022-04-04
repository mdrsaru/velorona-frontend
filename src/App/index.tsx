import { useEffect, useState } from 'react';
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';
import { Skeleton } from 'antd';

import * as link from './link';
import { authVar } from './link';
import TokenService from '../services/TokenService';
import {
  fieldPolicy,
  typeDefs,
} from '../gql/schema.gql';

import './App.scss'

import Routes from './Routes';

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
          ...fieldPolicy,
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'ignore',
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
        authVar({
          isLoggedIn: true,
          token: response?.data?.accessToken,
          user: {
            id: response?.data?.id ?? null,
            roles: response?.data?.roles?.map((role: any) => role.name),
          },
          company: {
            id: response?.data?.company?.id ?? null,
            code: response?.data?.company?.companyCode ?? null,
          }
        });
      })
      .finally(() => {
        setAppLoading(false);
      });
  }, []);

  return (
    <>
      {appLoading ? (
        <Skeleton />
      ) : (
        <ApolloProvider client={client}>
          <Routes />
        </ApolloProvider>
      )}
    </>
  );
}

export default App;

