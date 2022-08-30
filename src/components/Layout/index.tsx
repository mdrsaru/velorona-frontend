import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from 'antd';
import ms from 'ms';
import { SIDEBAR } from '../../gql/app.gql';
import routes from '../../config/routes';

import Sidebar from '../Sidebar';
import Header, { LOGOUT } from '../Header';
import { sidebarVar, authVar } from "../../App/link";
import styles from './style.module.scss';
import Footer from '../Footer';
import { useIdleTimer } from 'react-idle-timer';
import config from '../../config/constants';

const { Content } = Layout;


const _Layout = () => {
  const { data: sidebarData } = useQuery(SIDEBAR);
  const authData = authVar();
  const timeout = ms(config.accessTokenLife);

  const client = useApolloClient();

  const navigate = useNavigate()
  const [logout] = useMutation(LOGOUT, {
    onCompleted(data) {
      authVar({
        isLoggedIn: false,
        token: null,
        user: {
          roles: [],
          id: null,
        },
        company: {
          id: null,
          code: '',
          name: '',
          logo: {
            id: null,
            name: null,
            url: null,
          }
        },
        fullName: null,
        avatar: {
          id: null,
          url: '',
        }
      });
      client.clearStore();
      navigate(routes.login.path);
    },
  });

  const handleOnIdle = () => {
    // Logout if the user is idle for given timeout duration
    logout()
  }
  useIdleTimer({
    timeout,
    onIdle: handleOnIdle,
    crossTab:true,
  })

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

