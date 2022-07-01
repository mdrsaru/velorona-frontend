import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
  Space,
  Upload,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment";
import type { UploadProps } from "antd";

import constants from '../../../config/constants'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { notifyGraphqlError } from '../../../utils/error'
import { IRole } from '../../../interfaces/IRole'
import { USER_UPDATE, USER } from '..'
import { ROLES } from '../../Role'
import { CHANGE_PROFILE_IMAGE } from '../NewEmployee'

import { STATE_CITIES, USA_STATES } from '../../../utils/cities'
import { useState } from 'react'
import styles from '../style.module.scss'
import { authVar } from '../../../App/link'
import RouteLoader from '../../../components/Skeleton/RouteLoader'
import { MutationChangeProfilePictureArgs, MutationUserUpdateArgs, User } from "../../../interfaces/generated";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";

const dateFormat = "YYYY-MM-DD HH:mm:ss";
const profileFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const EditEmployee = () => {
  let params = useParams();
  const authData = authVar();
  const navigate = useNavigate();
  const [fileData, setFile] = useState({
    id: "",
    name: "",
  });

  const [userUpdate] = useMutation<
    GraphQLResponse<'UserUpdate', User>,
    MutationUserUpdateArgs
  >(USER_UPDATE, {

    onCompleted: (response) => {
      authVar({
        ...authData,
        fullName: response?.UserUpdate?.fullName as string
      })
      if (fileData?.id) {
        changeProfilePictureInput({
          variables: {
            input: {
              id: params?.eid as string,
              avatar_id: fileData?.id,
            },
          },
        })
          .then((response) => {
            if (response.errors) {
              return notifyGraphqlError(response.errors);
            } else if (response?.data) {
              successMessage();
              authVar({
                ...authData,
                avatar: {
                  id: response?.data?.ChangeProfilePicture?.avatar?.id as string,
                  url: response?.data?.ChangeProfilePicture?.avatar?.url as string
                }
              })
            }
          })
          .catch(notifyGraphqlError);
      } else {
        successMessage();
      }
    },
  });
  const [changeProfilePictureInput] = useMutation<
    GraphQLResponse<'ChangeProfilePicture', User>,
    MutationChangeProfilePictureArgs
  >(CHANGE_PROFILE_IMAGE);
  const { data: roles } = useQuery(ROLES, {
    fetchPolicy: "cache-first",
  });
  const { data: userData, loading: userLoading } = useQuery(USER, {
    variables: {
      input: {
        query: {
          id: params?.eid,
        },
      },
    },
    onCompleted: (response) => {
      setFile({
        id: "",
        name: response?.User?.data[0]?.avatar?.name,
      });
    },
  });

  const [form] = Form.useForm();
  const { Option } = Select;

  const cancelEditEmployee = () => {
    navigate(-1);
  };

  const successMessage = () => {
    message.success(`Employee is updated successfully!`).then((r) => { });
    navigate(-1);
  };

  const props: UploadProps = {
    name: "file",
    action: `${constants.apiUrl}/v1/media/upload`,
    maxCount: 1,
    accept: 'image/*',
    headers: {
      authorization: authData?.token ? `Bearer ${authData?.token}` : "",
    },
    onChange(info) {
      if (info.file.status === "done") {
        setFile({
          name: info?.file?.name,
          id: info?.file?.response?.data?.id,
        });
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
  };

  const onSubmitForm = () => {
    const values = form.getFieldsValue(true, (meta) => meta.touched);
    if (Object.keys(values).length !== 0) {
      let formData: any = { id: params?.eid };
      let address: any = {};
      for (let data in values) {
        if (
          data === "country" ||
          data === "streetAddress" ||
          data === "state" ||
          data === "city" ||
          data === "zipcode" ||
          data === "aptOrSuite"
        ) {
          address[data] = values[data];
          formData["address"] = address;
        } else if (data !== "upload") {
          formData[data] = values[data];
        }
      }

      userUpdate({
        variables: {
          input: formData,
        },
      });
      // .then((response) => {
      //   if (response.errors) {
      //     return notifyGraphqlError((response.errors))
      //   };
      // }).catch(notifyGraphqlError)
    } else {
      navigate(-1);
    }
  };

  const [cities, setCountryCities] = useState<string[]>([]);
  const setState = (data: string) => {
    setCountryCities(STATE_CITIES[data]);
  };

  return (
    <div className={styles["main-div"]}>
      {userLoading ? (
        <RouteLoader />
      ) : (
        <Card bordered={false}>
          <Row>
            <Col span={12} className={styles["employee-col"]}>
              <h1>
                <ArrowLeftOutlined
                  onClick={() => navigate(-1)} />
                &nbsp;
                Edit {authData?.user?.id === params.eid ? "Profile" : " User"}
              </h1>
            </Col>
          </Row>
          <Form
            form={form}
            layout="vertical"
            onFinish={onSubmitForm}
            initialValues={{
              email: userData?.User?.data[0]?.email ?? "",
              firstName: userData?.User?.data[0]?.firstName ?? "",
              middleName: userData?.User?.data[0]?.middleName ?? "",
              lastName: userData?.User?.data[0]?.lastName ?? "",
              phone: userData?.User?.data[0]?.phone ?? "",
              roles: userData?.User?.data[0]?.roles[0]?.id ?? "",
              status: userData?.User?.data[0]?.status ?? "",
              country:
              userData?.User?.data[0]?.address?.country ?? "",
              streetAddress:
                userData?.User?.data[0]?.address?.streetAddress ?? "",
              startDate: moment(
                userData?.User?.data[0]?.record?.endDate ??
                "2022-01-01T00:00:00.410Z",
                dateFormat
              ),
              endDate: moment(
                userData?.User?.data[0]?.record?.startDate ??
                "2022-01-02T00:00:00.410Z",
                dateFormat
              ),
              state: userData?.User?.data[0]?.address?.state ?? "",
              city: userData?.User?.data[0]?.address?.city ?? "",
              file: userData?.User?.data[0]?.avatar?.url,
              zipcode: userData?.User?.data[0]?.address?.zipcode ?? "",
              aptOrSuite: userData?.User?.data[0]?.address?.aptOrSuite ?? "",
              payRate: userData?.User?.data[0]?.record?.payRate ?? "",
            }}
          >
            <Row gutter={[24, 0]}>
              <Col className={styles["form-header"]}>
                <p>User Information</p>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label="First Name"
                  name="firstName"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the firstname",
                    },
                  ]}
                >
                  <Input placeholder="Enter firstname" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item label="Middle Name" name="middleName">
                  <Input placeholder="Enter middle name" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label="Last Name"
                  name="lastName"
                  rules={[
                    {
                      required: true,
                      message: "Please select the lastname",
                    },
                  ]}
                >
                  <Input placeholder="Enter lastname" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}>
                <Form.Item
                  label="Email"
                  name="email"
                >
                  <Input
                    placeholder="Enter your email"
                    autoComplete="off"
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={12}
                lg={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    {
                      required: true,
                      message: "Please input your phone number!",
                    },
                    {
                      max: 10,
                      message: "Phone number should be less than 10 digits",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter your phone number"
                    autoComplete="off"
                  />
                </Form.Item>
              </Col>
              <Col className={styles["form-header"]}>
                <p>Address</p>
              </Col>
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={8}
                className={styles.formCol}>
                <Form.Item
                  name="country"
                  label="Country">
                  <Input
                    placeholder="Enter the country"
                    autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label="State"
                  name="state"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your state!",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter the state"
                    name='state'
                    autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label="City"
                  name="city"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your city!",
                    },
                  ]}
                >
                    <Input
                  placeholder="Enter the city "
                  name='city'
                  autoComplete="off" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item
                  label="Street Address"
                  name="streetAddress"
                  rules={[
                    {
                      required: true,
                      message: "Please select the street address",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter street address"
                    autoComplete="off"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item label="Apartment/Suite" name="aptOrSuite">
                  <Input
                    placeholder="Enter your apartment no"
                    autoComplete="off"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8}>
                <Form.Item label="Zip Code" name="zipcode">
                  <Input placeholder="Enter the zipcode" autoComplete="off" />
                </Form.Item>
              </Col>
              <Col className={styles["form-header"]}>
                <p>User Roles</p>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="roles"
                  label="Role"
                  rules={[
                    {
                      message: "Please select the role!",
                    },
                  ]}
                >
                  <Select placeholder="Employee" disabled={authData?.user?.id === params.eid ? true : false}>
                    {roles &&
                      roles?.Role?.data.map((role: IRole, index: number) => (
                        <Option value={role?.id} key={index}>
                          {role?.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="status"
                  label="User Status"
                  rules={[
                    {
                      message: "Please select the status",
                    },
                  ]}
                >
                  <Select placeholder="Select status" disabled={authData?.user?.id === params.eid ? true : false}>
                    <Option value="Active">Active</Option>
                    <Option value="Inactive">InActive</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <Form.Item
                  name="file"
                  label="Upload Profile Image"
                  valuePropName="filelist"
                  getValueFromEvent={profileFile}
                  style={{ position: "relative" }}
                >
                  <div className={styles["upload-file"]}>
                    <div>
                      <span>
                        {fileData?.name
                          ? fileData?.name
                          : " Attach your file here"}
                      </span>
                    </div>
                    <div className={styles["browse-file"]}>
                      <Upload {...props}>Click to Upload</Upload>
                    </div>
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <br />
            <br />
            <Row justify="end">
              <Col>
                <Form.Item>
                  <Space>
                    <Button
                      type="default"
                      htmlType="button"
                      onClick={cancelEditEmployee}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit">
                      Update {authData?.user?.id === params.eid ? "Profile" : " Employee"}
                    </Button>
                  </Space>
                </Form.Item >
              </Col >
            </Row >
          </Form >
        </Card >
      )}
    </div >
  );
};
export default EditEmployee;
