
import { CloseOutlined , LinkOutlined} from "@ant-design/icons";
import { Modal } from "antd"

import styles from "./styles.module.scss";

interface IProps{
  visibility:boolean;
  setVisibility:any;
  data:any;
}
const TaskDetail = (props:IProps) =>{
  return(
    <>
       <Modal
        centered
        visible={props?.visibility}
        closeIcon={[
          <div onClick={() => props?.setVisibility(false)}>
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
            <span className={styles['task-title']}>{props.data.name}</span>
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

export default TaskDetail