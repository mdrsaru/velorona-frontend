import { CloseOutlined, LinkOutlined } from "@ant-design/icons";
import { useMutation } from "@apollo/client";
import { Col, message, Modal, Row, Select } from "antd";
import parse from "html-react-parser";
import { authVar } from "../../App/link";
import { TaskStatus } from "../../interfaces/generated";
import { TASK_UPDATE } from "../../pages/Project/DetailProject";
import { notifyGraphqlError } from "../../utils/error";
import Status from "../Status";
import styles from "./styles.module.scss";

interface IProps {
  visibility: boolean;
  setVisibility: any;
  data: any;
  employee?: boolean;
}

const TaskDetail = (props: IProps) => {
  const task = props?.data;
  const loggedInUser = authVar();
  const [taskUpdate] = useMutation(TASK_UPDATE, {
    onCompleted() {
      message.success({
        content: `Status is updated successfully!`,
        className: "custom-message",
      });
    },
    onError(err) {
      notifyGraphqlError(err);
    },
    update(cache) {
      const normalizedId = cache.identify({ id: task.id, __typename: "Task" });
      cache.evict({ id: normalizedId });
      cache.gc();
    },
  });

  const status = Object.values(TaskStatus);

  const onStatusChange = (value: any) => {
    taskUpdate({
      variables: {
        input: {
          id: task?.id,
          company_id: loggedInUser?.company?.id,
          status: value,
        },
      },
    });
  };

  return (
    <>
      <Modal
        centered
        visible={props?.visibility}
        closeIcon={[
          <div onClick={() => props?.setVisibility(false)}>
            <span className={styles["close-icon-div"]}>
              <CloseOutlined />
            </span>
          </div>,
        ]}
        footer={[
          <div className={styles["modal-footer"]}>
            {task?.attachments?.length ? (
              <>
                <span>Attachments</span> &nbsp; &nbsp;
                {task?.attachments?.map((attachment: any, index: number) => (
                  <div key={index}>
                    <span className={styles["file-attach"]}>
                      <LinkOutlined />
                    </span>{" "}
                    &nbsp;
                    <span className={styles["file-name"]}>
                      <a href={attachment.url} target="_blank" rel="noreferrer">
                        {attachment.name}
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
        width={869}>
        <div className={styles["modal-body"]}>
          <div>
            <Row>
              <Col lg={8}>
                <span className={styles["task-title"]}>{task?.name}</span>
              </Col>
              {props?.employee ? (
                <Col lg={6}>
                  <Select
                    placeholder="Select State"
                    onChange={onStatusChange}
                    defaultValue={task?.status}
                  >
                    {status?.map((status, index) => (
                      <Select.Option value={status} key={index}>
                        {status}
                      </Select.Option>
                    ))}
                  </Select>
                </Col>
              )
            :
            <div className={styles["status-div"]}>
                <Status status = {task?.active ? 'Active' : 'Inactive'}/>
              </div>
            }
            </Row>
          </div>
          <br />
          <br />
          <div className={styles["task-body"]}>{parse(task?.description)}</div>
        </div>
      </Modal>
    </>
  );
};

export default TaskDetail;
