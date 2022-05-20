import archiveImg from "../../assets/images/archive_btn.svg";

import styles from "./style.module.scss";

interface IProps {
  title: any;
  subText?: string;
}

const ArchiveBody = (props: IProps) => {
  return (
    <div className={styles["archive-message"]}>
      <div>
        <img src={archiveImg} alt="archive-confirm" />
      </div>{" "}
      <br />
      <p>
       {props.title}
      </p>
      <p className={styles["archive-text"]}>{props?.subText}</p>
    </div>
  );
};


export default ArchiveBody