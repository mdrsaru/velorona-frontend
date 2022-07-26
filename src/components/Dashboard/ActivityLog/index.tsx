import  { Fragment, useState } from "react";
import {  Empty, Spin, Typography } from "antd";

import { gql, NetworkStatus, useQuery } from "@apollo/client";
import { authVar } from "../../../App/link";

import styles from "./style.module.scss";
import { ReloadOutlined } from '@ant-design/icons';
import constants from "../../../config/constants";
import ActivityLogList from "./ActivityLogList";


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
    loading: activityLogLoading,
    data: activityLogData, refetch: reloadActivityData, networkStatus } = useQuery(ACTIVITY_LOG, {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      notifyOnNetworkStatusChange: true,
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
          style={{ fontSize: '25px', color: 'var(--primary-blue)' }}
          onClick={() => reloadData()}
        />
      </div>

      <br />
      {( networkStatus !== NetworkStatus.refetch) &&
        <Spin spinning={activityLogLoading}>
          {logs?.length ?
            (<>
              {logs.map((log: { createdAt: string, message: string, type: string, user: any }, index: number) => {

                return (
                  <Fragment key={index}>
                    <ActivityLogList log={log}/>
                  </Fragment>
                )
              })}
              <div style={{ textAlign: 'center' }}>
                {(activityLogData?.ActivityLog?.paging?.total >= activityLogData?.ActivityLog?.paging?.endIndex && activityLogData?.ActivityLog?.paging?.startIndex !== 0) && (
                  <Typography.Text
                    style={{ color: 'var(--primary-blue)', marginRight:'10px' ,cursor: 'pointer'}}
                    onClick={() => changePage(pagingInput.currentPage - 1)}>
                    {'<< Load Less '}
                  </Typography.Text>)
                }
                {activityLogData?.ActivityLog?.paging?.hasNextPage && (
                  <Typography.Text
                    style={{ color: 'var(--primary-blue)', cursor: 'pointer' }}
                    onClick={() => changePage(pagingInput.currentPage + 1)}>
                    {'Load More >>'}
                  </Typography.Text>)
                }
              </div>
            </>)
            :
            <Empty description='No history at the moment' />
          }
        </Spin>
      }
    </div>
  )
};
export default ActivityLog;