import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

import styles from './style.module.scss';

const DropdownMenu = (props: { title: string; spanClass: string }) => {
  const menu = (
    <Menu>
      <Menu.Item key="1">Week 1</Menu.Item>
      <Menu.Item key="2">Year 2021</Menu.Item>
      <Menu.Item key="3">Year 2022</Menu.Item>
    </Menu>
  );
  return (
    <Dropdown overlay={menu} className={styles['drop-down']}>
      <div className="ant-dropdown-link" onClick={e => e.preventDefault()}>
        <span className={styles[props.spanClass]}>{props?.title}</span> <DownOutlined/>
      </div>
    </Dropdown>
  )
}

export default DropdownMenu;
