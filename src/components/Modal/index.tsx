import { Modal } from "antd";
import styles from "./style.module.scss";

const ModalConfirm = (props: {visibility: boolean, setModalVisibility: any, imgSrc: string, okText: string, modalBody: any
  onOkClick?: any}) => {
  return(
    <Modal
      title=""
      centered
      visible={props.visibility}
      okText={props.okText}
      closable={false}
      onOk={() => props.onOkClick()}
      onCancel={() => props.setModalVisibility(false)}
      width={1000} className={styles['confirmModal']}>
      {<props.modalBody/>}
    </Modal>
  )
}

export default ModalConfirm
