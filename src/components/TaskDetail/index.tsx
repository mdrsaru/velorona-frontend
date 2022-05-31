
import { CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { Modal } from "antd"
import parse from 'html-react-parser'
import styles from "./styles.module.scss";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
}
const TaskDetail = (props: IProps) => {
  return (
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
            {props.data.attachments &&
              <>
                <span>Attachments</span> &nbsp; &nbsp;
                {props.data.attachments.map((attachment: any, index: number) => (
                  <div key={index}>
                    <span className={styles['file-attach']}><LinkOutlined /></span> &nbsp;
                    <span className={styles['file-name']}>
                      <a href={attachment.url} target='_blank' rel="noreferrer">
                        {attachment.name}
                      </a>
                    </span>  &nbsp; &nbsp;
                  </div>
                ))}
              </>
            }
          </div>
        ]}
        width={869}>
        <div className={styles['modal-body']}>
          <div>
            <span className={styles['task-title']}>{props?.data?.name}</span>
          </div>
          <br /><br />
          <div className={styles['task-body']}>
            {parse(props?.data?.description)}

          </div>
        </div>
      </Modal>
    </>
  )
}

export default TaskDetail