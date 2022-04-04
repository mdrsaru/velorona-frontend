import React from "react";
import moment from "moment";

import { Avatar, Card, Col, Row, Button } from "antd";
import { ArrowLeftOutlined, AntDesignOutlined } from "@ant-design/icons";

import {gql, useQuery} from "@apollo/client";
import {Link, useNavigate, useParams} from "react-router-dom";
import routes from "../../../config/routes";

import {authVar} from "../../../App/link";
import image from '../../../assets/images/High_five.svg'
import styles from "../style.module.scss";

const USER = gql`
  query User($input: UserQueryInput!) {
      User(input: $input) {
      data {
        id
        email
        phone
        fullName
        status
        address {
          city
          streetAddress
        }
        record {
          startDate
          endDate
          payRate
        }
      }
    }
  }
`

const DetailEmployee = () => {
  const navigate = useNavigate();
  const loggedInUser = authVar();
  let params = useParams();
  const {data: userData} = useQuery(USER, {
    variables: {
      input: {
        query: {
          id: params?.eid
        }
      }
    }
  })

  console.log(userData);

  return (
    <div className={styles['main-div']}>
      {userData?.User?.data[0] &&
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['employee-col']}>
              <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Employee</h1>
            </Col>
          </Row>
          <Row justify="center">
            <Col className={styles['avatar-col']}>
              <div className={styles['avatar-image']}>
                <Avatar src={image}  size={{ xs: 100, sm: 100, md: 100, lg: 100, xl: 100, xxl: 100 }} icon={<AntDesignOutlined />}/>
              </div>
              <div className={styles['name-tag']}><span>Employee</span></div>
            </Col>
          </Row>
          <br/>
          <Row justify="center">
            <Col className={styles['avatar-col']}>
              <div className={styles['employee-name']}>{userData?.User?.data[0]?.fullName ?? 'N/A'}</div>
              <div className={styles['employee-title']}>UX/UI Designer</div>
            </Col>
          </Row>
          <br/>
          <Row className={styles['detail-row']}>
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Email</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.email ?? 'N/A'}</span>
              </div>
              <div>
                <div>Address</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.address?.streetAddress ?? 'N/A'}
                  {userData?.User?.data[0]?.address?.city ? ' ,' + userData?.User?.data[0]?.address?.city : ''}</span>
              </div>
              <div>
                <div>Employee Start Date</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.record?.startDate ?
                  moment(userData?.User?.data[0]?.record?.startDate).format('L') : 'N/A'}</span>
              </div>
              <div>
                <div>PayRate</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.record?.payRate ?? 0}</span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Phone Number</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.phone}</span>
              </div>
              <div>
                <div>Status</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.status}</span>
              </div>
              <div>
                <div>Employee End Date</div>
                <span className={styles.detailValue}>{userData?.User?.data[0]?.record?.endDate ?
                  moment(userData?.User?.data[0]?.record?.endDate).format('L') : 'N/A'}</span>
              </div>
            </Col>
          </Row>
          <Row justify="end" className={styles['footer-btn']}>
            <Col>
              <Button type="primary">
                <Link to={routes.editEmployee.path(loggedInUser?.company?.code ?? '1', params?.eid ?? '1')}>Edit Employee</Link>
              </Button>
            </Col>
          </Row>
        </Card>}
    </div>
  )
}

export default DetailEmployee;
