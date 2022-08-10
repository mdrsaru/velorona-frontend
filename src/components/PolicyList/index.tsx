import { Space } from "antd";
import styles from './styles.module.scss'

const PolicyList = ({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <Space size={22} direction="vertical">
      <p className={styles['title']}>
        {title}
      </p>
      <p className={styles['description']}>
        {" "}
        {description}
      </p>
    </Space>
  );
};

export default PolicyList;
