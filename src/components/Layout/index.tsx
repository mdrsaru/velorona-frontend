import { useQuery } from '@apollo/client';
import { Outlet, Navigate } from 'react-router-dom';
import { Layout } from 'antd';

import { SIDEBAR } from '../../gql/app.gql';
import routes from '../../config/routes';

import Sidebar from '../Sidebar';
import Header from '../Header';
import { sidebarVar, authVar } from "../../App/link";
import styles from './style.module.scss';
import Footer from '../Footer';

const { Content } = Layout;


const _Layout = () => {
  const { data: sidebarData } = useQuery(SIDEBAR);
  const authData = authVar();

  const isLoggedIn = authData?.isLoggedIn;

  if (!isLoggedIn) {
    return <Navigate to={routes.login.path} />;
  }

  const onCollapse = () => {
    const collapsed = sidebarData?.Sidebar?.collapsed;
    sidebarVar({
      ...sidebarData.Sidebar,
      collapsed: !collapsed,
    });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header onCollapse={onCollapse} />
      <Layout
        className={
          sidebarData?.Sidebar?.collapsed
            ? styles['site-content-collapsed']
            : styles['site-content']
        }>
        <Sidebar
          collapsed={sidebarData?.Sidebar?.collapsed}
          onCollapse={onCollapse} />
        <Layout className={styles['site-layout']}>
          <Content style={{ padding: '1em' }}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      <Footer/>
    </Layout>
  );
};

export default _Layout;

