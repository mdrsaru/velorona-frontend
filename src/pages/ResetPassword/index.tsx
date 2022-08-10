import {Row, Col, Form, Input, Button, message, Modal} from 'antd';

import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import routes from "../../config/routes";
import { gql, useMutation } from "@apollo/client";

import { notifyGraphqlError } from "../../utils/error";
import resetImg from "../../assets/images/reset.svg";

import successImg from "../../assets/images/success.svg";
import styles from './style.module.scss';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { MutationResetPasswordArgs } from '../../interfaces/generated';

const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    ResetPassword(input: $input)
  }
`

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [ searchParams ] = useSearchParams();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [resetPassword] = useMutation<
  GraphQLResponse<'ResetPassword', string>,
  MutationResetPasswordArgs
  >(RESET_PASSWORD);

  const onFinish = (values: any) => {
    resetPassword({
      variables: {
        input: {
          password: values?.password,
          token: searchParams.get("token") as string
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response?.errors))
      }
      navigate(routes?.login?.path)
      form.resetFields();
      setModalVisible(true);
      message.success(`New Password is changed successfully!`)
    }).catch(notifyGraphqlError)
  }
  return (
    <div className={styles['main-div']}>
      <Row justify={"center"} className={styles['email-sent-message']}>
        <Col className={styles['gutter-col']} xs={24} sm={20} md={12} lg={10} xl={10} style={{textAlign: 'center'}}>
          <div><img src={resetImg} alt="reset-password"/></div>
          <br/>
          <strong>Set New Password</strong><br/><br/>
        </Col>
      </Row>
      <Row justify={"center"}>
        <Col className="gutter-row" xs={24} sm={20} md={12} lg={10} xl={10} style={{textAlign: 'center'}}>
          <Form form={form} name="reset_password" onFinish={onFinish} layout="vertical">
            <Form.Item
              name="password"
              label="Password"
              rules={[
                {
                  required: true,
                  message: 'Please input your password!',
                },
              ]}
              hasFeedback>
              <Input type="password" placeholder="Password" autoComplete="off"/>
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
                ({getFieldValue}) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                  },
                }),
              ]}>
              <Input type="password" placeholder="Confirm Password" autoComplete="off"/>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                disabled={
                  !form.isFieldsTouched(true) ||
                  !!form.getFieldsError().filter(({errors}) => errors.length).length
                }>
                Reset Password
              </Button> <br/><br/>
              <Button type="default" onClick={() => navigate(routes?.login?.path)}>Go to Login</Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <Modal
        centered
        width={900}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}>
        <Row justify={"center"}>
          <Col className="gutter-row" xs={24} sm={20} md={12} lg={10} xl={10} style={{textAlign: 'center'}}>
            <div><img src={successImg} alt="success-reset-password"/></div>
            <br/>
            <strong>Password Reset Successfully!</strong><br/><br/>
            <p className={styles['reset-success']}>
              Your Password has been reset successfully.Please proceed to login.
            </p>
            <br/><br/>
            <p className={styles['go-to-login']} onClick={() =>  navigate(routes?.login?.path)}>Go to Login</p>
          </Col>
        </Row>
      </Modal>
    </div>
  )
}

export default ResetPassword;
