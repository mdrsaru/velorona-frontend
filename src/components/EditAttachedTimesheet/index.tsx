import { Button, Col, Form, Input, message, Modal, Row, Space, Upload, UploadProps } from "antd";
import { authVar } from "../../App/link";
import { CloseOutlined } from '@ant-design/icons';


import constants from "../../config/constants";

import styles from '../AddAttachedTimesheet/styles.module.scss'
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import { GraphQLResponse } from "../../interfaces/graphql.interface";
import { AttachedTimesheet, MutationAttachedTimesheetUpdateArgs } from "../../interfaces/generated";
import { notifyGraphqlError } from "../../utils/error";
import { ATTACHED_TIMESHEET } from "../../pages/Timesheet/DetailTimesheet";
interface IProps {
    visibility: boolean;
    setVisibility: any;
    data?: any;
}


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

const EditAttachedTimesheet = (props: IProps) => {
    const authData = authVar()

    const attachedTimesheet = props?.data;
    const [form] = Form.useForm();

    const [fileData, setFile] = useState({
        id: null,
        name: "",
    });
    console.log(props?.data)
    const [getAttachedTimesheet] = useLazyQuery(ATTACHED_TIMESHEET, {
        fetchPolicy: "network-only",
        nextFetchPolicy: "cache-first",
        variables: {
            input: {
                query: {
                    company_id: authData?.company?.id,
                    created_by: authData?.user?.id as string,
                    timesheet_id: props?.data?.timesheet?.id

                },
                paging: {
                    order: ['updatedAt:DESC']
                }
            }
        }
    })

    const [attachedTimesheetUpdate] = useMutation<GraphQLResponse<'AttachedTimesheetUpdate', AttachedTimesheet>, MutationAttachedTimesheetUpdateArgs>(ATTACH_TIMESHEET_UPDATE, {

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
            id: props?.data?.id,
            company_id: authData?.company?.id,
            description: values?.description,
        }
        if (fileData?.id) {
            data.attachment_id = fileData?.id
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
                        Edit Approved Timesheet
                    </span>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    name="payrate-form"
                    onFinish={onSubmitForm}
                    initialValues={{
                        description: attachedTimesheet?.description ?? '',
                        file: attachedTimesheet?.attachments?.url ?? '',
                    }}
                >
                    <Row gutter={[24, 0]}>
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

export default EditAttachedTimesheet;