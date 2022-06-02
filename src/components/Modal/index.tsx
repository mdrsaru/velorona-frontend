import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import styles from "./style.module.scss";

const ModalConfirm = (props: {
  visibility: boolean;
  setModalVisibility: any;
  imgSrc: string;
  okText: string;
  modalBody: any;
  closable?: boolean;
  onOkClick?: any;
}) => {
  return (
    <Modal
      title=""
      centered
      visible={props.visibility}
      okText={props.okText}
      closable={props.closable ? props.closable : false}
        closeIcon={[
        <div onClick={() => props.closable} key={1}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      onOk={() => props.onOkClick()}
      onCancel={() => props.setModalVisibility(false)}
      width={1000}
      className={styles["confirm-modal"]}
    >
      {<props.modalBody />}
    </Modal>
  );
};

export default ModalConfirm;
