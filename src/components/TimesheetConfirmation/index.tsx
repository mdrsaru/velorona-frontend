import archiveImg from "../../assets/images/archive_btn.svg";

import styles from "../Delete/style.module.scss";

interface IProps {
  title: any;
  subText?: string;
}
const TimesheetConfirmation = (props: IProps) => {
  return (
    <div className={styles["delete-message"]}>
      <div>
        <img src={archiveImg} alt="confirm" />
      </div>
      <br />
      <p style={{fontWeight:'600'}}>
        {props.title}
      </p>
      <p className={styles["warning-text"]}>
        {props?.subText}
      </p>
    </div>
  );
}

export default TimesheetConfirmation