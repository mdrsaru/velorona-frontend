import deleteImg from "../../assets/images/delete_btn.svg";

import styles from "./style.module.scss";

interface IProps {
  title: any;
  subText?: any;
}

 const DeleteBody = (props: IProps) => {
  return (
    <div className={styles["delete-message"]}>
      <div>
        <img src={deleteImg} alt="confirm" />
      </div>
      <br />
      <p>
     {props.title}
      </p>
      <p className={styles["warning-text"]}>
       {props?.subText}
      </p>
    </div>
  );
};

export default DeleteBody
