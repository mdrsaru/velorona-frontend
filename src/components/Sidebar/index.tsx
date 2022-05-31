import {
  Link,
  // useLocation
} from 'react-router-dom';
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
import { authVar } from '../../App/link';

import styles from './style.module.scss';
import {useState} from "react";

const { Sider } = Layout;

// const menuKeys = [
//   routes.dashboard.path,
//   routes.home.path,
//   routes.timesheet.path,
//   routes.tasks.path,
//   routes.schedule.path,
// ];


const Sidebar = (props: any) => {
  const { collapsed, onCollapse } = props
  const [selectedMenuKey, setMenuKey] = useState('')
  // const location = useLocation();
  const loggedInUser = authVar();
  const menuItems = [
    {
      key: routes.dashboard.key,
      name: routes.dashboard.name,
      icon: <DashboardOutlined />,
      route: routes.dashboard.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      key: routes.companyDashboard.key,
      name: routes.companyDashboard.name,
      icon: <DashboardOutlined />,
      route: routes.company.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.role.name,
      name: routes.role.name,
      icon: <UserSwitchOutlined />,
      route: routes.role.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      key: routes.companyAdmin.key,
      name: routes.companyAdmin.name,
      icon: <BankOutlined />,
      route: routes.companyAdmin.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      key: routes.employee.key,
      name: routes.employee.name,
      icon: <UsergroupAddOutlined />,
      route: routes.employee.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.client.key,
      name: routes.client.name,
      icon: <SolutionOutlined />,
      route: routes.client.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.home.key,
      name: routes.home.name,
      icon: <HomeOutlined />,
      route: routes.home.path,
      accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      key: routes.timesheet.key,
      name: routes.timesheet.name,
      icon: <FieldTimeOutlined />,
      route: routes.timesheet.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee]
    },
    {
      key: routes.tasks.key,
      name: routes.tasks.name,
      icon: <OrderedListOutlined />,
      route: routes.tasks.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee]
    },
    {
      key: routes.projects.key,
      name: routes.projects.name,
      icon: <FundProjectionScreenOutlined />,
      route: routes.projects.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.invoice.key,
      name: routes.invoice.name,
      icon: <ProfileOutlined />,
      route: routes.invoice.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.employeeTimesheet.key,
      name: routes.employeeTimesheet.name,
      icon: <FieldTimeOutlined />,
      route: routes.employeeTimesheet.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin, constants.roles.TaskManager]
    },
    {
      key: routes.schedule.key,
      name: routes.schedule.name,
      icon: <ScheduleOutlined />,
      route: routes.schedule.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee]
    }
  ]
  const menuArray = menuItems.filter(menu => {return loggedInUser?.user?.roles?.some(role => menu.accessRoles.includes(role))})
  // const selectedMenuKey = menuKeys.find(key => key.split('/')?.[1] === location.pathname?.split('/')?.[1]) ?? '';

  return (
    <Sider
      className={styles['site-sidebar']}
      width={263}
      collapsible
      collapsedWidth={80}
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      breakpoint="lg">
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        selectedKeys={[selectedMenuKey]}>
        {menuArray && menuArray.map((menu) => (
          <Menu.Item key={menu?.key} icon={menu?.icon} onClick={(e: any) =>{setMenuKey(e.key)}}>
            <Link to={menu.route}>{menu.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;

