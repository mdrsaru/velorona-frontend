import { Button, Col, Form, Input, message, Modal, Row, Space, Upload, UploadProps } from "antd";
import { authVar } from "../../App/link";
import { CloseOutlined } from '@ant-design/icons';


import constants from "../../config/constants";

import styles from './styles.module.scss'
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { AttachedTimesheet, MutationAttachedTimesheetCreateArgs } from "../../interfaces/generated";
import { notifyGraphqlError } from "../../utils/error";
import { ATTACHED_TIMESHEET } from "../../pages/Timesheet/DetailTimesheet";

interface IProps {
    visibility: boolean;
    setVisibility: any;
    data?: any;
    timesheet_id: string;
}


export const ATTACH_TIMESHEET_CREATE = gql`
    mutation AttachedTimesheetCreate($input: AttachedTimesheetCreateInput!) {
      AttachedTimesheetCreate(input: $input) {
        id
        description
        createdAt
        attachments{
            id 
            name 
            url 
        }
        timesheet{
        id 
        duration 
        }
      }
    }
  `;

const AttachNewTimesheetModal = (props: IProps) => {
    const authData = authVar()

    const [form] = Form.useForm();

    const [fileData, setFile] = useState({
        id: null,
        name: "",
    });

    const [getAttachedTimesheet] = useLazyQuery(ATTACHED_TIMESHEET, {
        fetchPolicy: "network-only",
        nextFetchPolicy: "cache-first",
        variables: {
            input: {
                query: {
                    company_id: authData?.company?.id,
                    created_by: authData?.user?.id as string,
                    timesheet_id:props?.timesheet_id as string,
                },
                paging: {
                    order: ['updatedAt:DESC']
                }
            }
        }
    })

    const [createAttachedTimesheet] = useMutation<GraphQLResponse<'AttachedTimesheetCreate', AttachedTimesheet>, MutationAttachedTimesheetCreateArgs>(ATTACH_TIMESHEET_CREATE, {

        onCompleted() {
            message.success({
                content: `New attached timesheet is added successfully!`,
                className: "custom-message",
            });
            getAttachedTimesheet({
                variables: {
                    input: {
                        query: {
                            company_id: authData?.company?.id as string,
                            created_by: authData?.user?.id as string,
                            timesheet_id:props?.timesheet_id as string,
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
                setFile({
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
            company_id: authData?.company?.id,
            description: values?.description,
            timesheet_id: props?.timesheet_id,
        }
        if (fileData?.id) {
            data.attachment_id = fileData?.id
        }

        createAttachedTimesheet({
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
                        Attach Approved Timesheet
                    </span>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    name="payrate-form"
                    onFinish={onSubmitForm}>
                    <Row gutter={[24, 0]}>
                        <Col
                            xs={24}
                            sm={24}
                            md={24}
                            lg={24}>
                            <Form.Item
                                label="Description"
                                name="description"
                                rules={[{
                                    required: true,
                                    message: 'Please enter Description'
                                }]}                                >
                                <Input
                                    placeholder="Enter description of the Timesheet"
                                    autoComplete="off"
                                    style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>

                        <Col xs={24} sm={24} md={24} lg={24}>
                            <Form.Item
                                name="upload"
                                label="Attachment"
                                valuePropName="filelist"
                                getValueFromEvent={normFile}
                                style={{ position: "relative" }}
                                  
                            >
                                <div className={styles["upload-file"]}>
                                    <div>
                                        <span>
                                            {fileData?.name
                                                ? fileData?.name
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

export default AttachNewTimesheetModal;