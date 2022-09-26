import moment from 'moment';
import { Card, Col, Form, message, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";

import ClientForm from "./ClientForm";
import { Client, MutationClientCreateArgs, ClientCreateInput } from "../../../interfaces/generated";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";


export const CLIENT_CREATE = gql`
    mutation ClientCreate($input: ClientCreateInput!) {
        ClientCreate(input: $input) {
            id
            name
            email
            invoicingEmail
            biweeklyStartDate
        }
    }
`

const NewClient = () => {
  const authData = authVar();
  const navigate = useNavigate();
  const [clientCreate, { loading: creatingClient }] = useMutation<
    GraphQLResponse<'CleintCreate', Client>,
    MutationClientCreateArgs
  >(CLIENT_CREATE);
  const [form] = Form.useForm();

  const cancelAddClient = () => {
    navigate(-1);
  }

  const onSubmitForm = (values: any) => {
    let key = 'message';
    const input: ClientCreateInput = {
      name: values.name,
      email: values.email,
      invoicingEmail: values.invoicingEmail,
      company_id: authData?.company?.id as string,
      phone:values?.phone,
      invoiceSchedule: values.invoiceSchedule,
      invoice_payment_config_id: values.invoice_payment_config_id,
      address: {
        country:values.country,
        streetAddress: values.streetAddress,
        state: values.state,
        city: values.city,
        zipcode: values.zipcode
      }
    }

    if(values.invoiceSchedule === 'Biweekly') {
      input['biweeklyStartDate'] = values.biweeklyStartDate ? moment(values.biweeklyStartDate).format('YYYY-MM-DD') : null;
    } else {
      input['biweeklyStartDate'] = null;
    }

    clientCreate({
      variables: {
        input,
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
          loading={creatingClient}
          onSubmitForm={onSubmitForm}
          btnText={'Add Client'}
          form={form}
          cancelAddClient={cancelAddClient} />
      </Card>
    </div>
  )
}

export default NewClient;
