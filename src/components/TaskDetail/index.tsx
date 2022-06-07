
import moment from "moment";
import { CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Col, DatePicker, message, Modal, Row, Select } from "antd";
import parse from "html-react-parser";

import { authVar } from "../../App/link";
import { UserData } from "../../pages/Client";
import { USER } from "../../pages/Employee";
import { TASK_UPDATE } from "../../pages/Project/DetailProject";
import AssignedUserAvatar from "../AssignedUserAvatar";

import { notifyGraphqlError } from "../../utils/error";

import { TaskStatus } from "../../interfaces/generated";

import NotPriority from "../../assets/images/not-priority.svg";
import Priority from "../../assets/images/priority.svg";

import Status from "../Status";
import styles from "./styles.module.scss";
import { useState } from "react";
import { TASK } from "../../pages/Tasks";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  employee?: boolean;
  userId?: any;
}

const TaskDetail = (props: IProps) => {
  const { visibility, setVisibility, data,  userId  } = props;
  const [refresh,setRefresh] = useState(false)
  const loggedInUser = authVar();
  const { data: userData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          id:userId,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [taskUpdate] = useMutation(TASK_UPDATE, {
    
      refetchQueries: [
        {query: TASK,
          variables: {
          input: {
            query: {
              company_id: loggedInUser?.company?.id,
              user_id: loggedInUser?.user?.id,
            },
            paging: {
              order: ["updatedAt:DESC"],
            },
          },}, },
        
        'Task'
      ],
    onCompleted() {
      message.success({
        content: `Task is updated successfully!`,
        className: "custom-message",
      });
      setRefresh(!refresh)
    },
    onError(err) {
      notifyGraphqlError(err);
    },
    update(cache) {
      const normalizedId = cache.identify({ id: data?.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
   
  });

  const status = Object.values(TaskStatus);

  const onStatusChange = (value: any) => {
    taskUpdate({
      variables: {
        input: {
          id: data?.id,
          company_id: loggedInUser?.company?.id,
          status: value,
        },
      },
    });
  };

  const handleDatePickerChange = (date: any, dateString: any) => {
    let deadline = moment(new Date(date)).format("YYYY-MM-DD");
    taskUpdate({
      variables: {
        input: {
          id: data?.id,
          company_id: loggedInUser?.company?.id,
          deadline: deadline,
        },
      },
    });
  };

  const handlePriorityChange = () => {
    taskUpdate({
      variables: {
        input: {
          id: data?.id,
          company_id: loggedInUser?.company?.id,
          priority: !data?.priority,
        },
      },
    });
  };
  const createdAt = data?.createdAt?.split("T")?.[0];
  return (
    <Modal
      centered
      visible={visibility}
      closeIcon={[
        <div onClick={() => setVisibility(false)} key={1}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      footer={[
        <div className={styles["modal-footer"]} key={2}>
          {data?.attachments?.length ? (
            <>
              <span>Attachments</span> &nbsp; &nbsp;
              {data?.attachments?.map((attachment: any, index: number) => (
                <div key={index}>
                  <span className={styles["file-attach"]}>
                    <LinkOutlined />
                  </span>{" "}
                  &nbsp;
                  <span className={styles["file-name"]}>
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment?.name}
                    </a>
                  </span>{" "}
                  &nbsp; &nbsp;
                </div>
              ))}
            </>
          ) : (
            ""
          )}
        </div>,
      ]}
      width={869}
    >
      <div className={styles["modal-body"]}>
        <div>
          <Row>
            <Col lg={6}>
              <span className={styles["task-title"]}>Task Detail</span>
            </Col>
            {props?.employee ? (
              <Col lg={6}>
                <Select
                  placeholder="Select State"
                  onChange={onStatusChange}
                  defaultValue={data?.status}
                >
                  {status?.map((status, index) => (
                    <Select.Option value={status} key={index}>
                      {status}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
            ) : (
              <div className={styles["status-div"]}>
                <Status status={data?.active ? "Active" : "Inactive"} />
              </div>
            )}
          </Row>
        </div>
        <br />
        <br />
        <div style={{ marginBottom: "1rem" }}>
          <Row style={{ marginTop: "1rem" }}>
            {props?.employee && (
              <Col lg={6} md={5} sm={24}>
                <p className={styles["user-name"]}>
                  {userData?.User?.data?.[0]?.fullName}
                </p>
              </Col>
            )}
            <Col lg={5} md={3} sm={12} className={styles["headings"]}>
              <p>Assigned To</p>
              <AssignedUserAvatar users={data?.users} />
            </Col>
            <Col lg={4} md={5} sm={12}>
              <p>Priority</p>
              {props.employee ? (
                <img
                  src={data?.priority ? Priority : NotPriority}
                  width="15px"
                  alt="Priority Flag"
                />
              ) : (
                <img
                  src={data?.priority ? Priority : NotPriority}
                  width="15px"
                  alt="Priority Flag"
                  onClick={handlePriorityChange}
                />
              )}
            </Col>

            <Col lg={6} md={3} sm={12}>
              <p>CreatedAt</p>
              <p className={styles["createdAt"]}>{createdAt}</p>
            </Col>

            <Col lg={3} md={3} sm={12}>
              <p>Deadline</p>

              {props.employee ? (
                <span>
                  {" "}
                  {data?.deadline ? (
                    <p className={styles.deadline}>
                      {" "}
                      {data?.deadline?.split("T")?.[0]}
                    </p>
                  ) : (
                    "-"
                  )}{" "}
                </span>
              ) : data?.deadline ? (
                <Row>
                  <Col>
                    <DatePicker
                      bordered={false}
                      format="MMM Do, YYYY"
                      allowClear={false}
                      className={styles["custom-picker"]}
                      // defaultValue={task?.deadline}
                      suffixIcon={
                        <span>
                          {" "}
                          {`${data?.deadline?.split("T")?.[0]}`}{" "}
                        </span>
                      }
                      onChange={(date, dateString) =>
                        handleDatePickerChange(date, dateString)
                      }
                      style={{
                        width: 90,
                        boxSizing: "revert",
                        padding:0,
                      }}
                    />
                  </Col>
                </Row>
              ) : (
                <DatePicker
                  bordered={false}
                  format="MMM Do, YYYY"
                  allowClear={false}
                  className={styles["custom-picker"]}
                  onChange={(date, dateString) =>
                    handleDatePickerChange(date, dateString)
                  }
                  style={{
                    width: 30,
                    padding:0,
                  }}
                />
              )}
            </Col>
          </Row>
        </div>
        <div style={{ marginTop: "3rem" }}>
          <span className={styles["task-title"]}>{data?.name} </span>
          <span className={styles.clientProjectName}>
            {data?.project?.client?.name}:{data?.project?.name}
          </span>
          <div className={styles["task-body"]}>
            {data?.description ? parse(data?.description) : ""}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetail;
