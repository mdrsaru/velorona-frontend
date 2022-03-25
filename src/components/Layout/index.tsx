import { useQuery } from '@apollo/client';
import { Outlet, RouteProps, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import { AUTH } from '../../gql/auth.gql';
import { SIDEBAR } from '../../gql/app.gql';
import routes from '../../config/routes';

import Sidebar from '../Sidebar';
import Header from '../Header';

import styles from './style.module.scss';
import NotFound from "../NotFound";

const { Content } = Layout;

interface IProps extends RouteProps {
  allowedRoles?: string[]
}

const _Layout = (props: IProps) => {
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
            {authData?.AuthUser?.user?.roles?.find((role: string) => props.allowedRoles?.includes(role)) ? <Outlet /> : <NotFound/>}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default _Layout;

