import { Spin } from 'antd';

import styles from './style.module.scss';

const SpinLoader = () => (
  <div className={styles.spin}>
    <Spin />
  </div>
);

export default SpinLoader;

