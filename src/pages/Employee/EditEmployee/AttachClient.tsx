import React, {useState} from "react";
import { Card, Col, Form, message, Modal, Row, Input } from "antd";
import { ArrowLeftOutlined, CloseOutlined, LinkOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@apollo/client";
import { USER_CREATE } from "../NewEmployee";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import AddClientForm from "../../Client/NewClient/AddClientForm";
import constants from "../../../config/constants";

import routes from "../../../config/routes";
import styles from "../style.module.scss";


const AttachClient = () => {
  const navigate = useNavigate();
  const authData = authVar();
  const [form] = Form.useForm();
  const [UserCreate] = useMutation(USER_CREATE);
  const [visible, setVisible] = useState(false);

  const onSubmitForm = (values: any) => {
    message.loading({content: "Adding client in progress..", className: 'custom-message'}).then(() =>
      UserCreate({
        variables: {
          input: {
            email: values.email,
            phone: values.phone,
            firstName: values.firstName,
            lastName: values.lastName,
            status: values.status,
            company_id: authData?.company?.id,
            roles: [constants?.roles?.Client],
            address: {
              streetAddress: values.streetAddress,
              state: values.state,
              city: values.city,
              zipcode: values.zipcode
            }
          }
        }
      }).then((response) => {
        if (response.errors) {
          return notifyGraphqlError((response.errors))
        } else if (response?.data?.UserCreate) {
          navigate(-1)
          message.success({content: `Clients added successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError))
  }
  
  const cancelAddClient = () => {
    navigate(routes.employee.path(authData?.company?.code ? authData?.company?.code : ''))
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row style={{height: '122px'}}>
          <Col span={12} className={styles['employee-col']}>
            <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add Client</h1>
          </Col>
          <Col span={12} className={styles['add-existing-col']}>
            <h1 onClick={() => setVisible(true)}> &nbsp; Add Existing Client</h1>
          </Col>
        </Row>
        <AddClientForm onSubmitForm={onSubmitForm} btnText={'Add Client'} form={form} cancelAddClient={cancelAddClient}/>
      </Card>
      <Modal
        centered
        visible={visible}
        closeIcon={[
          <div onClick={() => setVisible(false)}>
              <span className={styles['close-icon-div']}>
                <CloseOutlined />
              </span>
          </div>
        ]}
        footer={[
          <div className={styles['modal-footer']}>

          </div>
        ]}
        width={869}>
        <div className={styles['modal-body']}>
          <div>
            <span className={styles['add-title']}>Add Existing Client</span>
          </div>
          <br/><br/>
          <div className={styles['add-body']}>
            <div className={styles['search-client']}>
              <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                <Input prefix={<SearchOutlined className="site-form-item-icon" />}
                       placeholder="Search for the Existing Client" />
              </Form.Item>
            </div>
            <div className={styles['list-client-card']}>
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={8}>
                  <div className={styles['client-col']}>
                    <b>Araniko College of Business and Technology</b>
                    <div>1245 Alpine Avenue</div>
                    <div>contact@aranikocollege.com</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8}>
                  <div className={styles['client-col']}>
                    <b>Araniko College of Business and Technology</b>
                    <div>1245 Alpine Avenue</div>
                    <div>contact@aranikocollege.com</div>
                  </div>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8}>
                  <div className={styles['client-col']}>
                    <b>Araniko College of Business and Technology</b>
                    <div>1245 Alpine Avenue</div>
                    <div>contact@aranikocollege.com</div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AttachClient;
