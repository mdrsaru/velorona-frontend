
import styles from "../EmployeeCard/styles.module.scss";

interface IProps {
    title: string;
}

const TitleCard = (props: IProps) => {

    return (
        <div className={styles["title-card"]}>
            <span className={styles.title}>
                {props?.title}
            </span>
        </div>
    );
};

export default TitleCard;
