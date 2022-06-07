
import { _cs } from '../../utils/common';

import styles from './style.module.scss';

interface IProps {
  status: string;
}
const Status = (props: IProps) => {
  const status = props.status;

  return <span className={_cs([styles[status], styles['status']])}>{status}</span>;
};

export default Status;
