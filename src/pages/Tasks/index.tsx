import React, { useState } from "react";
import { Card, Col, Row, Avatar, Modal } from "antd";
import { UserOutlined, LinkOutlined, CloseOutlined } from '@ant-design/icons';

import {
  gql,
  // useQuery
} from "@apollo/client";
import styles from "./style.module.scss";
// import {authVar} from "../../App/link";


export const TASK = gql`
    query Task($input: TaskQueryInput!) {
        Task(input: $input) {
            data {
                id
                name
                status
                archived
                company_id
                project_id
            }
        }
    }
`

const Tasks = () => {
  // const authData = authVar();
  const [visibility, setVisibility] = useState(false);
  // const { data: taskData } = useQuery(TASK, {
  //   fetchPolicy: "network-only",
  //   nextFetchPolicy: "cache-first",
  //   variables: {
  //     input: {
  //       query: {
  //         company_id: authData?.company?.id
  //       },
  //       paging: {
  //         order: ['updatedAt:DESC']
  //       }
  //     }
  //   }
  // })

  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={24} className={styles['form-col']}>
              <h1>My Tasks Schedule</h1>
            </Col>
          </Row>
          <Row>
            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles['task-header']}>
                <div className={styles['task-status']}>
                  Scheduled Tasks
                </div>
                <div className={styles['count']}>
                  4
                </div>
              </div>
              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>

              </Card>

              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>

              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>
                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>

              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>
                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>
            </Col>
            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles['task-header']}>
                <div className={styles['task-status']}>
                  On Going Tasks
                </div>
                <div className={styles['count']}>
                  2
                </div>
              </div>
              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>
                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>

              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>
                <Card.Grid hoverable={false} className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>

                <Card.Grid hoverable={false} className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid hoverable={false} className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>
            </Col>

            <Col xs={24} sm={24} md={8} lg={8}>
              <div className={styles['task-header']}>
                <div className={styles['task-status']}>
                  Completed Tasks
                </div>
                <div className={styles['count']}>
                  1
                </div>
              </div>

              <Card
                className={styles['task-card']}
                onClick={() => { setVisibility(true) }}>
                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle70}>
                  <span className={styles['task-name']}>
                    Chat UI Design
                  </span>
                </Card.Grid>
                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle30}>
                  <Avatar icon={<UserOutlined />} />
                </Card.Grid>

                <Card.Grid
                  hoverable={false}
                  className={styles.gridStyle}>
                  <span className={styles['file-attach']}>
                    <LinkOutlined />
                  </span> &nbsp;
                  <span className={styles['file-name']}>
                    Project.docx
                  </span>
                </Card.Grid>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>

      <Modal
        centered
        visible={visibility}
        closeIcon={[
          <div onClick={() => setVisibility(false)}>
            <span className={styles['close-icon-div']}>
              <CloseOutlined />
            </span>
          </div>
        ]}
        footer={[
          <div className={styles['modal-footer']}>
            <span>Attachments</span> &nbsp; &nbsp;
            <span className={styles['file-attach']}><LinkOutlined /></span> &nbsp;
            <span className={styles['file-name']}>
              Project.docx
            </span>  &nbsp; &nbsp;
            <span className={styles['file-attach']}><LinkOutlined /></span> &nbsp;
            <span className={styles['file-name']}>
              Sample.docx
            </span>
          </div>
        ]}
        width={869}>
        <div className={styles['modal-body']}>
          <div>
            <span className={styles['task-title']}>Chat UI Design</span>
          </div>
          <br /><br />
          <div className={styles['task-body']}>
            <div className={styles['task-subtitle']}>Design UI for Chat feature.</div>
            <div className={styles['description']}>
              <div>1. Must have options for sending and receiving attachment, image and audio files.</div>
              <div>2. Must have options for sending and receiving attachment, image and audio files.</div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default Tasks;
