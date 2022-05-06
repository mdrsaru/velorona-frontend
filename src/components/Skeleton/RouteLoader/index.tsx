import {Card, Col, Row, Skeleton} from 'antd';
import styles from "../../../pages/Employee/style.module.scss";

const RouteLoader = (props: {loading?: boolean, count?: number}) => {
  const { count, loading } = props

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={4}>
            <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
          </Col>
          <Col span={16}/>
          <Col span={4} style={{textAlign: 'end'}}>
            <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
          </Col>
        </Row>
        <br/>
        <Row>
          {Array.from({ length: count ?? 15 }, (_, i) =>
            <Col span={24} style={{width: '100%', paddingBottom: '0.5rem'}} key={i}>
              <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
            </Col>)}
        </Row>
      </Card>
    </div>
  )
}

export default RouteLoader
