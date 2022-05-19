import { Image } from 'antd';

import noContent from '../../assets/images/no_content.svg';
import styles from "./style.module.scss";

const NoContent = (props: any) => {
  const {title} = props

  return (

    <div className={styles['no-content-div']} style={{alignItems:'center'}}>
    <div className={styles['wrapper']}>
      <Image src={noContent} preview={false}  className={styles['image']}/>
    
    <div >
      <p className={styles['title']}> Content Not Found !</p>
      <p className={styles['sub-title']}>The content you are searching for is not found</p>

    </div>
  </div>
   </div>
  );
};

export default NoContent;