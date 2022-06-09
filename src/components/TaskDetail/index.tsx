
import moment from "moment";
import { CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@apollo/client";
import { Col, DatePicker, message, Modal, Row, Select, Button } from "antd";
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
import { TASK } from "../../pages/Tasks";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  employee?: boolean;
  userId?: any;
  onUpdateAction?: any;

}

const TaskDetail = (props: IProps) => {
  const { visibility, setVisibility, data, userId } = props;
  const loggedInUser = authVar();
  const { data: userData } = useQuery<UserData>(USER, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          id: userId,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

  const [taskUpdate] = useMutation(TASK_UPDATE, {
    refetchQueries: [
      {
        query: TASK,
        variables: {
          input: {
            query: {
              company_id: loggedInUser?.company?.id,
              user_id: loggedInUser?.user?.id,
            },
            paging: {
              order: ["updatedAt:DESC"],
            },
          },
        },
      },

      'Task'
    ],
    onCompleted() {
      message.success({
        content: `Task is updated successfully!`,
        className: "custom-message",
      });
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
    setVisibility(false)
  };

  const handleDatePickerChange = (date: any) => {
    let deadline = moment(new Date(date)).format("YYYY-MM-DD");
    props?.onUpdateAction({ title: "deadline", value: deadline })

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
    props?.onUpdateAction({ title: "priority", value: !data.priority })

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
      footer={null}
      width={869}
    >
      <div className={styles["modal-body"]}>
        <Row gutter={[32, 24]} className={styles["task-header"]}>
          <Col span={8}>
            <div>
              <span className={styles["task-title"]}>{data?.name} </span>
            </div>
          </Col>
          {props?.employee ? (
            <Col span={4}>
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
            <Col span={4} className={styles["status-div"]}>
              <Status status={data?.active ? "Active" : "Inactive"} />
            </Col>
          )}
        </Row>
        <br />
        <br />
        <Row gutter={[32, 12]} className={styles['assigned-details']}>
          <Col span={6}>
            <p>Assigned to</p>
            <AssignedUserAvatar users={data?.users} />
          </Col>
          <Col span={6}>
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

          <Col span={6}>
            <p>CreatedAt</p>
            <p className={styles["createdAt"]}>{createdAt}</p>
          </Col>

          <Col span={6}>
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
                    onChange={(date) =>
                      handleDatePickerChange(date)
                    }
                    style={{
                      width: 90,
                      boxSizing: "revert",
                      padding: 0,
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
                onChange={(date) =>
                  handleDatePickerChange(date)
                }
                style={{
                  width: 30,
                  padding: 0,
                }}
              />
            )}
          </Col>
        </Row>
        <Row>
          <Col className={styles["task-body"]}>
            <div>
              {data?.description ? <span className={styles["task-subtitle"]}>Task Description</span> : ''}
              <span className={styles['client-project-name']}>
                {data?.project?.client?.name}:{data?.project?.name}
              </span>
            </div>
            <br />
            <div>
              {data?.description ? parse(data?.description) : ""}
            </div>
          </Col>
        </Row>
        <Row className={styles["modal-footer"]} key={2}>
          <Col span={12}>
            {data?.attachments?.length ? (
              <div>
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
              </div>
            ) : (
              ""
            )}
          </Col>
          <Col span={12}>
            <Button type="primary">Start Timer</Button>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default TaskDetail;
