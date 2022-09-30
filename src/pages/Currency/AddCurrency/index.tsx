import { Card, Col, Row } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import CurrencyForm from '../CurrencyForm';

import styles from '../style.module.scss';


const AddCurrency = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['company-main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={24} className={styles['form-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} />
              &nbsp; Add New Currency
            </h1>
          </Col>
        </Row>

        <CurrencyForm />
      </Card>
    </div>
  );
};

export default AddCurrency;
