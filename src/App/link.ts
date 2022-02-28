import { createHttpLink, makeVar } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode from 'jwt-decode';

import config from '../config/constants';
import TokenService from '../services/TokenService';

import { IAuth } from '../interfaces/IAuth';
import { ISidebar } from '../interfaces/IApp';

const auth: IAuth = {
  token: null,
  user: {
    role: null,
    id: null,
  },
  isLoggedIn: false,
};

const sidebar = {
  collapsed: false,
};

export const authVar = makeVar<IAuth>(auth);
export const sidebarVar = makeVar<ISidebar>(sidebar);

// Http Link
export const httpLink = createHttpLink({
  uri: config.graphqlEndpoint,
  credentials: 'include',
});

// Auth Link
export const authLink = setContext((_, { headers }) => {
  const userAuth = authVar();

  return {
    headers: {
      ...headers,
      authorization: userAuth?.token ? `Bearer ${userAuth.token}` : '',
    },
  };
});

// Refresh token link
export const refreshLink = new TokenRefreshLink({
  accessTokenField: 'accessToken',
  isTokenValidOrUndefined: () => {
    const userAuth = authVar();
    const token = userAuth?.token;

    if (!token) {
      return true;
    }

    try {
      const decoded: any = jwtDecode(token);
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        return false;
      }
    } catch (err) {
      return true;
    }
    return true;
  },
  fetchAccessToken: () => {
    return TokenService.renewAccessToken();
  },
  handleFetch: (accessToken) => {
    const userAuth = authVar();
    authVar({
      ...userAuth,
      token: accessToken,
    });
  },
  handleError: (err) => {
    // full control over handling token fetch Error
    console.warn('Your refresh token is invalid. Try to relogin');
    console.error(err);
  },
});

export const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

