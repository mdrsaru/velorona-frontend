import React from "react";
import { Card, Col, Row } from "antd";

import styles from "./style.module.scss";


const Schedule = () => {

  return (
    <>
      <div className={styles['main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={24} className={styles['form-col']}>
              <h1>My Weekly Work Schedule</h1>
            </Col>
          </Row>
          <Row>
            <Col span={24} className={styles['schedule-list']}>
              <div className={styles['schedule-col']}>
                <div className={styles['schedule-header']}>
                  <div className={styles['schedule-status']}>
                    Monday
                  </div>
                  <div className={styles['duration']}>
                    (Feb 14)
                  </div>
                </div>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
                <Card className={styles['schedule-card']} >
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
                <Card className={styles['schedule-card']}>
                  <Card.Grid hoverable={false} className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
                <Card className={styles['schedule-card']}>
                  <Card.Grid hoverable={false} className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
              </div>
              <div className={styles['schedule-col']}>
                <div className={styles['schedule-header']}>
                  <div className={styles['schedule-status']}>
                    Tuesday
                  </div>
                  <div className={styles['duration']}>
                    (Feb 14)
                  </div>
                </div>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
              </div>
              <div className={styles['schedule-col']}>
                <div className={styles['schedule-header']}>
                  <div className={styles['schedule-status']}>
                    Wednesday
                  </div>
                  <div className={styles['duration']}>
                    (Feb 15)
                  </div>
                </div>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
              </div>
              <div className={styles['schedule-col']}>
                <div className={styles['schedule-header']}>
                  <div className={styles['schedule-status']}>
                    Thurday
                  </div>
                  <div className={styles['duration']}>
                    (Feb 14)
                  </div>
                </div>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
              </div>
              <div className={styles['schedule-col']}>
                <div className={styles['schedule-header']}>
                  <div className={styles['schedule-status']}>
                    Friday
                  </div>
                  <div className={styles['duration']}>
                    (Feb 14)
                  </div>
                </div>
                <Card className={styles['schedule-card']}>
                  <Card.Grid
                    hoverable={false}
                    className={styles.gridStyle70}>
                    <span className={styles['schedule-name']}>
                      Chat UI Design
                    </span>
                  </Card.Grid>
                </Card>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </>
  )
}

export default Schedule;
