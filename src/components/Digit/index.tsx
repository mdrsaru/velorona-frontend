
interface IProps {
  value: number;
}

const Digit = (props: IProps) => {
  let value = props.value;
  if(value < 10) {
    return <span>0{value}</span>
  }

  return <span>{value}</span>
}

export default Digit;
