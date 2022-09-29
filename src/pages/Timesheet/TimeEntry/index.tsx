import { useQuery } from '@apollo/client';
import {
  Col,
  Popover,
  Row,
  Tooltip
} from 'antd';
import moment from 'moment';

import { getTimeFormat } from '..';
import { AUTH } from '../../../gql/auth.gql';

import { TimeEntry as ITimeEntry, EntryType } from '../../../interfaces/generated';

import styles from '../style.module.scss';

interface IProps {
  length?: number;
  timeEntry: ITimeEntry;
  clickPlayButton: ()  => void;
  rowClassName: string;
  totalDuration?: number; 
  totalBreakDuration?: number; 
  minStartTime?: string; 
  maxEndTime?: string;
}

interface ILengthProps {
  length: number;
}

const Length = (props: ILengthProps) => (
  <div className={styles['entry-length']}>
    {
      props.length > 1 &&
      <p>
        {props.length}
      </p>
    }
  </div>
)


const TimeEntry = (props: IProps) => {
  const {  timeEntry, rowClassName, minStartTime, maxEndTime } = props
  const { data: authData } = useQuery(AUTH)
  const entryType = authData?.AuthUser?.user?.entryType;

  const breakTimeList = timeEntry.breakTime?.map((breakTime,index)=>(
    <div>
      <p>{moment(breakTime?.startTime).utc().format('HH:MM:ss')} - {moment(breakTime?.endTime).utc().format('HH:MM:ss')}</p>
    </div>
  ))
  return (
    <Row className={styles[rowClassName]}>
      {
        entryType !== EntryType.Cico && (
          <Col
            xs={24}
            sm={24}
            md={6}
            lg={6}
            xl={6}
            className={styles['task-name']}
          >
            { props.length && <Length length={props.length} /> }
            <div className={styles['data-box']} onClick={event => { event.stopPropagation() }}>
              <Tooltip title={timeEntry?.description ?? ''}>
                <span style={{ color: 'black' }}>{timeEntry?.description ?? ''}</span>
              </Tooltip>
            </div>
          </Col>
        )
      }

      <Col
        xs={24}
        sm={24}
        md={entryType !== EntryType.Cico ? 7 : 12}
        lg={entryType !== EntryType.Cico ? 7 : 12}
        xl={entryType !== EntryType.Cico ? 7 : 12}
        className={styles['client-name']} 
      >
        { entryType === EntryType.Cico && props.length && <Length length={props.length} /> }
        <div className={styles['data-box']}>
          <Tooltip title={`${timeEntry?.project?.client?.name} : ${timeEntry?.project?.name}`}>
            <span>{timeEntry?.project?.client?.name ?? ""} </span>
            {timeEntry?.project?.client?.name ? " : " : ""}
            <span style={{ color: 'black' }}>{timeEntry?.project?.name ?? ""}</span>
          </Tooltip>
        </div>
      </Col>

      <Col
        xs={24}
        sm={24}
        md={3}
        lg={3}
        xl={3}
        className={styles['start-time']} 
        onClick={event => { event.stopPropagation() }}
      >
        <span className={styles['data-box']}>
          {moment(minStartTime ?? timeEntry?.startTime).utc().format('LT')}
        </span>
      </Col>
      <Col
        xs={24}
        sm={24}
        md={3}
        lg={3}
        xl={3}
        className={styles['end-time']}
        onClick={event => { event.stopPropagation() }}
      >
        <span className={styles['data-box']}>
          {moment(maxEndTime ?? timeEntry?.endTime).utc().format('LT')}
        </span>
      </Col>

      <Col
        xs={12}
        sm={12} md={4}
        lg={3}
        xl={3}
        className={styles['total-time']}
        onClick={event => { event.stopPropagation() }}
      >
        {props.totalBreakDuration ? 
        <div>
        {getTimeFormat(props.totalBreakDuration)}
        </div>
        :
        <Popover content = {breakTimeList} >
        <div>
        {getTimeFormat(timeEntry?.breakDuration)}
        </div>
        </Popover>
        }
      </Col>
      <Col
        xs={12}
        sm={12} md={4}
        lg={3}        xl={3}
        className={styles['total-time']}
        onClick={event => { event.stopPropagation() }}
      >
        <div>
          {getTimeFormat(props?.totalDuration ?? timeEntry?.duration) ?? 'N/A'}
        </div>
      </Col>

      {/* {
        entryType !== EntryType.Cico && (
          <Col
            xs={12}
            sm={12}
            md={2}
            lg={2}
            xl={2}
            className={styles['play-button']}
            onClick={event => { event.stopPropagation() }}>
            <img src={playBtn} alt="play Button" onClick={() => clickPlayButton()} />
          </Col>
        )
      } */}
    </Row>
  )
}

export default TimeEntry;
