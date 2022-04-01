import { useQuery } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';

import constants from '../../config/constants';
import routes from '../../config/routes';
import { SIDEBAR } from '../../gql/app.gql';
import { authVar, sidebarVar } from '../../App/link';

import styles from './style.module.scss';

const { Sider } = Layout;

const menuKeys = [
  routes.dashboard.path,
  routes.home.path,
  routes.timesheet.path,
  routes.tasks.path,
  routes.schedule.path,
];


const Sidebar = () => {
  const location = useLocation();
  const { data: sidebarData } = useQuery(SIDEBAR);
  const loggedInUser = authVar();
  const menuItems = [
    {
      name: routes.dashboard.name,
      route: routes.dashboard.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.companyDashboard.name,
      route: routes.company.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.role.name,
      route: routes.role.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.companyAdmin.name,
      route: routes.companyAdmin.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.employee.name,
      route: routes.employee.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.home.name,
      route: routes.home.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.timesheet.name,
      route: routes.timesheet.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.tasks.name,
      route: routes.tasks.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.schedule.name,
      route: routes.schedule.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    }
  ]
  const menuArray = menuItems.filter(menu => {return loggedInUser?.user?.roles?.some(role => menu.accessRoles.includes(role))})

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
      trigger={null}>
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        selectedKeys={[selectedMenuKey]}>
        {menuArray && menuArray.map((menu, index) => (
          <Menu.Item key={index}>
            <Link to={menu.route}>{menu.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;

