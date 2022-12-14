import React, { useEffect, useState } from "react";
import { Card, Col, Form, message, Modal, Row, Input, Button, Space, Radio, Skeleton } from "antd";
import { ArrowLeftOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import debounce from 'lodash.debounce';
import { authVar } from "../../../App/link";

import ClientForm from "../../Client/NewClient/ClientForm";
import routes from "../../../config/routes";
import { CLIENT_CREATE } from "../../Client/NewClient";
import { CLIENT } from "../../Client";

import styles from "../style.module.scss";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { Client, ClientPagingResult, MutationClientCreateArgs, MutationUserClientAssociateArgs, QueryClientArgs, QueryUserClientArgs, UserClient, UserClientPagingResult } from "../../../interfaces/generated";
import { USERCLIENT } from "../DetailEmployee";

export const ASSOCIATE_USER_WITH_CLIENT = gql`
    mutation UserClientAssociate($input: UserClientAssociateInput!) {
        UserClientAssociate(input: $input) {
            status
            user {
                id
                fullName
                activeClient {
                    id
                    name
                }
            }
            client {
                id
                name
            }
        }
    }
`


const AttachClient = () => {
  let params = useParams();
  const navigate = useNavigate();
  const authData = authVar();
  const [form] = Form.useForm();
  const [associateClient] = useMutation<
    GraphQLResponse<'UserClientAssociate', UserClient>,
    MutationUserClientAssociateArgs
  >(ASSOCIATE_USER_WITH_CLIENT);

  const [clientCreate, { loading: creatingClient }] = useMutation<
    GraphQLResponse<'ClientCreate', Client>,
    MutationClientCreateArgs
  >(CLIENT_CREATE);

  const [visible, setVisible] = useState(false);
  const [searchClients, { loading, data: searchClientData }] = useLazyQuery(
    CLIENT,
    {
      fetchPolicy: "network-only",
      variables: {
        input: {
          query: {
            search: '',
            company_id: authData?.company?.id,
          }
        }
      }
    }
  );

  const { data: clientData } = useQuery<
  GraphQLResponse<'Client', ClientPagingResult>,
  QueryClientArgs
  >(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: authData?.company?.id as string
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const { data: userClientData } = useQuery<
    GraphQLResponse<'UserClient', UserClientPagingResult>,
    QueryUserClientArgs
  >(USERCLIENT, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        query: {
          user_id: params?.eid,
        },
        paging:{
          order: ['updatedAt:DESC']
        }
      },
    },
  });

  const [client, setClient] = useState<string>(userClientData?.UserClient?.data?.[0]?.client_id ?? '');

  const inputChangeSearch = debounce((e: any) => {
    searchClients({
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id,
            search: e.target.value
          }
        }
      }
    })
  }, 500);

  useEffect(() => {
    searchClients({
      variables: {
        input: {
          query: {
            company_id: authData?.company?.id,
            search: '',
          }
        }
      }
    })
  }, [authData?.company?.id, searchClients])

  const onSubmitForm = (values: any) => {
    let key = 'client';
    clientCreate({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          invoicingEmail: values.invoicingEmail,
          company_id: authData?.company?.id as string,
          phone:values.phone,
          invoiceSchedule: values.invoiceSchedule,
          invoice_payment_config_id: values.invoice_payment_config_id,
          address: {
            country : values.country,
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
      } else if (response?.data?.ClientCreate) {
        associateClient({
          variables: {
            input: {
              user_id: params?.eid as string,
              client_id: response?.data?.ClientCreate?.id as string,
              company_id: authData?.company?.id as string
            }
          }
        }).then((response) => {
          if (response.errors) {
            return notifyGraphqlError((response.errors))
          } else if (response?.data?.UserClientAssociate) {
            message.success(`Client is associated with employee successfully!`).then(r => { });
            navigate(routes.user.path(authData?.company?.code ?? ''));
          }
        }).catch(notifyGraphqlError)
        navigate(routes.user.path(authData?.company?.code ? authData?.company?.code : ''));
        message.success({ content: `Client updated to new employee successfully!`, key, className: 'custom-message' });
      }
    }).catch(notifyGraphqlError)
  }

  const cancelAddClient = () => {
    navigate(routes.user.path(authData?.company?.code ? authData?.company?.code : ''))
  }

  const onChangeClient = (event: any) => {
    setClient(event?.target.value)
  }

  const addClientToEmployee = () => {

    associateClient({
      variables: {
        input: {
          user_id: params?.eid as string,
          client_id: client ? client : clientData?.Client?.data[0]?.id as string,
          company_id: authData?.company?.id as string
        }
      }
    }).then((response) => {
      if (response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.UserClientAssociate) {
        message.success(`Client is associated with employee successfully!`).then(r => { });
         const clientId = response?.data?.UserClientAssociate?.client?.id;
        navigate(routes.redirectToClientInfoTab.path(authData?.company?.code ?? "1", params?.eid ?? "1",'client'
    ))
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['attach-client-div']}>
      <Card
        bordered={false}
        className={styles['card-div']}>
        <Row style={{ height: '122px' }}>
          <Col span={12} className={styles['employee-col']}>
            <h1>
              <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp; Add Client
            </h1>
          </Col>
          <Col span={12} className={styles['add-existing-col']}>
            <h1 onClick={() => setVisible(true)}>
              &nbsp; Add Existing Client
            </h1>
          </Col>
        </Row>

        <ClientForm
          form={form}
          btnText="Add Client"
          loading={creatingClient}
          onSubmitForm={onSubmitForm}
          cancelAddClient={cancelAddClient}
        />
      </Card>

      <Modal
        centered
        visible={visible}
        closeIcon={[
          <div onClick={() => setVisible(false)} key={'1'}>
            <span className={styles['close-icon-div']}>
              <CloseOutlined />
            </span>
          </div>
        ]}
        footer={[
          <div className={styles['modal-footer']} key={'2'}>
            <Space>
              <Button type="default" htmlType="button" onClick={() => setVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" onClick={addClientToEmployee}>Add Client</Button>
            </Space>
          </div>
        ]}
        width={869}>
        <div className={styles['modal-body']}>
          <div>
            <span className={styles['add-title']}>Add Existing Client</span>
          </div>
          <br /><br />
          <div className={styles['add-body']}>
            <div className={styles['search-client']}>
              <Form.Item
                name="username"
                rules={[{
                  required: true,
                  message: 'Please input your username!'
                }]}>
                <Input
                  prefix={<SearchOutlined
                    className="site-form-item-icon" />}
                  placeholder="Search for the Existing Client"
                  autoComplete="off" role="presentation"
                  onChange={inputChangeSearch} />
              </Form.Item>
            </div>

            <div className={styles['list-client-card']}>
              <Radio.Group
                defaultValue={userClientData?.UserClient?.data?.[0]?.client_id}
                onChange={onChangeClient}>
                <Row
                  gutter={16}
                  className={styles['client-row']}>
                  {loading ? [...Array(6)].map((elementInArray, index) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={index}>
                      <Skeleton paragraph={{ rows: 3 }} />
                    </Col>)) :
                    searchClientData?.Client?.data?.map((client: any, index: number) =>
                      <Col xs={24} sm={12} md={8} lg={8} key={index}>
                        <Radio.Button
                          value={client?.id}
                          className={styles['client-col']}>
                          <div>
                            <b>{client?.name}</b><br />
                            <span>{client?.address?.streetAddress}</span><br />
                            <span>{client?.email}</span>
                          </div>
                        </Radio.Button>
                      </Col>)}
                </Row>
              </Radio.Group>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AttachClient;
