import React, { useState } from "react";
import { Card, Col, Dropdown, Menu, message, Row, Table } from "antd";
import { Link } from "react-router-dom";
import { gql, useMutation, useQuery } from "@apollo/client";
import { MoreOutlined } from "@ant-design/icons";
import SubMenu from "antd/lib/menu/SubMenu";

import routes from "../../config/routes";
import { authVar } from "../../App/link";
import ClientDetail from "./ClientDetail";

import Status from "../../components/Status";
import ModalConfirm from "../../components/Modal";
import constants from '../../config/constants';

import archiveImg from "../../assets/images/archive_btn.svg";

import { notifyGraphqlError } from "../../utils/error";

import { User } from "../../interfaces/generated";

import styles from "./style.module.scss";
import ArchiveBody from "../../components/Archive";

export interface UserData {
  User: {
    data: User[];
    paging: {
      total: number;
    } 
  };
}

export const CLIENT = gql`
  query Client($input: ClientQueryInput!) {
    Client(input: $input) {
      data {
        id
        name
        email
        invoicingEmail
        status
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
`;

export const CLIENT_UPDATE = gql`
  mutation ClientUpdate($input: ClientUpdateInput!) {
    ClientUpdate(input: $input) {
      id
      name
      status
      archived
    }
  }
`;

const Client = () => {
  const loggedInUser = authVar();
  const [showModal, setShowModal] = useState(false);
  const [client, setClient] = useState<any>();
  const [showArchive, setArchiveModal] = useState<boolean>(false);
  const [pagingInput, setPagingInput] = useState<{
    skip: number,
    currentPage: number,
  }>({
    skip: 0,
    currentPage: 1,
  });

  const changePage = (page: number) => {
    const newSkip = (page - 1) * constants.paging.perPage;
    setPagingInput({
      ...pagingInput,
      skip: newSkip,
      currentPage: page,
    });
  };

  const setArchiveVisibility = (value: boolean) => {
    setArchiveModal(value);
  };

  const { data: clientData } = useQuery(CLIENT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [clientUpdate, { loading: updateLoading }] = useMutation(
    CLIENT_UPDATE,
    {
      onCompleted() {
        message.success({
          content: `Client is updated successfully!`,
          className: "custom-message",
        });
        setArchiveVisibility(false);
      },

      onError(err) {
        setArchiveVisibility(false);
        notifyGraphqlError(err);
      },

      update(cache) {
        const normalizedId = cache.identify({
          id: client?.id,
          __typename: "Client",
        });
        cache.evict({ id: normalizedId });
        cache.gc();
      },
    }
  );

  const changeStatus = (value: string, id: string) => {
    clientUpdate({
      variables: {
        input: {
          status: value,
          id: id,
          company_id: loggedInUser?.company?.id,
        },
      },
    });
  };

  const archiveClient = () => {
    clientUpdate({
      variables: {
        input: {
          id: client?.id,

          archived: !client?.archived,

          company_id: loggedInUser?.company?.id,
        },
      },
    });
  };

  const menu = (data: any) => (
    <Menu>
      <SubMenu title="Change status" key="mainMenu">
        <Menu.Item
          key="active"
          onClick={() => {
            if (data?.status === "Inactive") {
              changeStatus("Active", data?.id);
            }
          }}
        >
          Active
        </Menu.Item>
        <Menu.Divider />

        <Menu.Item
          key="inactive"
          onClick={() => {
            if (data?.status === "Active") {
              changeStatus("Inactive", data?.id);
            }
          }}
        >
          Inactive
        </Menu.Item>
      </SubMenu>
      <Menu.Divider />

      <Menu.Item key="edit">
        <div>
          <Link
            to={routes.editClient.path(
              loggedInUser?.company?.code ?? "1",
              data?.id ?? "1"
            )}
          >
            Edit Client
          </Link>
        </div>
      </Menu.Item>
      <Menu.Divider />

      <Menu.Item key="archive">
        <div
          onClick={() => {
            setClient(data);
            setArchiveVisibility(true);
          }}
        >
          {data?.archived ? "Unarchive Client" : "Archive Client"}
        </div>
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: "Client Name",
      dataIndex: "name",
      key: "name",
      render: (client: any) => {
        return (
          <div className={styles["client-name"]}>
            <p>{client}</p>
          </div>
        );
      },
      onCell: (data: any) => {
        return {
          onClick: () => {
            setClient(data);
            setShowModal(!showModal);
          },
        };
      },
    },
    {
      title: "Email Address",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Invoicing Email",
      dataIndex: "invoicingEmail",
      key: "invoicingEmail",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",

      render: (status: string) => <Status status={status} />,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <div
          className={styles["dropdown-menu"]}
          onClick={(event) => event.stopPropagation()}
        >
          <Dropdown
            overlay={menu(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
              style={{ paddingLeft: "1rem" }}
            >
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div className={styles["main-div"]}>
      <Card bordered={false}>
        <Row>
          <Col span={12} className={styles["client-col"]}>
            <h1>Client</h1>
          </Col>
          <Col span={12} className={styles["client-col"]}>
            <div className={styles["add-new-client"]}>
              <Link
                to={routes.addClient.path(
                  loggedInUser?.company?.code ? loggedInUser?.company?.code : ""
                )}
              >
                Add New Client
              </Link>
            </div>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              dataSource={clientData?.Client?.data}
              loading={updateLoading}
              columns={columns}
              rowKey={(record) => record?.id}
              pagination={{
                current: pagingInput.currentPage,
                onChange: changePage,
                total: clientData?.Client?.paging?.total,
                pageSize: constants.paging.perPage
              }}
            />
          </Col>
        </Row>
      </Card>

      {showModal && (
        <ClientDetail
          visible={showModal}
          client={client}
          setVisible={setShowModal}
        />
      )}

      <ModalConfirm
        visibility={showArchive}
        setModalVisibility={setArchiveVisibility}
        imgSrc={archiveImg}
        okText={client?.archived ? "Unarchive" : "Archive"}
        modalBody={() =>
          ArchiveBody({
            title: (
              <>
                Are you sure you want to{" "}
                {client?.archived ? "unarchive" : "archive"}
                <strong> {client.name}?</strong>
              </>
            ),
            subText: `Client will ${client?.archived ? "" : "not"
              } be able to login to the system`,
          })
        }
        onOkClick={archiveClient}
      />
    </div>
  );
};

export default Client;
