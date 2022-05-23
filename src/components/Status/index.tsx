import styles from "./style.module.scss";

interface IProps {
  status: string;
}
const Status = (props: IProps) => {
  const status = props.status;

  return <span className={styles[status]}>{status}</span>;
};

export default Status;
