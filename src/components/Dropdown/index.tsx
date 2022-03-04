import { Dropdown, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";

import styles from './style.module.scss';

const DropdownMenu = (props: { title: string }) => {
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
        <span>{props?.title}</span> <DownOutlined/>
      </div>
    </Dropdown>
  )
}

export default DropdownMenu;
