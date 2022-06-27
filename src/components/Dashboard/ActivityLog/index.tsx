import React from "react";
import { Typography } from "antd";
import parse from "html-react-parser";

import { gql, useQuery } from "@apollo/client";
import { authVar } from "../../../App/link";

import ApproveIcon from '../../../assets/images/approve.svg'
import TimeEntryIcon from '../../../assets/images/timeEntry.svg'

import styles from "./style.module.scss";
import { TimesheetStatus } from "../../../interfaces/generated";
import moment from "moment";


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

interface IProps{
  user_id?:string,
  mananger_id?:string
  title:string;
}
const ActivityLog = (props:IProps) => {
  const authData = authVar()
  let query:any= {
    company_id :authData?.company?.id
  }
  if(props?.user_id){
    query.user_id = props?.user_id;
  }
  const {
    data: activityLogData } = useQuery(ACTIVITY_LOG, {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      variables: {
        input: {
          query: query,
          paging: {
            order: ["updatedAt:DESC"],
          }
        }
      }
    });

  const logs = activityLogData?.ActivityLog?.data;

  return (
    <div className={styles['chart']}>
      <Typography.Title level={3}>{props?.title}</Typography.Title>
      <br />
      {logs && logs.map((log: { createdAt: string, message: string, type: string, user: any }, index: number) => {

        return (
          <>
            <p className={styles['date']}>{moment(log?.createdAt).format('MMM D,HH:MM')}</p>
            <div key={index} className={styles['activities']}>

              <span>{log?.type === 'TimeEntry' ?
                <img src={TimeEntryIcon} />
                :
                log?.type === TimesheetStatus.Approved || TimesheetStatus.PartiallyApproved ?
                  <img src={ApproveIcon} />
                  :

                  ""
              }
              </span>
              <span>
                {log?.user?.id === authData?.user?.id ? 'You ' : log?.user?.fullName}{log?.message ? parse(log?.message) : ""}
              </span>

            </div>
          </>
        )
      })}
    </div>
  )
};
export default ActivityLog;