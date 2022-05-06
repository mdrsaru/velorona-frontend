import { Card, Col, Row, Skeleton } from 'antd';
import LoginLoader from "../LoginLoader";

const TimeSheetLoader = (props: { loading?: boolean, count?: number }) => {
  const { loading, count } = props
  const pathname = window.location.pathname

  if (pathname === '/login' || pathname === '/login/admin') {
    return <LoginLoader />
  }

  return (
    <div>
      <Row>
        <Col
          span={24}
          style={{
            background: '#f0f2f5'
          }}>
          <Card
            bordered={false}
            style={{
              margin: '2.5rem 0 1.5rem 0',
              paddingTop: '1.5rem'
            }}>
            <Row>
              <Col span={11}>
                <Skeleton.Button
                  active={loading ?? true}
                  size={'large'}
                  block={true} />
              </Col>
              <Col span={2} />
              <Col span={11} style={{ textAlign: 'end' }}>
                <Skeleton.Button
                  active={loading ?? true}
                  size={'large'}
                  block={true} />
              </Col>
            </Row>
            <br />
            <Row>
              <Col span={11}>
                <Skeleton.Button
                  active={loading ?? true}
                  size={'large'}
                  block={true} />
              </Col>
              <Col span={2} />
              <Col span={11} style={{ textAlign: 'end' }}>
                <Skeleton.Button
                  active={loading ?? true}
                  size={'large'}
                  block={true} />
              </Col>
            </Row>
            <br />
          </Card>
          <Card>
            <Row>
              {Array.from({ length: count ?? 5 }, (_, i) =>
                <Col
                  span={24}
                  style={{
                    width: '100%',
                    paddingBottom: '0.5rem'
                  }}
                  key={i}>
                  <Skeleton.Button
                    active={loading ?? true}
                    size={'large'}
                    block={true} />
                </Col>)}
            </Row>
          </Card>
          <br />
          <Card bordered={false}>
            <Row>
              <Col span={4}>
                <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
              </Col>
              <Col span={16} />
              <Col span={4} style={{ textAlign: 'end' }}>
                <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
              </Col>
            </Row>
            <br />
            <Row>
              {Array.from({ length: count ?? 5 }, (_, i) =>
                <Col span={24} style={{ width: '100%', paddingBottom: '0.5rem' }} key={i}>
                  <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
                </Col>)}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TimeSheetLoader
