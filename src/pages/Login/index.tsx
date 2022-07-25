import { Layout, Row, Col, Form, Input, Button, message, Modal } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { authVar } from '../../App/link';
import { gql, useMutation } from '@apollo/client';

import { notifyGraphqlError } from '../../utils/error';
import constants from '../../config/constants';
import routes from '../../config/routes';

import logo from '../../assets/images/logo-content.svg';
import highFiveImg from '../../assets/images/High_five.svg';
import { LoginResponse, MutationLoginArgs } from '../../interfaces/generated';

import styles from './style.module.scss';
import { GraphQLResponse } from '../../interfaces/graphql.interface';

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    Login(input: $input) {
        id
        token
        refreshToken
        type
        company {
          id
          companyCode
          name
          logo{
          id 
          name 
          url 
          }
        }
        roles {
          id
          name
        }
        fullName
        avatar{
          id
          url
        }
    }
  }
`

const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($input: ForgotPasswordInput!) {
    ForgotPassword(input: $input)
  }
`

const Login = () => {
  let key = 'login'
  let { role } = useParams();
  const [form] = Form.useForm();
  const [forgetForm] = Form.useForm();
  const navigate = useNavigate();
  const [login] = useMutation<
    GraphQLResponse<'Login', LoginResponse>,
    MutationLoginArgs
  >(LOGIN, {
    onCompleted: (response: any) => {
      message.success({ content: `LoggedIn successfully!`, key, className: 'custom-message' })
      const loginData = response?.Login;
      const roles = loginData?.roles?.map((role: any) => role?.name);
      authVar({
        token: loginData?.token,
        user: {
          id: loginData?.id,
          roles,
          type: loginData?.type,
        },
        company: {
          id: loginData?.company?.id ?? '',
          code: loginData?.company?.companyCode ?? '',
          name:loginData?.company?.name ?? '',
          logo:{
          id: loginData?.company?.logo?.id ?? '',
          name: loginData?.company?.logo?.name ?? '',
          url: loginData?.company?.logo?.url ?? '',      
          }
        },
        fullName: loginData?.fullName,
        avatar: {
          id: loginData?.avatar?.id ?? '',
          url: loginData?.avatar?.url ?? ''
        },
        isLoggedIn: true,
      });

      if (roles.includes(constants.roles.SuperAdmin)) {
        navigate(routes.dashboard.path)
      } else if (roles.includes(constants.roles.CompanyAdmin)) {
        navigate(routes.company.path(loginData?.company?.companyCode));
      } else if (roles.includes(constants.roles.Employee)) {
        navigate(routes.company.path(loginData?.company?.companyCode));
      } else if (roles.includes(constants.roles.TaskManager)) {
        navigate(routes.company.path(loginData?.company?.companyCode));
      } 
      else {
        navigate(routes.home.path);
      }
    }
  });
  const [forgotPassword] = useMutation(FORGOT_PASSWORD, {
    onCompleted: (response: any) => {
      setModalVisible(false)
      forgetForm.resetFields();
      message.success({
        content: `If account exists, reset password link is successfully sent to the email!`,
        key,
        className: 'custom-message'
      })
    }
  });
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const handleSubmit = (values: any) => {
    let formData: {
      email: '',
      password: '',
      companyCode?: ''
    } = {
      email: values.email,
      password: values.password
    }
    if (role !== 'admin') {
      formData['companyCode'] = values.code
    }
    login({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response?.errors), key)
      };
    }).catch(notifyGraphqlError)
  };

  const onSubmitForgotPasswordForm = (values: any) => {
    let key = 'forgotPassword'
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
    message.loading({
      content: `Sending reset link to user's email..`,
      key,
      className: 'custom-message'
    });
    forgotPassword({
      variables: {
        input: formData
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response?.errors), key)
      }
    }).catch(notifyGraphqlError)
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
                  <Button type="primary" htmlType="submit" className={styles['login-form-button']}>
                    Login
                  </Button>
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
        onCancel={() => {
          setModalVisible(false)
          forgetForm.resetFields()
        }}
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

