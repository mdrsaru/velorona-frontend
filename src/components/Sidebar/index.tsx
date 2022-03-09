import { useQuery } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';

import routes from '../../config/routes';
import { SIDEBAR } from '../../gql/app.gql';
import {authVar, sidebarVar} from '../../App/link';

import styles from './style.module.scss';

const { Sider } = Layout;

const menuKeys = [
  routes.dashboard.path,
  routes.home.path,
  routes.timesheet.path,
  routes.tasks.path,
  routes.schedule.path,
];

const Sidebar = (props: any) => {
  const location = useLocation();
  const { data: sidebarData } = useQuery(SIDEBAR);
  const userLoggedIn = authVar();

  const onCollapse = () => {
    const collapsed = sidebarData?.Sidebar?.collapsed;
    sidebarVar({
      ...sidebarData.Sidebar,
      collapsed: !collapsed,
    });
  };

  const isAdmin = () => {
    return userLoggedIn.user.role === 'admin'
  }

  const selectedMenuKey = menuKeys.find(key => key.split('/')?.[1] === location.pathname?.split('/')?.[1]) ?? '';

  return (
    <Sider
      className={styles['site-sidebar']}
      width={263}
      collapsible
      collapsed={sidebarData?.Sidebar?.collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      collapsedWidth="0"
      trigger={null}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        selectedKeys={[selectedMenuKey]}
      >
        {isAdmin() &&
          <>
            <Menu.Item key={routes.dashboard.routePath}>
              <Link to={routes.dashboard.routePath}>{routes.dashboard.name}</Link>
            </Menu.Item>
            <Menu.Item key={routes.client.routePath}>
              <Link to={routes.client.routePath}>{routes.client.name}</Link>
            </Menu.Item>
          </>}
        {!isAdmin() &&
          <>
            <Menu.Item key={routes.home.routePath}>
              <Link to={routes.home.routePath}>{routes.home.name}</Link>
            </Menu.Item>

            <Menu.Item key={routes.timesheet.routePath}>
              <Link to={routes.timesheet.routePath}>{routes.timesheet.name}</Link>
            </Menu.Item>

            <Menu.Item key={routes.tasks.routePath}>
              <Link to={routes.tasks.routePath}>{routes.tasks.name}</Link>
            </Menu.Item>

            <Menu.Item key={routes.schedule.routePath}>
              <Link to={routes.schedule.routePath}>{routes.schedule.name}</Link>
            </Menu.Item>
          </>}

      </Menu>
    </Sider>
  );
};

export default Sidebar;

