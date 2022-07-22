import moment from 'moment';
import { useState } from 'react';
import { gql, useMutation, useApolloClient, useQuery } from '@apollo/client';
import { Layout, Menu, Avatar, Dropdown, Button, Modal } from 'antd';
import { MenuOutlined, } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useStopwatch } from 'react-timer-hook';

//import { SIDEBAR } from '../../gql/app.gql';
// import notification from '../../assets/images/notification.svg';
import { /*sidebarVar, */authVar } from '../../App/link';
//import logo from '../../assets/images/logo.svg';
import pp from '../../assets/images/default_pp.png';
//import logoContent from '../../assets/images/logo-01.svg';
import logoContent from '../../assets/images/logo-content.svg';
import downArrow from '../../assets/images/down-arrow.svg';
import routes from '../../config/routes';
import { notifyGraphqlError } from '../../utils/error';
import { AUTH } from '../../gql/auth.gql';
import { TIME_ENTRY_FIELDS } from '../../gql/time-entries.gql';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { QueryTimeEntryArgs, TimeEntry, MutationTimeEntryUpdateArgs, TimeEntryPagingResult, EntryType } from '../../interfaces/generated';

import CheckIn from './CheckIn';
import Digit from '../../components/Digit';

import styles from './style.module.scss';

const { Header } = Layout;

const LOGOUT = gql`
  mutation Logout {
    Logout
  }
`;

export const TIME_ENTRY = gql`
    ${TIME_ENTRY_FIELDS}
    query TimeEntry($input: TimeEntryQueryInput!) {
      TimeEntry(input: $input) {
        data {
          ...timeEntryFields
        }
        activeEntry {
          ...timeEntryFields
        }
      }
    }
`;

export const UPDATE_TIME_ENTRY = gql`
  ${TIME_ENTRY_FIELDS}
  mutation TimeEntryUpdate($input: TimeEntryUpdateInput!) {
    TimeEntryUpdate(input: $input) {
      ...timeEntryFields
    }
  }
`;

const TopHeader = (props: any) => {
  const { onCollapse } = props;
  const client = useApolloClient();
  const [isCheckInVisible, setIsCheckInVisible] = useState(false)
  const [activeEntry_id, setActiveEntry_id] = useState<string | null>(null)
  const navigate = useNavigate();
  const { data: authData } = useQuery(AUTH)
  const loggedInUser = authData?.AuthUser;
  const company_id = loggedInUser?.company?.id as string;
  const afterStart = moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');

  const {
    seconds,
    minutes,
    hours,
    isRunning,
    reset,
  } = useStopwatch({ autoStart: false });

  const { loading: timeEntryLoading } = useQuery<
    GraphQLResponse<'TimeEntry', TimeEntryPagingResult>,
    QueryTimeEntryArgs
  >(TIME_ENTRY, {
      variables: {
        input: {
          paging: {
            take: 1,
          },
          query: {
            entryType: EntryType.Cico,
            company_id,
          },
        }
      },
      onCompleted(response) {
        if(response.TimeEntry.activeEntry) {
          let startTime = response.TimeEntry.activeEntry?.startTime;
          if(startTime) {
            startTime = moment(startTime).utc().format('YYYY-MM-DDTHH:mm:ss');
            startTimer(response.TimeEntry.activeEntry.id, startTime);
          }
        }
      }
    })

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

  const [updateTimeEntry, { loading: updateLoading }] = useMutation<
    GraphQLResponse<'TimeEntryUpdate', TimeEntry>,
    MutationTimeEntryUpdateArgs
  >(UPDATE_TIME_ENTRY, {
    update: (cache, result: any) => {
      const data: any = cache.readQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: company_id,
              afterStart,
              entryType: loggedInUser?.user?.type,
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
      });

      const entries = data?.TimeEntry?.data ?? [];

      cache.writeQuery({
        query: TIME_ENTRY,
        variables: {
          input: {
            query: {
              company_id: authData?.company?.id,
              afterStart,
              entryType: authData?.user?.type,
            },
            paging: {
              order: ['startTime:DESC']
            }
          }
        },
        data: {
          TimeEntry: {
            activeEntry: null,
            data: [result, ...entries]
          }
        }
      });
    },
    onCompleted(response) {
      if(response.TimeEntryUpdate) {
        reset(undefined, false);
      }
    },
    onError: notifyGraphqlError,
  });

  const profile = () => {
    navigate(routes.profile.path(loggedInUser?.user?.id as string))
  }

  const showCheckInModal = () => {
    setIsCheckInVisible(true);
  }

  const hideCheckInModal = () => {
    setIsCheckInVisible(false);
  }

  const checkOut = () => {
    if(activeEntry_id) {
      updateTimeEntry({
        variables: {
          input: {
            id: activeEntry_id,
            company_id,
            endTime: moment().format('YYYY-MM-DD HH:mm:ss')
          }
        }
      })
    }
  }

  const startTimer = (id: string, date: string) => {
    const offset = new Date();
    const now = moment();
    const diff = now.diff(moment(date),  'seconds');
    const time = offset.setSeconds(offset.getSeconds() + diff)
    reset(new Date(time))
    setActiveEntry_id(id);
  }

  const menu = (
    <Menu style={{ width: 120 }}>
     <Menu.Item key={"1"}>
       <div onClick={() => profile()}>Profile</div>
     </Menu.Item>
     <Menu.Item key={"2"}>
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
          {
            /* 
            <img
              src={logo}
              alt="logo"
              className={styles['mini-logo']} 
            />
            */
          }
          <img
            src={logoContent}
            alt="logo-01"
            className={styles['text-logo']} />
        </div>
      </div>

      <div className={styles['header-right']}>
        {
          loggedInUser?.user?.type === 'CICO' && (
            <div className={styles['cico']}>
              {
                isRunning ? (
                  <div className={styles['check-out']}>
                    <div className={styles['timer']}>
                      <Digit value={hours} />:<Digit value={minutes} />:<Digit value={seconds} />
                    </div>
                    <Button onClick={checkOut} loading={updateLoading}>
                      Check-out
                    </Button>
                  </div>
                ) : (
                  <Button type="primary" onClick={showCheckInModal} disabled={timeEntryLoading}>
                    Check-in
                  </Button>
                )
              }
            </div>
          )
        }
        {/* <div className={styles['notification']}>
          <img
            src={notification}
            alt="notification" />
        </div> */}
        <div className={styles['avatar']}>
          <Avatar size={38} src = {loggedInUser?.avatar?.url ?? pp } />
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

      <Modal
        centered
        footer={null}
        destroyOnClose
        visible={isCheckInVisible}
        onCancel={hideCheckInModal}
        title={<h2 className="modal-title">Check in</h2>}
      >
        <CheckIn 
          startTimer={startTimer} 
          hideCheckInModal={hideCheckInModal}
        />
      </Modal>
    </Header>
  );
};

export default TopHeader;

