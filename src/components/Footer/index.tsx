import styles from './styles.module.scss'

const Footer = () =>{
  return (
    <div className={styles['footer-div']}>
    <p className={styles['footer-text']}>Privacy Policy. Terms and Conditions. Cookies Policy</p>
    </div>
  )
}

export default Footer