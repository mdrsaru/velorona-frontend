import { useQuery } from '@apollo/client';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Layout } from 'antd';
import {
  BankOutlined,
  DashboardOutlined,
  HomeOutlined,
  FieldTimeOutlined,
  UserSwitchOutlined,
  ScheduleOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
  OrderedListOutlined,
  FundProjectionScreenOutlined,
  ProfileOutlined
} from '@ant-design/icons';

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
      icon: <DashboardOutlined />,
      route: routes.dashboard.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.companyDashboard.name,
      icon: <DashboardOutlined />,
      route: routes.company.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.role.name,
      icon: <UserSwitchOutlined />,
      route: routes.role.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.companyAdmin.name,
      icon: <BankOutlined />,
      route: routes.companyAdmin.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      name: routes.employee.name,
      icon: <UsergroupAddOutlined />,
      route: routes.employee.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.client.name,
      icon: <SolutionOutlined />,
      route: routes.client.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.home.name,
      icon: <HomeOutlined />,
      route: routes.home.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.timesheet.name,
      icon: <FieldTimeOutlined />,
      route: routes.timesheet.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.tasks.name,
      icon: <OrderedListOutlined />,
      route: routes.tasks.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      name: routes.projects.name,
      icon: <FundProjectionScreenOutlined />,
      route: routes.projects.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.invoice.name,
      icon: <ProfileOutlined />,
      route: routes.invoice.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      name: routes.schedule.name,
      icon: <ScheduleOutlined />,
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
      collapsedWidth={50}
      collapsed={sidebarData?.Sidebar?.collapsed}
      onCollapse={onCollapse}
      breakpoint="lg">
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        selectedKeys={[selectedMenuKey]}>
        {menuArray && menuArray.map((menu, index) => (
          <Menu.Item key={index} icon={menu?.icon}>
            <Link to={menu.route}>{menu.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;

