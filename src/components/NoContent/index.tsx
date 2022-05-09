import { Image } from 'antd';

import noContent from '../../assets/images/no_content.svg';
import styles from "./style.module.scss";

const NoContent = (props: any) => {
  const {title} = props

  return (
    <div className={styles['no-content-div']}>
      <div>
        <Image width={100} src={noContent} preview={false} />
      </div>
      <div>
        <p> No {title} added.</p>
      </div>
    </div>
  );
};

export default NoContent;