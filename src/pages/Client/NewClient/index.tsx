import React from "react";
import { Card, Col, Form, message, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@apollo/client";
import { USER_CREATE } from "../../Employee/NewEmployee";
import {notifyGraphqlError} from "../../../utils/error";
import {authVar} from "../../../App/link";

import constants from "../../../config/constants";
import AddClientForm from "./AddClientForm";

import styles from "../style.module.scss";


const NewClient = () => {
  const authData = authVar();
  const navigate = useNavigate();
  const [UserCreate] = useMutation(USER_CREATE);
  const [form] = Form.useForm();
  
  const cancelAddClient = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
    message.loading({content: "New client adding in progress..", className: 'custom-message'}).then(() =>
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
          message.success({content: `New Client is created successfully!`, className: 'custom-message'});
        }
      }).catch(notifyGraphqlError))
  }

  return (
    <div className={styles['main-div']}>
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['client-col']}>
              <h1><ArrowLeftOutlined onClick={() => navigate(-1)}/> &nbsp; Add New Client</h1>
            </Col>
          </Row>
          <AddClientForm onSubmitForm={onSubmitForm} btnText={'Create Client'} form={form} cancelAddClient={cancelAddClient}/>
        </Card>
      </div>
  )
}

export default NewClient;
