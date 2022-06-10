import { Row, Col, Form, Input, Button, message, Card } from 'antd';

import { useNavigate } from "react-router-dom";

import routes from "../../config/routes";
import { gql, useMutation } from "@apollo/client";

import { notifyGraphqlError } from "../../utils/error";
import resetImg from "../../assets/images/reset.svg";

import styles from '../ResetPassword/style.module.scss';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { ChangePasswordResponse, MutationChangePasswordArgs } from '../../interfaces/generated';
import { authVar } from '../../App/link';

const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    ChangePassword(input: $input){
    message
    }
  }
`

const ChangePassword = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const loggedInUser = authVar()
    const [changePassword] = useMutation<
        GraphQLResponse<'ChangePassword', ChangePasswordResponse>,
        MutationChangePasswordArgs
    >(CHANGE_PASSWORD, {
        onCompleted() {
            navigate(-1)
            form.resetFields();
            message.success(`New Password is changed successfully!`)
        },
        onError(err) {
            return notifyGraphqlError(err)
        }
    });

    const onFinish = (values: any) => {
        changePassword({
            variables: {
                input: {
                    user_id: loggedInUser?.user?.id as string,
                    oldPassword: values?.oldPassword,
                    newPassword: values?.newPassword,

                }
            }
        })
    }
    return (
        <div className={styles['main-div']}>
            <Card>
                <Row justify={"center"} className={styles['email-sent-message']}>
                    <Col className={styles['gutter-col']} xs={24} sm={20} md={12} lg={10} xl={10} style={{ textAlign: 'center' }}>
                        <div><img src={resetImg} alt="reset-password" /></div>
                        <br />
                        <strong>Set New Password</strong><br /><br />
                    </Col>
                </Row>
                <Row justify={"center"}>
                    <Col className="gutter-row" xs={24} sm={20} md={12} lg={10} xl={10} style={{ textAlign: 'center' }}>
                        <Form form={form} name="reset_password" onFinish={onFinish} layout="vertical">

                            <Form.Item
                                name="oldPassword"
                                label="Old Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your old password!',
                                    },
                                ]}
                                hasFeedback>
                                <Input type="password" placeholder="Password" autoComplete="off" />
                            </Form.Item>


                            <Form.Item
                                name="newPassword"
                                label="New Password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input new password!',
                                    },
                                ]}
                                hasFeedback>
                                <Input type="password" placeholder="Password" autoComplete="off" />
                            </Form.Item>

                            <Form.Item
                                name="confirm"
                                label="Confirm New Password"
                                dependencies={['password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please confirm your password!',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('newPassword') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                        },
                                    }),
                                ]}>
                                <Input type="password" placeholder="Confirm Password" autoComplete="off" />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    disabled={
                                        !form.isFieldsTouched(true)
                                         ||
                                        !!form.getFieldsError().filter(({ errors }) => errors.length).length
                                    }>
                                    Change Password
                                </Button> <br /><br />
                                <p onClick={() => navigate(routes?.home?.path)} className={styles.dashboardLink}>Go to Dashboard</p>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default ChangePassword;
