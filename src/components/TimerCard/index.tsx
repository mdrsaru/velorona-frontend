import { Button } from 'antd';
import styles from './style.module.scss';

interface IProps {
  title?: string;
  isRunning: boolean;
  hours: any;
  minutes: any;
  seconds: any;
  disabled?: boolean;
}

const TimerCard = (props: IProps) => {
  const {hours, minutes, seconds, isRunning, title} = props

  return (
    <div className={styles['timer-div']}>
      <div>
        <span>
          {(hours > 9 ? hours : '0' + hours) + ':' +
            (minutes > 9 ? minutes : '0' + minutes) + ':'
            + (seconds > 9 ? seconds : '0' + seconds)}
        </span>
      </div>
      <div>
        {isRunning ?
          <Button
            type="primary"
            htmlType="submit"
            danger
            disabled={props.disabled}
          >
            Stop {title ?? ''}
          </Button> :
          <Button
            type="primary"
            htmlType="submit"
            disabled={props.disabled}
          >
            Start {title ?? ''}
          </Button>}
      </div>
    </div>
  );
};

export default TimerCard;
