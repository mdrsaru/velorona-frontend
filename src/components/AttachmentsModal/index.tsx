
import { Modal, Table } from "antd"

import { CloseOutlined } from '@ant-design/icons';

import { useState } from "react";
import ApprovedTimesheetAttachment from "../ApprovedTimesheetAttachment";


import styles from './styles.module.scss'


interface IProps {
  visibility: boolean;
  setVisibility: any;
  attachment: any;
}
const AttachmentModal = (props: IProps) => {

  const [viewAttachment, setViewAttachment] = useState(false);
  const [attachedTimesheetAttachment, setAttachedTimesheetAttachment] = useState<any>();

  const handleAttachmentView = (data: any) => {
    setViewAttachment(!viewAttachment);
    setAttachedTimesheetAttachment(data);
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
      width: '30%',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: (date: any) => {
        return (
          <span>{date.split('T')?.[0]}</span>
        )
      }
    },
    {
      title: 'Attachment',
      key: 'attachments',
      dataIndex: 'attachments',
      render: (attachments: any) => {
        return (
          <span 
          className={styles['table-attachment']}
            onClick={() => handleAttachmentView(attachments)}>
            {attachments?.name}
          </span>
        )
      }
    }
  ];

  return (<>
    <Modal
      title=""
      centered
      visible={props.visibility}
      okText='Ok'
      cancelButtonProps={{ style: { display: 'none' } }}
      onOk={() => props.setVisibility(false)}
      width={1000}
      closeIcon={[
        <div onClick={() => props?.setVisibility(false)} key={1}>
            <span className={styles["close-icon-div"]}>
                <CloseOutlined />
            </span>
        </div>,
    ]}
    >
       <div >
       <div className={styles['title-div']}>
            <span className={styles["title"]}>
              Attachments
            </span>
          </div>
      <Table
        dataSource={props?.attachment}
        columns={columns}
        pagination={false}
      />
      </div>
    </Modal>
    <ApprovedTimesheetAttachment
        visible={viewAttachment}
        setVisible={setViewAttachment}
        attachment={attachedTimesheetAttachment}
      />

    </>
  )
}

export default AttachmentModal