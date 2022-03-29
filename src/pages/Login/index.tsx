import { useNavigate, useParams } from 'react-router-dom';
import { Layout, Row, Col, Form, Input, Button, message, Typography } from 'antd';

import constants from '../../config/constants';
import routes from '../../config/routes';
import { authVar } from '../../App/link';

import logo from '../../assets/images/main_logo.svg';
import highFiveImg from '../../assets/images/High_five.svg';
import styles from './style.module.scss';
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../utils/error";

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

const Login = () => {
  const navigate = useNavigate();
  const [Login] = useMutation(LOGIN);
  let { role } = useParams();

  const handleSubmit = (values: any) => {
    let formData = role === 'admin' ?
      {email: values.email,
        password: values.password} :
      {email: values.email,
        password: values.password,
        companyCode: values.code}
    Login({
      variables: {
        input: formData
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response?.errors))
      } 

      message.success(`LoggedIn successfully!`)
      const loginData = response?.data?.Login;
      const roles = loginData?.roles?.map((role: any) => role?.name);

      authVar({
        token: loginData?.token,
        user: {
          id: loginData?.id,
          roles,
        },
        company: {
          id: loginData?.company?.id,
          code: loginData?.company?.companyCode
        },
        isLoggedIn: true,
      });

      if(roles.includes(constants.roles.SuperAdmin)) {
        navigate(routes.dashboard.routePath)
      } else if(roles.includes(constants.roles.CompanyAdmin)) {
        navigate(routes.company.routePath(loginData?.company?.companyCode));
      } else {
        navigate(routes.home.routePath);
      }
    })
  };

  return (
    <Layout>
      <Row style={{ minHeight: '100vh', background: '#FFFFFF' }} className={styles['login-row']}>
        <Col sm={24} xs={24} md={14} lg={13} className={styles['sign-in-form-col']}>
          <div className={styles['sign-in-content']}>
            <div className={styles['sign-in-logo']}>
              <img className={styles.logo} alt="logo" src={logo} />
            </div>
            <div className={styles['sign-in-header']}>
              <h1>Sign in</h1>
            </div>
            <br/>
            <div>
              <Form onFinish={handleSubmit} layout="vertical">
                {role !=='admin' &&
                <Form.Item label="Company Code" name="code" rules={[{required: role !== 'admin', message: 'Company Code is required'},]}>
                  <Input placeholder="Enter the company code" autoComplete="off"/>
                </Form.Item>}
                <Form.Item label="Email" name="email" rules={[{required: true, message: 'Email is required'},]}>
                  <Input placeholder="Email" autoComplete="off"/>
                </Form.Item>
                <Form.Item name="password" label="Password" rules={[{required: true, message: 'Password is required'},]}>
                  <Input type="password" placeholder="Password" autoComplete="off"/>
                </Form.Item>
                <Form.Item>
                  <div className={styles['forgot-password']}>
                    <Typography.Link href="#API">Forgot Password?</Typography.Link>
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
    </Layout>
  );
};

export default Login;

