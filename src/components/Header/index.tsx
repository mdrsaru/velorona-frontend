import { useMemo } from 'react';
import { gql, useMutation, useApolloClient, useQuery } from '@apollo/client';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { MenuOutlined, } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

//import { SIDEBAR } from '../../gql/app.gql';
// import notification from '../../assets/images/notification.svg';
import { /*sidebarVar, */authVar } from '../../App/link';
//import logo from '../../assets/images/logo.svg';
import pp from '../../assets/images/default_pp.png';
import logoContent from '../../assets/images/logo-content.svg';
import downArrow from '../../assets/images/down-arrow.svg';
import routes from '../../config/routes';
import { AUTH } from '../../gql/auth.gql';
import { checkRoles } from '../../utils/common';
import { RoleName } from '../../interfaces/generated';

import CheckInCheckOut from './CheckInCheckOut';

import styles from './style.module.scss';

const { Header } = Layout;

export const LOGOUT = gql`
  mutation Logout {
    Logout
  }
`;

const TopHeader = (props: any) => {
  const { onCollapse } = props;
  const client = useApolloClient();
  const navigate = useNavigate();
  const { data: authData } = useQuery(AUTH)
  const loggedInUser = authData?.AuthUser;

  /* Uncomment it to make sidebar toggle
  const { data: sidebarData } = useQuery(SIDEBAR);
  const onClick = () => {
    const collapsed = sidebarData?.Sidebar?.collapsed;
    sidebarVar({
      ...sidebarData.Sidebar,
      collapsed: !collapsed,
    });
  };
   */

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
          plan: '',
          subscriptionStatus:'',
          subscriptionPeriodEnd: null,
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

  const profile = () => {
    navigate(routes.profile.path(loggedInUser?.user?.id as string))
  }

  const setting = () => {
    navigate(routes.companySetting.path(loggedInUser?.company?.code,loggedInUser?.company?.id as string))
  }

  const isSuperAdmin = useMemo(() => {
    return checkRoles({
      userRoles: loggedInUser?.user?.roles ?? [],
      expectedRoles: [RoleName.SuperAdmin],
    })
  }, [loggedInUser?.user?.roles])

  const isCompanyAdmin = useMemo(() => {
    return checkRoles({
      userRoles: loggedInUser?.user?.roles ?? [],
      expectedRoles: [RoleName.CompanyAdmin],
    })
  }, [loggedInUser?.user?.roles])

  const menu = (
    <Menu style={{ width: 120 }}>
      <Menu.Item key={"1"}>
        <div onClick={() => profile()}>Profile</div>
      </Menu.Item>

      {isCompanyAdmin &&
        <Menu.Item key={"2"}>
          <div onClick={() => setting()}>Setting</div>
        </Menu.Item>
      }
      <Menu.Item key={"3"}>
        <div onClick={() => logout()}>Logout</div>
      </Menu.Item>
    </Menu>
  );

  return (
    <Header className={styles['header-container']}>
      <div className={styles['logo']} >
        <MenuOutlined
          onClick={onCollapse}
          style={{
            fontSize: 20,
            color: 'var(--black)',
            marginLeft: 10
          }} />
        <div>
          {isSuperAdmin ?
            <img
              src={logoContent}
              alt="logo"
            />
            :
            <>
              {authData?.AuthUser?.company?.logo?.url ?
                <img
                  src={authData?.AuthUser?.company?.logo?.url}
                  alt="logo"
                  className={styles['text-logo']}
                />
                :
                <p className={styles['company-name']}>{authData?.AuthUser?.company?.name}</p>
              }
            </>
          }
        </div>
      </div>

      <div className={styles['header-right']}>
        {/* { loggedInUser?.user?.entryType === 'CICO' && <CheckInCheckOut /> } */}

        {/* <div className={styles['notification']}>
          <img
            src={notification}
            alt="notification" />
        </div> */}
        <div className={styles['avatar']}>
          <Avatar size={38} src={loggedInUser?.avatar?.url ?? pp} />
          <Dropdown
            overlay={menu}
            trigger={['click']}>
            <span className={styles['name-container']}>
              <span className={styles['name']}>
                {loggedInUser?.fullName}
              </span>
              <span className={styles['drop-arrow']}>
                <img
                  src={downArrow}
                  alt="down-arrow" />
              </span>
            </span>
          </Dropdown>
        </div>
      </div>
    </Header>
  );
};

export default TopHeader;

