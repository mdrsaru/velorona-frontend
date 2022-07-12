import styles from "./styles.module.scss";
import {Button, Modal} from "antd";
import { CloseOutlined } from '@ant-design/icons';

interface IAttachmentProps {
  visible: boolean;
  setVisible: any;
  attachment: any;
}

const ApprovedTimesheetAttachment = (props: IAttachmentProps) => {
  const {visible, setVisible, attachment} = props;
  return (
    <Modal
      centered
      visible={visible}
      footer={null}
      closeIcon={[
        <div onClick={() => setVisible(false)} key={1}>
          <Button
            shape="circle"
            icon={<CloseOutlined />}
            className={styles['close-icon-div']}
          />
        </div>,
      ]}
      width={750}
    >
      <img src={attachment?.url} alt={attachment?.name} className={styles['attachment']}/>
    </Modal>
  )
}

export default ApprovedTimesheetAttachment;