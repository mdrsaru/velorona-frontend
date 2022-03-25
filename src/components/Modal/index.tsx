import {Modal} from "antd";

const ModalConfirm = (props: {visibility: boolean, setModalVisibility: any, imgSrc: string, okText: string, modalBody: any}) => {
  return(
    <Modal
      title=""
      centered
      visible={props.visibility}
      okText={props.okText}
      closable={false}
      onOk={() => props.setModalVisibility(false)}
      onCancel={() => props.setModalVisibility(false)}
      width={1000}>
      {<props.modalBody/>}
    </Modal>
  )
}

export default ModalConfirm
