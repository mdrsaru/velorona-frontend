import {Card, Col, Row, Skeleton} from 'antd';

const AppLoader = (props: {loading?: boolean, count?: number}) => {
  const {loading, count} = props

  return (
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
      <br/><br/>
      <Row>
        {Array.from({ length: count ?? 10 }, (_, i) =>
          <div key={i}>
            <Col span={24}>
              <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
            </Col> <br/><br/>
          </div>)}
      </Row>
    </Card>
  )
}

export default AppLoader
