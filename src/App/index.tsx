import { useEffect, useState } from 'react';
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client';

import * as link from './link';
import { authVar } from './link';
import TokenService from '../services/TokenService';
import {
  fieldPolicy,
  typeDefs,
} from '../gql/schema.gql';

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
        if (response?.data) {
          authVar({
            isLoggedIn: true,
            token: response?.data?.accessToken,
            user: {
              id: response?.data?._id ?? null,
              roles: response?.data?.roles?.map((role: any) => role.name),
            },
            company: {
              id: response?.data?.company?.id ?? null,
              code: response?.data?.company?.companyCode ?? null,
            }
          })}
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

