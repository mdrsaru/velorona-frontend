import {Image} from 'antd'
import noResult from '../../assets/images/no_result.svg'
import styles from '../NoContent/style.module.scss'

const ResultNotFound = () => {

  return (
    <div className={styles['no-content-div']} style={{alignItems:'center'}}>
    <div className={styles['wrapper']}>
      <Image src={noResult} preview={false}  className={styles['image']}/>
    
    <div >
      <p className={styles['title']}> No Result Found !</p>
      <p className={styles['sub-title']}>The content you are searching for is not found</p>

    </div>
  </div>
   </div>
  );
};

export default ResultNotFound;

