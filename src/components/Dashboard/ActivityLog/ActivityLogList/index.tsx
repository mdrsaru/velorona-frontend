import moment from 'moment';
import parse from "html-react-parser";

import ApproveIcon from '../../../../assets/images/approve.svg'
import TimeEntryIcon from '../../../../assets/images/timeEntry.svg'

import { TimesheetStatus } from '../../../../interfaces/generated';
import styles from '../style.module.scss'
import { authVar } from '../../../../App/link';
interface IProps{
  log:any
}
const ActivityLogList =(props:IProps) =>{
  const log = props.log;
  const authData = authVar()
  return(
    <>
        <p className={styles['date']}>{moment(log?.createdAt).format('MMM D,HH:mm')}</p>
                    <div  className={styles['activities']}>

                      <span>{log?.type === 'TimeEntry' ?
                        <img src={TimeEntryIcon} alt={'time entry'} />
                        :
                        log?.type === TimesheetStatus.Approved || TimesheetStatus.PartiallyApproved ?
                          <img src={ApproveIcon} alt='approve' />
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
}

export default ActivityLogList