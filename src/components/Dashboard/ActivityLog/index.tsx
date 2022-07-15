import React, {useState} from "react";
import {Button, Empty, Typography} from "antd";
import parse from "html-react-parser";

import { gql, useQuery } from "@apollo/client";
import { authVar } from "../../../App/link";

import ApproveIcon from '../../../assets/images/approve.svg'
import TimeEntryIcon from '../../../assets/images/timeEntry.svg'

import styles from "./style.module.scss";
import { TimesheetStatus } from "../../../interfaces/generated";
import moment from "moment";
import NoContent from '../../NoContent/index';
import { ReloadOutlined } from '@ant-design/icons';
import constants from "../../../config/constants";


export const ACTIVITY_LOG = gql`
query ActivityLog($input: ActivityLogQueryInput!) {
  ActivityLog(input: $input) {
    paging {
      total
      startIndex
      endIndex
      hasNextPage
    }
     data {
          id
          message
          type
          createdAt
          user{
          id
          fullName
          }
    }
  }
}`;

interface IProps {
  user_id?: string,
  mananger_id?: string
  title: string;
}
const ActivityLog = (props: IProps) => {
  const authData = authVar();
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });
  let query: any = {
    company_id: authData?.company?.id
  }
  if (props?.user_id) {
    query.user_id = props?.user_id;
  }

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    })
  };

  const reloadData = () => {
    reloadActivityData();
  }

  const {
    data: activityLogData, refetch: reloadActivityData } = useQuery(ACTIVITY_LOG, {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          query: query,
          paging: {
            take: constants.paging.perPage,
            skip: pagingInput.skip,
            order: ["updatedAt:DESC"],
          }
        }
      }
    });

  const logs = activityLogData?.ActivityLog?.data;

  return (
    <div className={styles['chart']}>
      <div className={styles['title-div']}>
        <Typography.Title level={3}>{props?.title}</Typography.Title>
        <ReloadOutlined
          style={{fontSize: '25px', color: 'var(--primary-blue)'}}
          onClick={() => reloadData()}
        />
      </div>

      <br />
      {logs?.length ?
        (<>
          {logs.map((log: { createdAt: string, message: string, type: string, user: any }, index: number) => {

            return (
              <>
                <p className={styles['date']}>{moment(log?.createdAt).format('MMM D,HH:MM')}</p>
                <div key={index} className={styles['activities']}>

                <span>{log?.type === 'TimeEntry' ?
                  <img src={TimeEntryIcon} alt={'time entry'}/>
                  :
                  log?.type === TimesheetStatus.Approved || TimesheetStatus.PartiallyApproved ?
                    <img src={ApproveIcon} alt='approve'/>
                    :

                    ""
                }
                </span>
                  <span>
                  {log?.user?.id === authData?.user?.id ?
                    'You ' :
                    log?.user?.fullName}{log?.message ?
                    parse(log?.message) :
                    ""
                  }
                </span>

                </div>
              </>
            )
          })}
          <div style={{textAlign: 'center'}}>
            {activityLogData?.ActivityLog?.paging?.hasNextPage && (
              <Typography.Text
                style={{color: 'var(--primary-blue)'}}
                onClick={() =>changePage(pagingInput.currentPage + 1)}>
                {'Load More >>'}
              </Typography.Text>)
            }
          </div>
        </>)
        :
        <Empty description='No history at the moment'/>
          }
        </div>
  )
};
      export default ActivityLog;