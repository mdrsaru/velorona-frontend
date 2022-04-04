import {Card, Col, Row, Skeleton} from 'antd';

const RouteLoader = (props: {loading?: boolean}) => {
  const {loading} = props

  return (
    <Card bordered={false}>
      <br/>
      <Row>
        <Col span={24}>
          <Skeleton active={loading ?? true} paragraph={{rows: 7}} />
        </Col>
      </Row>
    </Card>
  )
}

export default RouteLoader
