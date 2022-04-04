import {Card, Col, Row, Skeleton} from 'antd';

const LoginLoader = (props: {loading?: boolean}) => {
  const {loading} = props

  return (
    <Card bordered={false}>
      <br/><br/>
      <Row style={{paddingTop: '2rem'}}>
        <Col span={6}>
          <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
        </Col>
        <Col span={12}/>
      </Row>
      <br/><br/>
      <Row>
        <Col span={4}>
          <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
        </Col>
        <Col span={12}/>
      </Row>
      <br/>
      <Row>
        <Col span={12}>
          <Skeleton active={loading ?? true} paragraph={{rows: 7}} />
        </Col><br/><br/>
        <Col span={12}/>
      </Row><br/>
      <Row>
        <Col span={12}>
          <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
        </Col>
        <Col span={12}/>
      </Row>
    </Card>
  )
}

export default LoginLoader
