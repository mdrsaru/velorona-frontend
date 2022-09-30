import moment from 'moment';
import { useMemo } from 'react';
import { Card, Col, Form, message, Row } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { gql, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import { authVar } from "../../../App/link";
import {
  Client,
  ClientPagingResult,
  MutationClientUpdateArgs,
  QueryClientArgs,
  ClientUpdateInput,
  InvoiceSchedule,
} from "../../../interfaces/generated";
import { CLIENT } from "../index";

import ClientForm from '../NewClient/ClientForm';

import styles from "../style.module.scss";

export const CLIENT_UPDATE = gql`
    mutation ClientUpdate($input: ClientUpdateInput!) {
      ClientUpdate(input: $input) {
        id
        name
        email
        invoicingEmail
        scheduleStartDate
        address {
          id
          streetAddress
        }
      }
    }

`

const EditClient = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();
  const [clientUpdate, { loading: updatingClient }] = useMutation<
    GraphQLResponse<'ClientUpdate', Client>,
    MutationClientUpdateArgs
  >(CLIENT_UPDATE);
  const [form] = Form.useForm();

  const cancelAddClient = () => {
    navigate(-1);
  }
  const { data: clientData } = useQuery<
    GraphQLResponse<'Client', ClientPagingResult>,
    QueryClientArgs
  >
    (CLIENT, {
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id as string,
            id: params?.cid
          }
        }
      }
    })

  const onSubmitForm = (values: any) => {
    let key = 'message';

    const input: ClientUpdateInput = {
      id: params?.cid as string,
      name: values.name,
      company_id: authData?.company?.id as string,
      phone: values?.phone,
      invoiceSchedule: values.invoiceSchedule,
      invoicingEmail:values.invoicingEmail,
      invoice_payment_config_id: values.invoice_payment_config_id,
      address: {
        country: values?.country,
        streetAddress: values.streetAddress,
        state: values.state,
        city: values.city,
        zipcode: values.zipcode
      }
    };

    if([InvoiceSchedule.Biweekly, InvoiceSchedule.Custom].includes(values.invoiceSchedule)) {
      input['scheduleStartDate'] = values.scheduleStartDate ? moment(values.scheduleStartDate).format('YYYY-MM-DD') : null;
    } else {
      input['scheduleStartDate'] = null;
    }

    clientUpdate({
      variables: {
        input,
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data) {
        navigate(-1)
        message.success({
          content: `Client is updated successfully!`,
          key,
          className: 'custom-message'
        });
      }
    }).catch(notifyGraphqlError)
  }

  const client = clientData?.Client?.data?.[0]

  const initialValues = useMemo(() => {
    const client = clientData?.Client?.data?.[0]

    const values: any = {
      email: client?.email ?? '',
      name: client?.name ?? '',
      country: client?.address?.country ?? '',
      streetAddress: client?.address?.streetAddress ?? '',
      state: client?.address?.state ?? '',
      city: client?.address?.city ?? '',
      zipcode: client?.address?.zipcode ?? '',
      phone: client?.phone ?? '',
      invoicingEmail: client?.invoicingEmail ?? '',
      invoiceSchedule: client?.invoiceSchedule,
      invoice_payment_config_id: client?.invoice_payment_config_id,
    };

    if(
      [InvoiceSchedule.Biweekly, InvoiceSchedule.Custom].includes(client?.invoiceSchedule as InvoiceSchedule) &&
      client?.scheduleStartDate
    ) {
      values.scheduleStartDate = moment(client.scheduleStartDate);
    }

    return values;
  }, [clientData?.Client?.data])

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
        <Row>
          <Col
            span={12}
            className={styles['client-col']}>
            <h1>
              <ArrowLeftOutlined
                onClick={() => navigate(-1)} />
              &nbsp; Edit Client
            </h1>
          </Col>
        </Row>
        <div>
          {
            client && (
              <ClientForm
                id={client?.id}
                loading={updatingClient}
                form={form}
                btnText="Update Client"
                onSubmitForm={onSubmitForm}
                cancelAddClient={cancelAddClient}
                initialValues={initialValues}
                createdAt={client?.createdAt}
              />
            )
          }
        </div>
      </Card>
    </div>
  )
}

export default EditClient;
