import { useEffect, useState } from "react";
import { useQuery } from '@apollo/client';
import {
  Link,
  useLocation,
  useParams
} from 'react-router-dom';
import { Menu, Layout } from 'antd';
import {
  BankOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  ScheduleOutlined,
  UsergroupAddOutlined,
  SolutionOutlined,
  FundProjectionScreenOutlined,
  ProfileOutlined,
  SettingOutlined,
  PullRequestOutlined,
  FileTextOutlined
} from '@ant-design/icons';

import constants from '../../config/constants';
import routes from '../../config/routes';
import { authVar } from '../../App/link';
import { AUTH } from '../../gql/auth.gql';

import styles from './style.module.scss';

import subscriptionImg from '../../assets/images/subscription.png';
import { UserOutlined } from '@ant-design/icons';
import SubMenu from "antd/lib/menu/SubMenu";

const { Sider } = Layout;

const Sidebar = (props: any) => {
  const { collapsed, onCollapse } = props
  const [selectedMenuKey, setMenuKey] = useState('')
  const location = useLocation();
  const params = useParams();
  const loggedInUser = authVar();
  const userRoles = loggedInUser?.user?.roles ?? [];

  /** 
   * Using useQuery here, as the company id changes with the reactive variables triggered by CompanySet component.
   * Check src/components/CompanySet/index.tsx
   * Reference: https://www.apollographql.com/docs/react/local-state/reactive-variables/
   */
  const { data: authData } = useQuery(AUTH);
  const company_id = authData?.AuthUser?.company?.id;
 const entryType:any = authData?.AuthUser?.user?.entryType;

 const [name,setName] = useState('')
  useEffect(() => {
    let path = ''
    if (location?.pathname === '/' + params?.id) {
      path = routes.company.key
    } else if (params?.id && location?.pathname !== '/' + params?.id) {
      path = location?.pathname?.split('/').slice(2, 3).toString()
    } else if (!params.id && location?.pathname !== routes.home.path) {
      path = location?.pathname?.split('/').slice(1, 2).toString()
    } else {
      path = routes.home.key
    }
    setMenuKey(path)

    if(entryType === 'CICO'){
      setName('Time Tracker')
    }
    else{
      setName('Timesheet')
    }
  }, [location, params?.id, params?.company])

  const menuItems = [
    {
      key: routes.company.key,
      name: routes.company.name,
      icon: <DashboardOutlined />,
      route: routes.company.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [ constants.roles.CompanyAdmin, constants.roles.Employee, constants.roles.TaskManager],
      viewAsAdmin: true,
    },
    {
      key: routes.dashboard.key,
      name: routes.dashboard.name,
      icon: <DashboardOutlined />,
      route: routes.dashboard.path,
      accessRoles: [ constants.roles.SuperAdmin ],
      viewAsAdmin: false,
    },
    {
      key: routes.companyAdmin.key,
      name: routes.companyAdmin.name,
      icon: <BankOutlined />,
      route: routes.companyAdmin.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.superAdmin.key,
      name: routes.superAdmin.name,
      icon: <UserOutlined />,
      route: routes.superAdmin.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.currency.key,
      name: routes.currency.name,
      icon: <UserOutlined />,
      route: routes.currency.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.user.key,
      name: routes.user.name,
      icon: <UsergroupAddOutlined />,
      route: routes.user.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.client.key,
      name: routes.client.name,
      icon: <SolutionOutlined />,
      route: routes.client.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.timesheet.key,
      name:name,
      // name: {` routes.timesheet.name`:'TimeTracker'},
      icon: <FieldTimeOutlined />,
      route: routes.timesheet.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee],
      viewAsAdmin: false,
    },
    {
      key: routes.employeeSchedule.key,
      name: routes.employeeSchedule.name,
      icon: <ScheduleOutlined />,
      route: routes.employeeSchedule.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.Employee],
      viewAsAdmin: false,
    },
    {
      key: routes.projects.key,
      name: routes.projects.name,
      icon: <FundProjectionScreenOutlined />,
      route: routes.projects.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.invoice.key,
      name: 'Invoice',
      icon: <ProfileOutlined />,
      route: routes.invoice.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin, constants.roles.BookKeeper],
      viewAsAdmin: true,
      children: [
        {
          key: routes.invoice.key,
          name: routes.invoice.name,
          icon: <ProfileOutlined />,
          route: routes.invoice.path(loggedInUser?.company?.code ?? ''),
          accessRoles: [constants.roles.CompanyAdmin, constants.roles.BookKeeper],
          viewAsAdmin: true,
        },
        {
          key: routes.employeeTimesheet.key,
          name: routes.employeeTimesheet.name,
          icon: <FieldTimeOutlined />,
          route: routes.employeeTimesheet.path(loggedInUser?.company?.code ?? ''),
          accessRoles: [constants.roles.CompanyAdmin, constants.roles.TaskManager, constants.roles.BookKeeper],
          viewAsAdmin: true,
        },
      ],
    },
    // {
    //   key: routes.employeeTimesheet.key,
    //   name: routes.employeeTimesheet.name,
    //   icon: <FieldTimeOutlined />,
    //   route: routes.employeeTimesheet.path(loggedInUser?.company?.code ?? ''),
    //   accessRoles: [constants.roles.CompanyAdmin, constants.roles.TaskManager, constants.roles.BookKeeper],
    //   viewAsAdmin: true,
    // },
    {
      key: routes.schedule.key,
      name: routes.schedule.name,
      icon: <ScheduleOutlined />,
      route: routes.schedule.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.subscription.key,
      name: routes.subscription.name,
      icon: <img src={subscriptionImg} style={{ width: 14 }} alt="subscription" />,
      route: routes.subscription.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.reports.key,
      name: routes.reports.name,
      icon: <FileTextOutlined />,
      route: routes.reports.path(loggedInUser?.company?.code ?? ''),
      accessRoles: [constants.roles.CompanyAdmin],
      viewAsAdmin: true,
    },
    {
      key: routes.demoRequest.key,
      name: routes.demoRequest.name,
      icon: <PullRequestOutlined />,
      route: routes.demoRequest.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.payments.key,
      name: routes.payments.name,
      icon: <img src={subscriptionImg} style={{ width: 14 }} alt="subscription" />,
      route: routes.payments.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.invoicePaymentConfig.key,
      name: routes.invoicePaymentConfig.name,
      icon: <SettingOutlined />,
      route: routes.invoicePaymentConfig.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
    {
      key: routes.reportsAdmin.key,
      name: routes.reportsAdmin.name,
      icon: <FileTextOutlined />,
      route: routes.reportsAdmin.path,
      accessRoles: [constants.roles.SuperAdmin],
      viewAsAdmin: false,
    },
  ]

  let menuArray = menuItems.filter(menu => {
    return loggedInUser?.user?.roles?.some(role => menu.accessRoles.includes(role));
  });

  if(company_id && userRoles.includes(constants.roles.SuperAdmin)) {
    menuArray = menuItems.filter(menu => menu.viewAsAdmin);
  }

  return (
    <Sider
      className={styles['site-sidebar']}
      width={275}
      collapsible
      collapsedWidth={80}
      collapsed={collapsed}
      onCollapse={onCollapse}
      trigger={null}
      breakpoint="lg"
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        style={{ height: '100%', borderRight: 0 }}
        selectedKeys={[selectedMenuKey]}
      >
        {menuArray && menuArray.map((menu) => (
          <>

            {
              menu?.children?.length ?
                (<SubMenu icon={menu?.icon} title={menu.name}>
                  {menu?.children?.map((submenu) => (
                    <Menu.Item key={submenu?.key} icon={submenu?.icon}>
                      <Link to={submenu.route}>{submenu.name}</Link>
                    </Menu.Item>
                  ))}

                </SubMenu>
                )
                :
                (<Menu.Item key={menu?.key} icon={menu?.icon} onClick={(e: any) => { setMenuKey(e.key) }}>
                  <Link to={menu.route}>{menu.name}</Link>
                </Menu.Item>
                )
            }
          </>
        ))}
      </Menu>
    </Sider>
  );
};

export default Sidebar;

