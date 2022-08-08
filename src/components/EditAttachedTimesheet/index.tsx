import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Space, Upload, UploadProps } from "antd";
import { authVar } from "../../App/link";
import { CloseOutlined } from '@ant-design/icons';
import moment from "moment";

import constants, { attachment_type } from "../../config/constants";

import styles from '../AddAttachedTimesheet/styles.module.scss'
import { gql, useMutation } from "@apollo/client";
import { useEffect, useMemo, useState } from "react";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { AttachedTimesheet, AttachmentType, MutationAttachedTimesheetUpdateArgs } from "../../interfaces/generated";
import { notifyGraphqlError } from "../../utils/error";
interface IProps {
    visibility: boolean;
    setVisibility: any;
    data?: any;
	fileData:any;
	setFile:any;
	refetch:any;
}


const dateFormat = "YYYY-MM-DD HH:mm:ss";

export const ATTACH_TIMESHEET_UPDATE = gql`
    mutation AttachedTimesheetUpdate($input: AttachedTimesheetUpdateInput!) {
      AttachedTimesheetUpdate(input: $input) {
        id
        description
        attachments{
            id 
            name 
            url 
        }
        timesheet{
            id
        }
      }
    }
  `;

const {Option} = Select;

const EditAttachedTimesheet = (props: IProps) => {
    const authData = authVar()
    const [form] = Form.useForm();
	const attachedTimesheet = props?.data;
	const [option,setOption] = useState('')

    const [attachedTimesheetUpdate] = useMutation<GraphQLResponse<'AttachedTimesheetUpdate', AttachedTimesheet>, MutationAttachedTimesheetUpdateArgs>(ATTACH_TIMESHEET_UPDATE, {

        onCompleted() {
            message.success({
                content: `Attachment updated successfully!`,
                className: "custom-message",
            });
           props?.refetch({
                variables: {
                    input: {
                        query: {
                            company_id: authData?.company?.id as string,
                            timesheet_id: props?.data?.timesheet?.id
                        },
                        paging: {
                            order: ['updatedAt:DESC']
                        }
                    }
                }
            })
            props?.setVisibility(false)

        },
        onError(err) {
            notifyGraphqlError(err)
        },
    })

    const uploadProps: UploadProps = {
        name: 'file',
        action: `${constants.apiUrl}/v1/media/upload`,
        maxCount: 1,
        accept: 'image/*',
        headers: {
            'authorization': authData?.token ? `Bearer ${authData?.token}` : '',
        },
        onChange(info) {
            if (info.file.status === 'done') {
                props.setFile({
                    name: info?.file?.name,
                    id: info?.file?.response?.data?.id
                })
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        }
    };

    const onSubmitForm = (values: any) => {
        form.resetFields()
        const data: any = {
            id: props?.data?.id,
            company_id: authData?.company?.id,
            description: values?.description,
			type: values?.type,
            date: values?.date,
        }
		if(values?.amount){
			data.amount= values?.amount
		}
        if (props.fileData?.id) {
            data.attachment_id = props.fileData?.id
        }

        attachedTimesheetUpdate({
            variables: {
                input: data
            }
        })
    };

    const onCancel = () => {
        props.setVisibility(!props.visibility)
    }

    const normFile = (e: any) => {
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

	const handleTypeChange = (value:any) =>{
		setOption(value)
	}
	let defaultValues:any = useMemo(() => {}, []);
	 defaultValues = {
			description: attachedTimesheet?.description ?? '',
			file: attachedTimesheet?.attachments?.url ?? '',
			type:attachedTimesheet?.type ?? '',
			amount:attachedTimesheet?.amount ?? '',
			date: moment(
				attachedTimesheet?.date ?? "2022-01-01T00:00:00.410Z",
				dateFormat
			  ), 
		}

	useEffect(() => {
		form.setFieldsValue(defaultValues)
	   }, [form, defaultValues])

    return (
        <Modal
            centered
            visible={props?.visibility}
            className={styles['attach-timesheet']}
            closeIcon={[
                <div onClick={() => props?.setVisibility(false)} key={1}>
                    <span className={styles["close-icon-div"]}>
                        <CloseOutlined />
                    </span>
                </div>,
            ]}
            width={869}
            footer={null}>
            <div className={styles["modal-body"]}>
                <div className={styles['title-div']}>
                    <span className={styles["title"]}>
                        Edit Attachment
                    </span>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    name="payrate-form"
                    onFinish={onSubmitForm}
                    initialValues={defaultValues}
                >
                    <Row gutter={[24, 0]}>
					<Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}>
                            <Form.Item
                                label="Attachment Type"
                                name="type"
                                rules={[{
                                    required: true,
                                    message: 'Please enter attachment type'
                                }]}                                >
                              <Select placeholder='Select attachment type' onChange={handleTypeChange}>
								{attachment_type.map((type,index)=>(
									<Option value={type.value} key={index}>{type.name}</Option>
								))}
							  </Select>
                            </Form.Item>
                        </Col>
					{(attachedTimesheet?.type === AttachmentType.Attachment || option === AttachmentType.Attachment) && (
						<>
							<Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={12}>
                            <Form.Item
                                label="Amount"
                                name="amount"
                            >
                                <InputNumber
									type='number'
                                    placeholder="Enter amount"
                                    autoComplete="off"
                                    style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
						<Col
                            xs={24}
                            sm={24}
                            md={12}
                            lg={12}>
                            <Form.Item
                                label="Date"
                                name="date" >
                                <DatePicker placeholder="Please select date"/>
                            </Form.Item>
                        </Col>
					</>
					)}
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}>
                            <Form.Item
                                label="Description"
                                name="description">
                                <Input
                                    placeholder="Enter description of the Timesheet"
                                    autoComplete="off"
                                    style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item
                                name="upload"
                                label="Attach Receipt"
                                valuePropName="filelist"
                                getValueFromEvent={normFile}
                                style={{ position: "relative" }}
                            >
                                <div className={styles["upload-file"]}>
                                    <div>
                                        <span>
                                            {props.fileData?.name
                                                ? props.fileData?.name
                                                : " Attach your files here"}
                                        </span>
                                    </div>
                                    <div className={styles["browse-file"]}>
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
                                        onClick={onCancel}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit">
                                        Continue
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    )
};

export default EditAttachedTimesheet;