import { gql, useMutation, useApolloClient } from '@apollo/client';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  MenuOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

//import { SIDEBAR } from '../../gql/app.gql';
import { /*sidebarVar, */authVar } from '../../App/link';
import logo from '../../assets/images/logo.svg';
import logoContent from '../../assets/images/logo-01.svg';
import downArrow from '../../assets/images/down-arrow.svg';
import notification from '../../assets/images/notification.svg';
import routes from '../../config/routes';

import styles from './style.module.scss';

const { Header } = Layout;

const LOGOUT = gql`
  mutation Logout {
    Logout
  }
`;

const TopHeader = (props: any) => {
  const { onCollapse } = props;
  const client = useApolloClient();
  const navigate = useNavigate();
  const loggedInUser = authVar();
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
        },
        fullName:null,
        avatar: {
          id: null,
          url: '',
        }
      });
      client.clearStore();
      navigate(routes.login.path);
    },
  });

  const menu = (
    <Menu style={{ width: 120 }}>
      <Menu.Item key={'1'}>
        <div onClick={() => logout()}>
          Logout
        </div>
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
          <img
            src={logo}
            alt="logo"
            className={styles['mini-logo']} />
          <img
            src={logoContent}
            alt="logo-01"
            className={styles['text-logo']} />
        </div>
      </div>

      <div className={styles['header-right']}>
        {/* <div className={styles['notification']}>
          <img
            src={notification}
            alt="notification" />
        </div> */}
        <div className={styles['avatar']}>
          <Avatar size={38} src = {loggedInUser?.avatar?.url} />
          <Dropdown
            overlay={menu}
            trigger={['click']}>
            <span className={styles['name-container']}>
              <span className={styles['name']}>
                {loggedInUser?.fullName ?? ''}
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

