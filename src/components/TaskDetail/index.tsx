import moment from "moment"
import { CloseOutlined, LinkOutlined } from "@ant-design/icons"
import { useMutation } from "@apollo/client"
import { Col, DatePicker, message, Modal, Row, Select } from "antd"
import parse from "html-react-parser";

import { authVar } from "../../App/link"
import { TASK_UPDATE } from "../../pages/Project/DetailProject"
import AssignedUserAvatar from "../AssignedUserAvatar"
import { notifyGraphqlError } from "../../utils/error";
import { TaskStatus } from "../../interfaces/generated"

import NotPriority from "../../assets/images/not-priority.svg"
import Priority from "../../assets/images/priority.svg"
import Status from "../Status";
import constants from "../../config/constants"

import styles from "./styles.module.scss"
import { ReactNode } from "react"

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  employee?: boolean;
  userId?: any;
  timerBody?: ReactNode;
  refetchTasks?: any;
  onUpdateAction?: any
}


const TaskDetail = (props: IProps) => {
  const { visibility, setVisibility, data } = props
  const loggedInUser = authVar()

  const [taskUpdate] = useMutation(TASK_UPDATE, {
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

  const onCloseModal = () => {
    setVisibility(false)
  }

  return (
    <Modal
      centered
      visible={visibility}
      closeIcon={[
        <div onClick={onCloseModal} key={1}>
          <span className={styles["close-icon-div"]}>
            <CloseOutlined />
          </span>
        </div>,
      ]}
      className={styles['task-detail-modal']}
      footer={null}
      width={869}
    >
      <div className={styles["modal-body"]}>
        <Row gutter={[32, 24]} className={styles["task-header"]}>
            <div className={styles['header']}>
              <span className={styles["task-title"]}>{data?.name} </span>
              <span className={styles['client-project-name']}>
                {data?.project?.client?.name} : {data?.project?.name}
              </span>
            </div>
          {props?.employee ? (
            <div className={styles["task-status-div"]}>
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
              </div>
          ) : (
            <div className={styles["status-div"]}>
              <Status status={data?.active ? "Active" : "Inactive"} />
            </div>
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
            <br />
            <div>
              {data?.description ? parse(data?.description) : ""}
            </div>
          </Col>
        </Row>
        <Row className={styles["modal-footer"]} key={2}>
          <Col span={16}>
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
          <Col span={8} className={styles['start-timer']}>
            {loggedInUser?.user?.roles[0] === constants.roles?.Employee  ?
              <span>
                {props.timerBody}
              </span> : ''}
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default TaskDetail;
