import moment from 'moment';
import { Avatar } from 'antd';

import profileImg from '../../assets/images/default_pp.png'

import styles from './style.module.scss';

interface IProps {
  name: string;
  date: string;
  comment: string;
  avatar?: string;
}

const CommentBody = (props: IProps) => {
  return (
    <div className={styles['comment-body']}>
      <div className={styles['header']}>
        <div className={styles['profile']}>
          <Avatar
            src={props?.avatar ?? profileImg}
          />
          <span className={styles['commenter']}>{props.name}</span>
          <span className={styles['commented']}> Commented</span>
        </div>

        <div className={styles['time']}>
          {moment(props.date).utc().fromNow()}
        </div>
      </div>

      <div className={styles['comment']}>
        {props.comment}
      </div>
    </div>
  )
}

export default CommentBody;
