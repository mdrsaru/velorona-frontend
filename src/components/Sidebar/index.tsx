import {
  Link,
  useLocation,
  useParams
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
  FundProjectionScreenOutlined,
  ProfileOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import constants from '../../config/constants';
import routes from '../../config/routes';
import { authVar } from '../../App/link';

import styles from './style.module.scss';
import { useEffect, useState } from "react";

import subscriptionImg from '../../assets/images/subscription.png';

const { Sider } = Layout;

const Sidebar = (props: any) => {
  const { collapsed, onCollapse } = props
  const [selectedMenuKey, setMenuKey] = useState('')
  const location = useLocation();
  const params = useParams();
  const loggedInUser = authVar();

  useEffect(() => {
    let path = ''
    if (location?.pathname === '/' + params?.id) {
      path = routes.companyDashboard.key
    } else if (params?.id && location?.pathname !== '/' + params?.id) {
      path = location?.pathname?.split('/').slice(2, 3).toString()
    } else if (!params.id && location?.pathname !== routes.home.path) {
      path = location?.pathname?.split('/').slice(1, 2).toString()
    } else {
      path = routes.home.key
    }
    setMenuKey(path)
  }, [location, params?.id])

  const menuItems = [
    // {
    //   key: routes.dashboard.key,
    //   name: routes.dashboard.name,
    //   icon: <DashboardOutlined />,
    //   route: routes.dashboard.path,
    //   accessRoles: [constants.roles.SuperAdmin]
    // },
    // {
    //   key: routes.companyDashboard.key,
    //   name: routes.companyDashboard.name,
    //   icon: <DashboardOutlined />,
    //   route: routes.companyDashboard.path(loggedInUser?.company?.code ?? ''),
    //   accessRoles: [constants.roles.CompanyAdmin]
    // },
    // {
    //   key: routes.employeeDashboard.key,
    //   name: routes.employeeDashboard.name,
    //   icon: <DashboardOutlined />,
    //   route: routes.employeeDashboard.path(loggedInUser?.company?.code ?? ''),
    //   accessRoles: [constants.roles.Employee]
    // },
    // {
    //   key: routes.taskManagerDashboard.key,
    //   name: routes.taskManagerDashboard.name,
    //   icon: <DashboardOutlined />,
    //   route: routes.taskManagerDashboard.path(loggedInUser?.company?.code ?? ''),
    //   accessRoles: [constants.roles.TaskManager]
    // },
    {
      key: routes.checkDashboard.key,
      name: routes.checkDashboard.name,
      icon: <DashboardOutlined />,
      route: routes.checkDashboard.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.SuperAdmin, constants.roles.CompanyAdmin, constants.roles.Employee, constants.roles.TaskManager]
    },
    {
      key: routes.role.key,
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
      key: routes.invoicePaymentConfig.key,
      name: routes.invoicePaymentConfig.name,
      icon: <SettingOutlined />,
      route: routes.invoicePaymentConfig.path,
      accessRoles: [constants.roles.SuperAdmin]
    },
    {
      key: routes.user.key,
      name: routes.user.name,
      icon: <UsergroupAddOutlined />,
      route: routes.user.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.client.key,
      name: routes.client.name,
      icon: <SolutionOutlined />,
      route: routes.client.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    // {
    //   key: routes.home.key,
    //   name: routes.home.name,
    //   icon: <HomeOutlined />,
    //   route: routes.home.path,
    //   accessRoles: [constants.roles.Employee, constants.roles.TaskManager]
    // },
    {
      key: routes.timesheet.key,
      name: routes.timesheet.name,
      icon: <FieldTimeOutlined />,
      route: routes.timesheet.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee]
    },
    {
      key: routes.employeeSchedule.key,
      name: routes.employeeSchedule.name,
      icon: <ScheduleOutlined />,
      route: routes.employeeSchedule.path(loggedInUser?.company?.code ?? ''),
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
      accessRoles: [constants.roles.CompanyAdmin]
    },
    {
      key: routes.subscription.key,
      name: routes.subscription.name,
      icon: <img src={subscriptionImg} style={{ width: 14 }} />,
      route: routes.subscription.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin]
    },
    // {
    //   key: routes.schedule.key,
    //   name: routes.schedule.name,
    //   icon: <ScheduleOutlined />,
    //   route: routes.schedule.path(loggedInUser?.company?.code ?? ''),
    //   accessRoles: [constants.roles.Employee]
    // }
  ]
  const menuArray = menuItems.filter(menu => { return loggedInUser?.user?.roles?.some(role => menu.accessRoles.includes(role)) })
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
          <Menu.Item key={menu?.key} icon={menu?.icon} onClick={(e: any) => { setMenuKey(e.key) }}>
            <Link to={menu.route}>{menu.name}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;

