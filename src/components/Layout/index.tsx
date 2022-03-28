import { useQuery } from '@apollo/client';
import { Outlet, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import { AUTH } from '../../gql/auth.gql';
import { SIDEBAR } from '../../gql/app.gql';
import routes from '../../config/routes';

import Sidebar from '../Sidebar';
import Header from '../Header';

import styles from './style.module.scss';

const { Content } = Layout;


const _Layout = () => {
  const { data: authData } = useQuery(AUTH);
  const { data: sidebarData } = useQuery(SIDEBAR);

  const isLoggedIn = authData?.AuthUser?.isLoggedIn;

  if (!isLoggedIn) {
    return <Navigate to={routes.login.path} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout
        className={
          sidebarData?.Sidebar?.collapsed
            ? styles['site-content-collapsed']
            : styles['site-content']
        }>
        <Sidebar />
        <Layout className={styles['site-layout']}>
          <Content style={{ padding: '1em' }}>
           <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default _Layout;

