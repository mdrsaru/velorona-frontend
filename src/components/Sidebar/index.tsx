import { useQuery } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';

import routes from '../../config/routes';
import { SIDEBAR } from '../../gql/app.gql';
import { sidebarVar } from '../../App/link';

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

  const onCollapse = () => {
    const collapsed = sidebarData?.Sidebar?.collapsed;
    sidebarVar({
      ...sidebarData.Sidebar,
      collapsed: !collapsed,
    });
  };

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
        <Menu.Item key={routes.home.path}>
          <Link to={routes.home.path}>{routes.home.name}</Link>
        </Menu.Item>

        <Menu.Item key={routes.dashboard.path}>
          <Link to={routes.dashboard.path}>{routes.dashboard.name}</Link>
        </Menu.Item>

        <Menu.Item key={routes.timesheet.path}>
          <Link to={routes.timesheet.path}>{routes.timesheet.name}</Link>
        </Menu.Item>

        <Menu.Item key={routes.tasks.path}>
          <Link to={routes.tasks.path}>{routes.tasks.name}</Link>
        </Menu.Item>

        <Menu.Item key={routes.schedule.path}>
          <Link to={routes.schedule.path}>{routes.schedule.name}</Link>
        </Menu.Item>

      </Menu>
    </Sider>
  );
};

export default Sidebar;

