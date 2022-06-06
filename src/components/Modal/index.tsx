import { ReactNode } from 'react';
import { Modal } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import styles from "./style.module.scss";

const ModalConfirm = (props: {
  visibility: boolean;
  setModalVisibility: any;
  imgSrc?: string;
  okText: string;
  modalBody: ReactNode;
  closable?: boolean;
  onOkClick?: any;
  onCancel?: () => void;
  loading?: boolean;
}) => {

  const onCancel = () => {
    props?.onCancel?.();
    props.setModalVisibility(false);
  }

  return (
    <Modal
      title=""
      centered
      visible={props.visibility}
      okText={props.okText}
      confirmLoading={props?.loading}
      closable={props.closable ? props.closable : false}
        closeIcon={[
        <div onClick={() => props.closable} key={1}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      onOk={() => props.onOkClick()}
      onCancel={onCancel}
      width={1000}
      className={styles["confirm-modal"]}
    >
      {props.modalBody}
    </Modal>
  );
};

export default ModalConfirm;
