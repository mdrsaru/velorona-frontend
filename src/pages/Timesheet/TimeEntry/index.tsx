import {
  Col,
  Row,
  Tooltip
} from 'antd';
import moment from 'moment';
import playBtn from '../../../assets/images/play-circle.svg';
import { getTimeFormat } from '..';

import styles from '../style.module.scss';

const TimeEntry = (props: any) => {
  const { length, data, clickPlayButton, rowClassName } = props

  return (
    <Row className={styles[rowClassName]}>
      <Col
        xs={24}
        sm={24}
        md={6}
        lg={6}
        xl={6}
        className={styles['task-name']}>
        <div>
          {length > 1 &&
            <p>
              {length}
            </p>}
        </div>
        <div className={styles['data-box']} onClick={event => { event.stopPropagation() }}>
          <Tooltip title={data?.name ?? ''}>
            <span style={{ color: 'black' }}>{data?.name ?? ''}</span>
          </Tooltip>
        </div>
      </Col>

      <Col
        xs={24}
        sm={24}
        md={6}
        lg={7}
        xl={7}
        className={styles['client-name']} onClick={event => { event.stopPropagation() }}>
        <div className={styles['data-box']}>
          <Tooltip title={data?.client + " : " + data?.project}>
            <span>{data?.client ?? ""} </span>
            {data?.client ? " : " : ""}
            <span style={{ color: 'black' }}>{data?.project ?? ""}</span>
          </Tooltip>
        </div>
      </Col>

      <Col
        xs={24}
        sm={24}
        md={3}
        lg={3}
        xl={3}
        className={styles['start-time']} onClick={event => { event.stopPropagation() }}>
        <span className={styles['data-box']}>
          {moment(data?.startTime).format('LT')}
        </span>
      </Col>
      <Col
        xs={24}
        sm={24}
        md={3}
        lg={3}
        xl={3}
        className={styles['end-time']} onClick={event => { event.stopPropagation() }}>
        <span className={styles['data-box']}>
          {moment(data?.endTime).format('LT')}
        </span>
      </Col>

      <Col
        xs={12}
        sm={12}
        md={4}
        lg={3}
        xl={3}
        className={styles['total-time']} onClick={event => { event.stopPropagation() }}>
        <div>
          {getTimeFormat(data?.duration) ?? 'N/A'}
        </div>
      </Col>

      <Col
        xs={12}
        sm={12}
        md={2}
        lg={2}
        xl={2}
        className={styles['play-button']}
        onClick={event => { event.stopPropagation() }}>
        <img src={playBtn} alt="play Button" onClick={clickPlayButton} />
      </Col>
    </Row>
  )
}

export default TimeEntry;
