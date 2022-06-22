import { Col, Row, Typography } from 'antd';
import {IDashboardCount} from "../../../interfaces/IDashboard";
import styles from './style.module.scss';

const { Title } = Typography;
interface IProps {
  data: IDashboardCount[];
}
const DashboardCount = (props: IProps) => {
  const {data} = props;
  return (
      <Row>
        {data && data.map((item: {title: string, count: number, icon: string}, index) =>(
          <Col xs={24} sm={12} lg={8} key={index}>
            <div className={styles['dashboard-count']}>
              <div>
                <Title level={5} type="secondary">{item.title}</Title>
                <Title className={styles['no-margin']} level={2}>{item.count}</Title>
              </div>
              <img src={item.icon} alt="Employee" />
            </div>
          </Col>
        ))}
      </Row>
  )
}

export default DashboardCount;
