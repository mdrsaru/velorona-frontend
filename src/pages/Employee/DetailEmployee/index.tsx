import React, { useState } from "react";
import {
  Avatar,
  Card,
  Col,
  Row,
  Button,
  UploadProps,
  message,
  Upload,
  Table,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import routes from "../../../config/routes";
import { authVar } from "../../../App/link";

import image from "../../../assets/images/default_pp.png";
import camera from "../../../assets/images/camera.svg";
import { USER } from "../index";

import styles from "../style.module.scss";
import ViewUserPayRate, { USER_PAY_RATE } from "../../../components/ViewUserPayRate";
import constants from "../../../config/constants";
import { CHANGE_PROFILE_IMAGE } from "../NewEmployee";
import { notifyGraphqlError } from "../../../utils/error";
import { GraphQLResponse, UserPayRatePagingData } from "../../../interfaces/graphql.interface";
import { MutationChangeProfilePictureArgs, QueryUserArgs, QueryUserClientArgs, RoleName, User, UserClient,UserClientPagingResult, UserPagingResult } from "../../../interfaces/generated";
import Loader from "../../../components/Loader";
import moment from "moment";
import Status from "../../../components/Status";

export const USERCLIENT = gql`
  query UserClient($input: UserClientQueryInput!) {
    UserClient(input: $input) {
      paging {
        total
      }
      data {
      client_id
			user_id
      status
			client{
				id
        name
        email
        status
			}
      user{
      id 
      fullName
      email
      }
      }
    }
  }
`;

const DetailEmployee = () => {
  const navigate = useNavigate();
  const loggedInUser = authVar();

  let params = useParams();
  let location = useLocation();
  const [showViewUserPayRate, setViewUserPayRateVisibility] =
    useState<boolean>(false);

  const profile = location.pathname.includes("profile");

  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  const [getUserPayRate, { data: userPayRate }] = useLazyQuery<UserPayRatePagingData>(USER_PAY_RATE,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: 'cache-first',
      variables: {
        input: {
          query: {
            user_id: params?.eid,
          }
        }
      }
    })

  const [changeProfilePictureInput, loading] = useMutation<
    GraphQLResponse<'ChangeProfilePicture', User>,
    MutationChangeProfilePictureArgs
  >(CHANGE_PROFILE_IMAGE, {
    onCompleted(response) {
      const userAuth = authVar();
      authVar({
        ...userAuth,
        avatar: {
          id: response.ChangeProfilePicture?.avatar?.id as string,
          url: response.ChangeProfilePicture?.avatar?.url as string,
        },
      });
      setIsImageLoading(false);
      message.success({
        content: `Profile picture changed successfully!`,
        className: "custom-message",
      });
    },
  });

  const { data: userData } = useQuery<
    GraphQLResponse<'User', UserPagingResult>,
    QueryUserArgs
  >(USER, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        query: {
          id: params?.eid,
        },
      },
    },
  });

  const { data: userClientData, loading: userClientLoading } = useQuery<
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

  const props: UploadProps = {
    name: "file",
    action: `${constants.apiUrl}/v1/media/upload`,
    maxCount: 1,
    accept: 'image/*',
    headers: {
      authorization: loggedInUser?.token ? `Bearer ${loggedInUser?.token}` : "",
    },
    onChange(info) {
      if (info.file.status === "done") {
        setIsImageLoading(true);
        changeProfilePictureInput({
          variables: {
            input: {
              id: userData?.User?.data[0]?.id as string,
              avatar_id: info?.file?.response?.data?.id,
            },
          },
        }).catch(notifyGraphqlError);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const handleViewPayRate = () => {
    getUserPayRate({
      variables: {
        input: {
          query: {
            user_id: params?.eid,
          },
          paging: {
            order: ["updatedAt:DESC"],
          },
        },
      }
    })
    setViewUserPayRateVisibility(!showViewUserPayRate);
  };

  const columns = [
    {
      title: "Name",
      key: "client.name",
      width: '50%',
      render: (userClient: UserClient) => {
        return <>{userClient?.client?.name}</>
      }

    },
    {
      title: "Client Status",
      key: "status",
      dataIndex: 'status',
      render: (status: string) => {
        return <Status status={status} />
      }
    },
  ]

  return (
    <div className={styles["main-div"]}>
      {userData?.User?.data[0] && (
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles["employee-col"]}>
              <h1>
                <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp;
                {profile ? "My Profile" : "User"}
              </h1>
            </Col>
          </Row>

          <Row justify="center">
            <Col className={styles["avatar-col"]}>
              <div className={styles["avatar-image"]}>
                {isImageLoading && loading ?
                  <Loader />
                  : (
                    <Avatar
                      src={userData?.User?.data[0]?.avatar?.url ?? image}
                      size={{
                        xs: 100,
                        sm: 100,
                        md: 100,
                        lg: 100,
                        xl: 100,
                        xxl: 100,
                      }}
                    // icon={<AntDesignOutlined />}
                    />
                  )
                }
                {profile ? (
                  <div className={styles["camera-div"]}>
                    <div className={styles["browse-file"]}>
                      <Upload {...props}>
                        <img src={camera} alt="camera-src" />
                      </Upload>
                    </div>
                  </div>
                ) : (
                  <div className={styles["name-tag"]}>
                    <span>{userData?.User?.data[0]?.roles?.[0].name}</span>
                  </div>
                )}
              </div>
            </Col>
          </Row>
          <br />

          <Row justify="center">
            <Col className={styles["avatar-col"]}>
              <div className={styles["employee-name"]}>
                {userData?.User?.data[0]?.fullName ?? "N/A"}
              </div>
              {/* <div className={styles['employee-title']}>
                UX/UI Designer
              </div> */}
            </Col>
          </Row>
          <br />

          <Row className={styles["detail-row"]}>
            <Col xs={24} sm={24} md={24} lg={24}>
              <div className={styles['header-div']}>Contact Information</div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Email</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.email ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Phone Number</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.phone ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>Country</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.country ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>State</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.state ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>City</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.city ?? "N/A"}
                </span>
              </div>
            </Col>

            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>Street Address</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.streetAddress ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>Apartment/Suite</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.aptOrSuite ?? "N/A"}
                </span>
              </div>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <div>
                <div>Zip Code</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.zipcode ?? "N/A"}
                </span>
              </div>
            </Col>


            {
              userData?.User?.data[0]?.roles?.[0].name === RoleName.Employee &&
              <>
                <Col xs={24} sm={24} md={12} lg={8}>

                  <div>
                    <div>Entry Type</div>
                    <span className={styles.detailValue}>
                      {userData?.User?.data[0]?.entryType ?? 'N/A'}
                    </span>
                  </div>

                </Col>
                <Col xs={24} sm={24} md={12} lg={8}>

                  <div>
                    <div>Timesheet Attachment Type</div>
                    <span className={styles.detailValue}>
                      {userData?.User?.data[0]?.timesheet_attachment ? 'Mandatory' : 'Optional'}
                    </span>
                  </div>

                </Col>
              </>
            }
            <Col xs={24} sm={24} md={24} lg={24}>
              <div className={styles['header-div']}>Employment Status</div>
            </Col>
            <br />

            <Col xs={24} sm={24} md={12} lg={12}>

              <div>
                <div>Employment Status</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.status}
                </span>
              </div>

            </Col>
            {
              userData?.User?.data[0]?.roles?.[0].name === RoleName.Employee &&
              <>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <div>
                    <div>Employee Start Date</div>
                    <span className={styles.detailValue}>
                      {userData?.User?.data[0]?.startDate ? moment(userData?.User?.data[0]?.startDate).format('L') : 'N/A'}
                    </span>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12}>
                  <div>
                    <div>Employee End Date</div>
                    <span className={styles.detailValue}>
                      {userData?.User?.data[0]?.endDate ? moment(userData?.User?.data[0]?.endDate).format('L') : 'N/A'}
                    </span>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={12}>
                  <p
                    className={styles["view-pay-rate"]}
                    onClick={handleViewPayRate}
                  >
                    View Payment Details
                  </p>
                </Col>
                {userClientData?.UserClient?.data.length ?
                  <>
                    <Col xs={24} sm={24} md={24} lg={24}>
                      <div className={styles['header-div']}>Client Assigned</div>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24} style={{ marginBottom: '1rem' }}>
                      <Table
                        loading={userClientLoading}
                        dataSource={userClientData?.UserClient?.data}
                        columns={columns}
                      />
                    </Col>
                  </>
                  :
                  <></>
                }
              </>
            }
          </Row>
          <Row>
            <Col>
            </Col>
          </Row>
          <Row justify="end" className={styles["footer-btn"]}>
            <Col>
              <Button type="default" style={{ marginRight: '1rem' }}>
                <Link to={routes.changePassword.path(params?.eid ?? "1")}>
                  Change Password
                </Link>
              </Button>
            </Col>
            <Col>
              <Button type="primary">
                {profile ?
                  <Link to={routes.editProfile.path(params?.eid ?? "1")}>
                    Edit Profile
                  </Link> :
                  <Link to={routes.editEmployee.path(
                    loggedInUser?.company?.code ?? "1",
                    params?.eid ?? "1"
                  )}>
                    Edit User
                  </Link>}
              </Button>
            </Col>
          </Row>
        </Card>
      )}
      <ViewUserPayRate
        visibility={showViewUserPayRate}
        setVisibility={setViewUserPayRateVisibility}
        data={userData?.User?.data[0]}
        userPayRate={userPayRate}
      />
    </div>
  );
};

export default DetailEmployee;
