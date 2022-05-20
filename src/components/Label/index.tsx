
import styles from './style.module.scss';

interface IProps {
  label: string;
}

const Label = (props: IProps) => {
  return (
    <div className={styles['label']}>
      <label>{props.label}</label>
    </div>
  )
}

export default Label;
