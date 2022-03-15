import { useNavigate } from 'react-router-dom';
import {Layout, Card, Row, Col, Form, Input, Button, message} from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import routes from '../../config/routes';
import { authVar } from '../../App/link';

import logo from '../../assets/images/logo.svg';
import logoContent from '../../assets/images/logo-01.svg';
import styles from './style.module.scss';
import {gql, useMutation} from "@apollo/client";
import {notifyGraphqlError} from "../../utils/error";

const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    Login(input: $input) {
        id
        token
    }
  }
`

const Login = () => {
  const navigate = useNavigate();
  const [Login] = useMutation(LOGIN);

  const handleSubmit = (values: any) => {
    Login({
      variables: {
        input: {
          email: values.email,
          password: values.password
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.Login) {
        message.success(`LoggedIn successfully!`).then(r => {});
        const loginData = authVar({
          token: response?.data?.Login?.token,
          user: {
            id: response?.data?.Login?.id,
            role: 'admin',
          },
          isLoggedIn: true,
        });
        localStorage.setItem('token', response?.data?.Login?.token);
        loginData.user.role === 'admin' ?  navigate(routes.dashboard.path) :  navigate(routes.home.path);
      }
    })
  };

  return (
    <Layout>
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Card>
            <div className={styles['signin-content']}>
              <div className={styles['signin-header']}>
                <img className={styles.logo} alt="logo" src={logo} />
                <img className={styles.logo} alt="logo-01" src={logoContent} />
                <h1>Sign in</h1>
              </div>
              <Form onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Email is required',
                    },
                  ]}
                >
                  <Input placeholder="Email" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    {
                      required: true,
                      message: 'Password is required',
                    },
                  ]}
                >
                  <Input.Password
                    type="password"
                    placeholder="Password"
                    iconRender={(visible: boolean) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item style={{ paddingTop: '1em' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className={styles['login-form-button']}
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Login;

