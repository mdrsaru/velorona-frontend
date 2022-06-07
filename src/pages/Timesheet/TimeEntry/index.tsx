import {
  Col,
  Row,
  Input
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
        span={6}
        className={styles['task-name']}>
        <div>
          {length > 1 &&
            <p>
              {length}
            </p>}
        </div>
        <div onClick={event => { event.stopPropagation() }}>
          <Input
            type="text"
            value={data?.name ?? ''} />
        </div>
      </Col>

      <Col
        span={4}
        className={styles['client-name']} onClick={event => { event.stopPropagation() }}>
        <Input type="text"
          value={data?.project ?? ''} />
      </Col>

      <Col
        span={3}
        className={styles['start-time']} onClick={event => { event.stopPropagation() }}>
        <Input type="text"
          value={moment(data?.startTime).format('LT')} />
      </Col>

      <Col
        span={3}
        className={styles['end-time']} onClick={event => { event.stopPropagation() }}>
        <Input
          type="text"
          defaultValue={moment(data?.endTime).format('LT')}
          value={moment(data?.endTime).format('LT')} />
      </Col>

      <Col
        span={4}
        className={styles['total-time']} onClick={event => { event.stopPropagation() }}>
        <div>{getTimeFormat(data?.duration) ?? 'N/A'}</div>
      </Col>

      <Col
        span={4}
        className={styles['play-button']}
        onClick={event => { event.stopPropagation() }}>
        <img src={playBtn} alt="play Button" onClick={clickPlayButton} />
      </Col>
    </Row>
  )
}

export default TimeEntry;
