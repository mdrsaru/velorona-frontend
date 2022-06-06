import { Spin } from 'antd';

import styles from './style.module.scss';

const Loader = () => (
  <div className={styles.spin}>
    <Spin />
  </div>
);

export default Loader;

