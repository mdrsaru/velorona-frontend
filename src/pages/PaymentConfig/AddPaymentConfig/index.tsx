import { Card, Row, Col } from "antd"
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';


import PaymentConfigForm from "../PaymentConfigForm"

import styles from '../style.module.scss'
const AddPaymentConfig = () =>{
	const navigate = useNavigate();

	return(
		<div className={styles['company-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['form-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New Payment Config
            </h1>
          </Col>
        </Row>

        <PaymentConfigForm />
      </Card>
			</div>
	)
}

export default AddPaymentConfig