import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import styles from "./style.module.scss";

interface IProps {
  visible: boolean;
  client: any;
  setVisible: any;
}

const ClientDetail = (props: IProps) => {
  return (
    <div className={styles["detail-container"]}>
      <Modal
        centered
        visible={props.visible}
        closeIcon={[
          <div onClick={() => props.setVisible(false)}>
            <span className={styles["close-icon-div"]}>
              <CloseOutlined />
            </span>
          </div>,
        ]}
        okText="Cancel"
        cancelButtonProps={{ style: { display: "none" } }}
        okButtonProps={{ style: { marginBottom: "1rem" } }}
        onOk={() => props.setVisible(false)}
        width={700}
      >
        <div className={styles["modal-title"]}>
          <p>Client Information</p>
        </div>
        <div className={styles["container"]}>
          <div className={styles["client-status"]}>{props.client.status}</div>
          <p className={styles["client-name"]}>{props.client.name}</p>
          <p className={styles["client-detail"]}>
            {props.client.address.streetAddress}
          </p>
          <p className={styles["client-detail"]}>{props.client.email}</p>
        </div>
      </Modal>
    </div>
  );
};
export default ClientDetail;
