import React from "react";
import { Card, Col, Form, message, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import ClientForm from "./ClientForm";
import { Client, MutationClientCreateArgs } from "../../../interfaces/generated";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";


export const CLIENT_CREATE = gql`
    mutation ClientCreate($input: ClientCreateInput!) {
        ClientCreate(input: $input) {
            id
            name
            email
            invoicingEmail
        }
    }
`

const NewClient = () => {
  const authData = authVar();
  const navigate = useNavigate();
  const [clientCreate] = useMutation<
    GraphQLResponse<'CleintCreate', Client>,
    MutationClientCreateArgs
  >(CLIENT_CREATE);
  const [form] = Form.useForm();

  const cancelAddClient = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
    let key = 'message';
    message.loading({ content: "New client adding in progress..", key, className: 'custom-message' })
    clientCreate({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          invoicingEmail: values.invoiceEmail,
          company_id: authData?.company?.id as string,
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
      } else if (response?.data) {
        navigate(-1)
        message.success({ content: `New Client is created successfully!`, key, className: 'custom-message' });
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles['client-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Add New Client
            </h1>
          </Col>
        </Row>
        <ClientForm
          onSubmitForm={onSubmitForm}
          btnText={'Create Client'}
          form={form}
          cancelAddClient={cancelAddClient} />
      </Card>
    </div>
  )
}

export default NewClient;
