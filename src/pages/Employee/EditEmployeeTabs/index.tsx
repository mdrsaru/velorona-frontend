import { Card, Tabs } from "antd"

import EditEmployee from "../EditEmployee"
import AddExistingClient from "./AddExistingClient"

const EditEmployeeTabs = () => {
	return (
		<Card>
			<Tabs type='card'>
				<Tabs.TabPane tab="User Info" key="item-1" style={{fontSize:'2rem'}}>
					<EditEmployee />
				</Tabs.TabPane>
				<Tabs.TabPane tab="Client Info" key="item-2">
					<AddExistingClient />
				</Tabs.TabPane>
			</Tabs>;
		</Card>
	)
}

export default EditEmployeeTabs