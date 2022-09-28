import { useState, Dispatch, SetStateAction } from 'react';
import { Table, Button, Modal } from 'antd';

import { AttachmentCreateInput } from '../../../../interfaces/generated';
import NewAttachment from './NewAttachment';

import styles from './style.module.scss';

interface IProps {
  attachments: AttachmentCreateInput[];
  setAttachments: Dispatch<SetStateAction<AttachmentCreateInput[]>>;
}

const Attachment = (props: IProps) => {
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [mediaById, setMediaById] = useState<{ [id: string]: string }>({})

  const openAttachmentModal = () => {
    setShowAttachmentModal(true)
  }

  const onCancel = () => {
    setShowAttachmentModal(false);
  }

  const addAttachment = (attachment: AttachmentCreateInput) => {
    props.setAttachments([
      ...props.attachments,
      attachment,
    ]);

    setShowAttachmentModal(false);
  }

  const addMediaById = (id: string, name: string) => {
    setMediaById({
      ...mediaById,
      [id]: name,
    });
  }

  const columns = [
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Expense type',
      dataIndex: 'type',
    },
    {
      title: 'Attachment',
      dataIndex: 'attachment_id',
      render: (id: string) => {
        return mediaById?.[id];
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
    },
  ]

  return (
    <>
      <div className={styles['header']}>
        <h1>Attachments</h1>
        <Button
          type="primary"
          onClick={openAttachmentModal}
        >
          Add attachment
        </Button>
      </div>

      {
        !!props.attachments?.length && (
          <Table
            columns={columns}
            dataSource={props.attachments}
          />
          )
      }

      <Modal
        closable
        width={768}
        footer={null}
        destroyOnClose
        onCancel={onCancel}
        title="Attach Expense"
        visible={showAttachmentModal}
      >
        <NewAttachment
          addAttachment={addAttachment}
          onCancel={onCancel}
          addMediaById={addMediaById}
        />
      </Modal>

    </>
  )
}

export default Attachment;
