import styles from './styles.module.scss'
import { useNavigate } from 'react-router-dom';
import routes from '../../config/routes';

const Footer = () =>{
	const navigate = useNavigate()
  return (
    <div className={styles['footer-div']}>
    <p className={styles['footer-text']}>
		<span onClick={()=>navigate(routes.privacyPolicy.childPath)}>Privacy Policy. </span>
		<span onClick={()=>navigate(routes.termsAndCondition.childPath)}>Terms and Conditions.</span>
		<span onClick={()=>navigate(routes.cookiePolicy.childPath)}> Cookies Policy </span>
		</p>
    </div>
  )
}

export default Footer