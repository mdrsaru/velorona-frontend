import {Card, Col, Row, Skeleton} from 'antd';
import LoginLoader from "../LoginLoader";

const AppLoader = (props: {loading?: boolean, count?: number}) => {
  const {loading, count} = props
  const pathname = window.location.pathname

  if (pathname === '/login' || pathname === '/login/admin') {
    return <LoginLoader/>
  }

  return (
   <div>
     <Row>
       <Col span={24} style={{width: '100%'}}>
         <Skeleton.Button active={loading ?? true} size={'large'} block={true} style={{height: '64px'}} />
       </Col>
     </Row>
     <Row>
       <Col span={4}>
         <Card bordered={false} style={{height: '95vh'}}>
           {Array.from({ length: count ?? 6 }, (_, i) =>
               <Skeleton.Button active={loading ?? true} size={'large'} block={true} key={i}
                                style={{width: '100%', marginBottom: '0.4rem'}}/>)}
         </Card>
       </Col>
       <Col span={20} style={{background: '#f0f2f5'}}>
         <Card bordered={false} style={{margin: '2.5rem 1.6rem 2.5rem 1.6rem', paddingTop: '1.5rem'}}>
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
             {Array.from({ length: count ?? 15 }, (_, i) =>
               <Col span={24} style={{width: '100%', paddingBottom: '0.5rem'}} key={i}>
                 <Skeleton.Button active={loading ?? true} size={'large'} block={true} />
               </Col>)}
           </Row>
         </Card>
       </Col>
     </Row>
   </div>
  )
}

export default AppLoader
