import { Col, Row } from 'antd';
import styles from './style.module.scss';

const Dashboard = () => {
  return (
    <>
      <Row>
        <Col span={24}>
          <div className={styles['main-title']}>
            Welcome Vellorum User!
          </div>
        </Col>
      </Row>
    </>
  )
}

export default Dashboard;
