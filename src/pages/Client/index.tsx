import React from "react";
import { Card, Col, Dropdown, Menu, Row, Table } from "antd";

import { Link } from "react-router-dom";
import routes from "../../config/routes";
import { authVar } from "../../App/link";

import { gql, useQuery } from "@apollo/client";
import { MoreOutlined } from "@ant-design/icons";

import { User } from "../../interfaces/generated";

import styles from "./style.module.scss";

export interface UserData {
  User: {
    data : User[]
  }
}

export const CLIENT = gql`
    query Client($input: ClientQueryInput!) {
        Client(input: $input) {
            data {
                id
                name
                email
                invoicingEmail
                address {
                    streetAddress
                    state
                    zipcode
                    city
                }
            }
            paging {
                total
                startIndex
                endIndex
                hasNextPage
            }
        }
    }
`

const Client = () => {
  const loggedInUser = authVar();
  const { data: clientData } = useQuery(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id
        },
        paging: {
          order: ['updatedAt:DESC']
        }
      }
    }
  })

  const menu = (data: any) => (
    <Menu>
      <Menu.Item key="edit">
        <div>
          <Link to={routes.editClient.path(loggedInUser?.company?.code ?? '1', data?.id ?? '1')}>
            Edit Client
          </Link>
        </div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email Address',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Invoicing Email',
      dataIndex: 'invoicingEmail',
      key: 'invoicingEmail'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: any) =>
        <div className={styles['dropdown-menu']} onClick={(event) => event.stopPropagation()}>
          <Dropdown overlay={menu(record)} trigger={['click']} placement="bottomRight">
            <div className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{paddingLeft: '1rem'}}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>,
    },
  ];

  return (
    <div className={styles['main-div']}>
      <Card bordered={false}>
          <Row>
            <Col span={12} className={styles['client-col']}>
              <h1>Client</h1>
            </Col>
            <Col span={12} className={styles['client-col']}>
              <div className={styles['add-new-client']}>
                <Link to={routes.addClient.path(loggedInUser?.company?.code ? loggedInUser?.company?.code : '')}>
                  Add New Client
                </Link>
              </div>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Table dataSource={clientData?.Client?.data} columns={columns} rowKey={(record => record?.id)}/>
            </Col>
          </Row>
        </Card>
    </div>
  )
}

export default Client;
