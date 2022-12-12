import { Card, Tabs } from "antd"

import EditEmployee from "../EditEmployee"
import AddExistingClient from "./AddExistingClient"
import { useParams } from 'react-router-dom';

const EditEmployeeTabs = () => {
	const params = useParams()

	return (
		<Card>
			<Tabs type='card' defaultActiveKey={params.client ? "client-info":"user-info"}>
				<Tabs.TabPane tab="User Info" key="user-info" style={{fontSize:'2rem'}}>
					<EditEmployee />
				</Tabs.TabPane>
				<Tabs.TabPane tab="Client Info" key="client-info">
					<AddExistingClient />
				</Tabs.TabPane>
			</Tabs>
		</Card>
	)
}

export default EditEmployeeTabs