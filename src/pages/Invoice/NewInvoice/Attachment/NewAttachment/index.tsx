import { useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Upload,
  UploadProps
} from 'antd';

import { authVar } from '../../../../../App/link';
import constants from '../../../../../config/constants';
import { AttachmentType, AttachmentCreateInput } from '../../../../../interfaces/generated';

import styles from './style.module.scss'

type IFile = {
  id: string;
  name: string;
};

interface IProps {
  addAttachment: (data: AttachmentCreateInput) => void;
  onCancel: () => void;
  addMediaById: (id: string, name: string) => void;
}

const NewAttachment = (props: IProps) => {
  const authData = authVar()

  const [form] = Form.useForm();
  const [type, setType] = useState('')
  const [file, setFile] = useState<IFile | undefined>();

  const uploadProps: UploadProps = {
    name: 'file',
    action: `${constants.apiUrl}/v1/media/upload`,
    maxCount: 1,
    accept: 'image/*',
    headers: {
      'Authorization': authData?.token ? `Bearer ${authData?.token}` : '',
    },
    onChange(info) {
      form.setFieldsValue({ attachment: file as any })
      form.setFields([{
        name: 'upload',
        errors: []
      }]);

      if (info.file.status === 'done') {
        const name = info?.file?.name;
        const id = info?.file?.response?.data?.id;

        setFile({
          id,
          name,
        });

        props.addMediaById(id, name)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    }
  };

  const onFinish = (values: any) => {
    if(!file){
      form.setFields([{
        name: 'upload',
        errors: ['Please upload attachment'],
      }]);
      return
    }

    const data: any = {
      description: values?.description,
      type: values?.type,
      amount: values?.amount,
      date: values?.date?.format('YYYY-MM-DD'),
      created_by: authData?.user?.id,
    }

    if (file.id) {
      data.attachment_id = file?.id
    }

    props.addAttachment(data);
    setFile(undefined)
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const handleTypeChange = (value: any) =>{
    setType(value)
  }

  return (
    <div className={styles['container']}>
      <Form
        form={form}
        layout="vertical"
        name="payrate-form"
        onFinish={onFinish}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              label="Expense Type"
              name="type"
              rules={[{
                required: true,
                message: 'Please enter expense type'
              }]}
            >
              <Select placeholder='Select expense type' onChange={handleTypeChange}>
                {
                  Object.values(AttachmentType).map((type) => (
                    <Select.Option value={type} key={type}>{type}</Select.Option>
                  ))
                }
              </Select>
            </Form.Item>
          </Col>

          {
            type === AttachmentType.Expense && (
              <>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label="Amount"
                    name="amount"
                    rules={[{ 
                      pattern: new RegExp(/\d+/g),
                      message: "The amount should contain only numbers",
                  }]}
                  >
                    <InputNumber
                      type='number'
                      placeholder="Enter amount"
                      autoComplete="off"
                      min="0"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={12} lg={12}>
                  <Form.Item
                    label="Date"
                    name="date" >
                    <DatePicker placeholder="Please select date"/>
                  </Form.Item>
                </Col>
              </>
            )
          }

          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{
                required: true,
                message: 'Please enter Description'
              }]}
            >
              <Input
                placeholder="Enter description of the Timesheet"
                autoComplete="off"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24} lg={24}>
            <Form.Item
              name="upload"
              label={
                <span> <span className={styles['asterisk-icon']} style={{ color: '#ff4d4f', fontSize: '14px' }} > * </span> Attachment </span>
              } 
              valuePropName="filelist"
              getValueFromEvent={normFile}
              style={{ position: 'relative' }}
            >
              <div className={styles['upload-file']}>
                <div>
                  <span>
                    {file ? file?.name : 'Attach your files here'}
                  </span>
                </div>

                <div className={styles['browse-file']}>
                  <Upload {...uploadProps}>Click to Upload</Upload>
                </div>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <br />

        <Row justify="end">
          <Col style={{ padding: '0 1rem 1rem 0' }}>
            <Form.Item name="action-button">
              <Space>
                <Button
                  type="default"
                  htmlType="button"
                  onClick={props.onCancel}
                >
                  Cancel
                </Button>

                <Button
                  type="primary"
                  htmlType="submit"
                >
                  Add
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
};

export default NewAttachment;
