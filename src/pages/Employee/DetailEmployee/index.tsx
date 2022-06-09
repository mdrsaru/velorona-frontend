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
  Spin,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useMutation, useQuery } from "@apollo/client";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import routes from "../../../config/routes";
import { authVar } from "../../../App/link";

import image from "../../../assets/images/default_pp.png";
import camera from "../../../assets/images/camera.svg";
import { USER } from "../index";

import styles from "../style.module.scss";
import ViewUserPayRate from "../../../components/ViewUserPayRate";
import constants from "../../../config/constants";
import { CHANGE_PROFILE_IMAGE } from "../NewEmployee";
import { notifyGraphqlError } from "../../../utils/error";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { MutationChangeProfilePictureArgs, QueryUserArgs, User, UserPagingResult } from "../../../interfaces/generated";
import Loader from "../../../components/Loader";

const DetailEmployee = () => {
  const navigate = useNavigate();
  const loggedInUser = authVar();

  let params = useParams();
  let location = useLocation();
  const [showViewUserPayRate, setViewUserPayRateVisibility] =
    useState<boolean>(false);

  const profile = location.pathname.includes("profile");

  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);


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
    setViewUserPayRateVisibility(!showViewUserPayRate);
  };

  return (
    <div className={styles["main-div"]}>
      {userData?.User?.data[0] && (
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles["employee-col"]}>
              <h1>
                <ArrowLeftOutlined onClick={() => navigate(-1)} /> &nbsp;
                {profile ? "My Profile" : "Employee"}
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
                    <span>Employee</span>
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
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Email</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.email ?? "N/A"}
                </span>
              </div>
              <div>
                <div>Address</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.address?.streetAddress ?? "N/A"}
                  {userData?.User?.data[0]?.address?.city
                    ? " ," + userData?.User?.data[0]?.address?.city
                    : ""}
                </span>
              </div>
              {/* <div>
                <div>Employee Start Date</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.record?.startDate ? moment(userData?.User?.data[0]?.record?.startDate).format('L') : 'N/A'}
                </span>
              </div>
              <div>
                <div>PayRate</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.record?.payRate ?? 0}
                </span>
              </div> */}
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <div>
                <div>Phone Number</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.phone ?? "N/A"}
                </span>
              </div>
              <div>
                <div>Status</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.status}
                </span>
              </div>
              {/* <div>
                <div>Employee End Date</div>
                <span className={styles.detailValue}>
                  {userData?.User?.data[0]?.record?.endDate ? moment(userData?.User?.data[0]?.record?.endDate).format('L') : 'N/A'}
                </span>
              </div> */}
            </Col>
            <Col xs={24} sm={24} md={12} lg={12}>
              <p
                className={styles["view-pay-rate"]}
                onClick={handleViewPayRate}
              >
                View Payrate
              </p>
            </Col>
          </Row>

          <Row justify="end" className={styles["footer-btn"]}>
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
                    Edit Employee
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
      />
    </div>
  );
};

export default DetailEmployee;
