import { Avatar, Card, Col, Row, Button } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

import { useQuery } from "@apollo/client";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import routes from "../../../config/routes";
import { authVar } from "../../../App/link";

import image from "../../../assets/images/High_five.svg";
import { USER } from "../index";

import styles from "../style.module.scss";

const DetailEmployee = () => {
  console.log("profile");
  const navigate = useNavigate();
  const loggedInUser = authVar();
  let params = useParams();
  let location = useLocation();
  console.log(location.pathname.includes("profile"));

  const profile = location.pathname.includes("profile");
  console.log(profile, "profule");
  const { data: userData } = useQuery(USER, {
    fetchPolicy: "network-only",
    variables: {
      input: {
        query: {
          id: params?.eid,
        },
      },
    },
  });

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
                <Avatar
                  src={userData?.User?.data[0]?.avatar?.url ?? image}
                  size={{
                    xs: 100,
                    sm: 100,
                    md: 100,
                    lg: 130,
                    xl: 130,
                    xxl: 130,
                  }}
                  // icon={<AntDesignOutlined />}
                />
             
              {profile ? (
                 <div>
                <span></span>
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
          </Row>

          <Row justify="end" className={styles["footer-btn"]}>
            <Col>
              <Button type="primary">
                <Link
                  to={routes.editEmployee.path(
                    loggedInUser?.company?.code ?? "1",
                    params?.eid ?? "1"
                  )}
                >
                {profile ? 'Edit Profile ': " Edit Employee"}
                </Link>
              </Button>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default DetailEmployee;
