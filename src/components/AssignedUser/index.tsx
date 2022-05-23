import { Col, Row } from "antd";
import styles from "./style.module.scss";

interface IProps {
  users: any;
}
const AssignedUser = (props: IProps) => {
  return (
    <div>
      {props.users.length > 0 ? (
        <Row>
          {props.users.map((user: any, index: number) => (
            <Col span={10}>
              <div className={styles.users} key={index}>
                <p className={styles.fullName}>{user.fullName}</p>
              </div>
            </Col>
          ))}
        </Row>
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default AssignedUser;
