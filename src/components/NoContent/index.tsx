import { Image } from 'antd';

import noContent from '../../assets/images/no_content.svg';
import styles from "./style.module.scss";

const NoContent = (props: any) => {
  const {title, subtitle} = props

  return (

    <div className={styles['no-content-div']} style={{alignItems:'center'}}>
    <div className={styles['wrapper']}>
      <Image src={noContent} preview={false}  className={styles['image']}/>
    
    <div >
      <p className={styles['title']}> {title}</p>
      <p className={styles['sub-title']}>{subtitle}</p>

    </div>
  </div>
   </div>
  );
};

export default NoContent;