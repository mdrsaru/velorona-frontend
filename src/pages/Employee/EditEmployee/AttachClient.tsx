import React, {useEffect, useState} from "react";
import { Card, Col, Form, message, Modal, Row, Input, Button, Space, Radio, Skeleton } from "antd";
import { ArrowLeftOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { notifyGraphqlError } from "../../../utils/error";
import debounce from 'lodash.debounce';

import { authVar } from "../../../App/link";
import AddClientForm from "../../Client/NewClient/AddClientForm";

import constants from "../../../config/constants";
import routes from "../../../config/routes";
import { USER } from "../index";
import { CLIENT_CREATE } from "../../Client/NewClient";

import styles from "../style.module.scss";

export const SEARCH_CLIENT = gql`
    query SearchClient($input: UserQueryInput) {
        SearchClient(input: $input) {
            data {
                id
                email
                phone
                firstName
                middleName
                lastName
                fullName
                status
                address {
                    streetAddress
                }
                company {
                    id
                    name
                }
                roles {
                    id
                    name
                }
            }
        }
    }
`

export const ASSOCIATE_USER_WITH_CLIENT = gql`
    mutation AssociateUserWithClient($input: AssociateUserClientInput!) {
        AssociateUserWithClient(input: $input) {
            id
            status
        }
    }
`


const AttachClient = () => {
  let params = useParams();
  const navigate = useNavigate();
  const authData = authVar();
  const [form] = Form.useForm();
  const [client, setClient] = useState('');
  const [AssociateClient] = useMutation(ASSOCIATE_USER_WITH_CLIENT);
  const [ClientCreate] = useMutation(CLIENT_CREATE);
  const [visible, setVisible] = useState(false);
  const [searchClients, { loading, data: clientData1 }] = useLazyQuery(
    SEARCH_CLIENT,
    {
      fetchPolicy: "network-only",
      variables: {
        input: {
          query: {
            search: ''
          }
        }
      }
    }
  );

  const { data: clientData } = useQuery(USER, {
    variables: {
      input: {
        query: {
          role: constants.roles.Client
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const inputChangeSearch =  debounce((e: any) => {
    searchClients({
      variables: {
        input: {
          query: {
            search: e.target.value
          }
        }
      }
    } ).then(r => {
      console.log(r);
    });
  }, 500);

  useEffect(() => {
    searchClients({
      variables: {
        input: {
          query: {
            search: ''
          }
        }
      }
    }).then(r => {})
  }, [searchClients])

  const onSubmitForm = (values: any) => {
    message.loading({content: "Adding client in progress..", className: 'custom-message'}).then(() =>
      ClientCreate({
        variables: {
          input: {
            name: values.name,
            email: values.email,
            invoicingEmail: values.invoiceEmail,
            company_id: authData?.company?.id,
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
  
  const onChangeClient = (event: any) => {
    setClient(event?.target.value)
  }
  
  const addClientToEmployee = () => {
    AssociateClient({
      variables: {
        input: {
          user_id: params?.eid,
          client_id: client
        }
      }
    }).then((response) => {
      if(response.errors) {
        return notifyGraphqlError((response.errors))
      } else if (response?.data?.AssociateUserWithClient) {
        message.success(`Client is associated with employee successfully!`).then(r => {});
        navigate(routes.employee.path(authData?.company?.code ?? ''));
      }
    }).catch(notifyGraphqlError)
  }

  return (
    <div className={styles['attach-client-div']}>
      <Card bordered={false} className={styles['card-div']}>
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
          <br/><br/>
          <div className={styles['add-body']}>
            <div className={styles['search-client']}>
              <Form.Item name="username" rules={[{ required: true, message: 'Please input your username!' }]}>
                <Input prefix={<SearchOutlined className="site-form-item-icon" />}
                       placeholder="Search for the Existing Client" autoComplete="off" onChange={inputChangeSearch}/>
              </Form.Item>
            </div>
            <div className={styles['list-client-card']}>
              <Radio.Group defaultValue={clientData?.SearchClient?.data[0]?.id} onChange={onChangeClient}>
                <Row gutter={16} className={styles['client-row']}>
                  {loading ? [...Array(6)].map((elementInArray, index) => (
                    <Col xs={24} sm={12} md={8} lg={8} key={index}>
                      <Skeleton paragraph={{ rows: 3 }}  />
                    </Col>)) :
                    clientData1?.SearchClient?.data?.map((client: any, index: number) =>
                    <Col xs={24} sm={12} md={8} lg={8} key={index}>
                      <Radio.Button value={client?.id} className={styles['client-col']}>
                        <div>
                          <b>{client?.fullName}</b><br/>
                          <span>{client?.address?.streetAddress}</span><br/>
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
