import { Layout, Row, Col, Form, Input, Button, message, Modal } from 'antd';
import { useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';

import { authVar } from '../../App/link';
import { gql, useMutation } from "@apollo/client";

import { notifyGraphqlError } from "../../utils/error";
import constants from '../../config/constants';
import routes from '../../config/routes';

import logo from '../../assets/images/main_logo.svg';
import highFiveImg from '../../assets/images/High_five.svg';
import { LoginResponse } from "../../interfaces/generated";

import styles from './style.module.scss';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    Login(input: $input) {
        id
        token
        refreshToken
        company {
          id
          companyCode
        }
        roles {
          id
          name
        }
    }
  }
`

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    ForgotPassword(input: $input)
  }
`

interface LoginResponseData {
  Login: LoginResponse
}

const Login = () => {
  let { role } = useParams();
  const [form] = Form.useForm();
  const [forgetForm] = Form.useForm();
  const navigate = useNavigate();
  const [Login] = useMutation<LoginResponseData>(LOGIN);
  const [ForgotPassword] = useMutation(FORGOT_PASSWORD);
  const [modalVisible, setModalVisible] = useState<boolean>(false);


  const handleSubmit = (values: any) => {
    let formData = role === 'admin' ?
      {
        email: values.email,
        password: values.password
      } :
      {
        email: values.email,
        password: values.password,
        companyCode: values.code
      }
    message.loading("Please wait, logging in progress..", 1.5).then(() =>
      Login({
        variables: {
          input: formData
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response?.errors))
        }
        if (response?.data) {
          message.success({ content: `LoggedIn successfully!`, className: 'custom-message' })
          const loginData = response?.data?.Login;
          const roles = loginData?.roles?.map((role: any) => role?.name);

          authVar({
            token: loginData?.token,
            user: {
              id: loginData?.id,
              roles,
            },
            company: {
              id: loginData?.company?.id ?? '',
              code: loginData?.company?.companyCode ?? ''
            },
            isLoggedIn: true,
          });

          if (roles.includes(constants.roles.SuperAdmin)) {
            navigate(routes.dashboard.path)
          } else if (roles.includes(constants.roles.CompanyAdmin)) {
            navigate(routes.company.path(loginData?.company?.companyCode));
          } else {
            navigate(routes.home.path);
          }
          message.destroy()
        }
      }).catch(notifyGraphqlError))
  };

  const onSubmitForgotPasswordForm = (values: any) => {
    let formData = role === 'admin' ?
      {
        email: values?.email,
        userType: constants?.userType?.SystemAdmin,
        companyCode: null
      } :
      {
        email: values?.email,
        userType: constants?.userType?.Company,
        companyCode: values?.code
      }
    message.loading("Sending reset link to user's email..").then(() =>
      ForgotPassword({
        variables: {
          input: formData
        }
      }).then((response) => {
        if (response.errors) {
          console.log('Forget Password Error');
          return notifyGraphqlError((response?.errors))
        }
        setModalVisible(false)
        forgetForm.resetFields();
        message.success(`If account ${values?.email} exists,
       reset password link is successfully sent to the email!`)
      }).catch(notifyGraphqlError))
  }

  return (
    <Layout>
      <Row className={styles['login-row']}>
        <Col sm={24} xs={24} md={14} lg={13} className={styles['sign-in-form-col']}>
          <div className={styles['sign-in-content']}>
            <div className={styles['sign-in-logo']}>
              <img className={styles.logo} alt="logo" src={logo} />
            </div>
            <div className={styles['sign-in-header']}>
              <h1>Sign in {role === 'admin' ? 'as Admin' : ''}</h1>
            </div>
            <br />
            <div>
              <Form
                form={form}
                onFinish={handleSubmit}
                layout="vertical">

                {role !== 'admin' &&
                  <Form.Item
                    label="Company Code"
                    name="code"
                    rules={[{
                      required: role !== 'admin',
                      message: 'Company Code is required'
                    }, {
                      max: 10,
                      message: "Code should be less than 10 character"
                    }]}>
                    <Input placeholder="Enter the company code" autoComplete="off" />
                  </Form.Item>}

                <Form.Item
                  label="Email"
                  name="email"
                  rules={[{
                    type: 'email',
                    message: 'The input is not valid E-mail!'
                  }, {
                    required: true,
                    message: 'Please enter your E-mail!'
                  }]}>
                  <Input placeholder="Email" autoComplete="off" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{
                    required: true,
                    message: 'Password is required'
                  }]}>
                  <Input type="password" placeholder="Password" autoComplete="off" />
                </Form.Item>

                <Form.Item>
                  <div
                    className={styles['forgot-password']}
                    onClick={() => setModalVisible(true)}>
                    <p>Forgot Password?</p>
                  </div>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" className={styles['login-form-button']}>Login</Button>
                </Form.Item>

              </Form>
            </div>
          </div>
        </Col>
        <Col sm={24} xs={0} md={10} lg={11} className={styles['image-col']}>
          <img className={styles.highFiveImage} alt="highFiveImg" src={highFiveImg} />
        </Col>
      </Row>
      <Modal
        centered
        width={900}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}>
        <div className={styles['modal-header']}>
          Forgot Password
        </div>
        <div className={styles['forget-form']}>
          <div className={styles['modal-subtitle']}>
            Please fill in the details to verify your identity.
          </div>
          <br /><br />
          <Form
            form={forgetForm}
            layout="vertical"
            onFinish={onSubmitForgotPasswordForm}>
            {role !== 'admin' &&
              <Form.Item
                label="Company Code"
                name="code"
                rules={[{
                  required: role !== 'admin',
                  message: 'Company Code is required'
                }, {
                  max: 10,
                  message: "Code should be less than 10 character"
                }]}>
                <Input placeholder="Enter Company Code" autoComplete="off" />
              </Form.Item>}

            <Form.Item
              label="Email Address"
              name="email"
              rules={[{
                type: 'email',
                message: 'The input is not valid E-mail!'
              }, {
                required: true,
                message: 'Please enter your E-mail!'
              }]}>
              <Input placeholder="Enter Email Address" autoComplete="off" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit">Proceed</Button><br /><br />
              <Button type="default" onClick={() => setModalVisible(false)}>Go to Login</Button>
            </Form.Item>

          </Form>
        </div>
      </Modal>
    </Layout>
  );
};

export default Login;

