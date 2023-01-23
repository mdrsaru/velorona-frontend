import { Card, Tabs } from "antd"

import EditEmployee from "../EditEmployee"
import AddExistingClient from "./AddExistingClient"
import { useParams } from 'react-router-dom';
import { useQuery } from "@apollo/client";
import { USER } from "..";
import { RoleName } from "../../../interfaces/generated";

const EditEmployeeTabs = () => {
	const params = useParams()

	const { data: userData} = useQuery(USER, {
		variables: {
			input: {
				query: {
					id: params?.eid,
				},
			},
		},

	});

	let isEmployee = userData?.User?.data?.[0]?.roles?.[0]?.name === RoleName.Employee

	return (
		<Card>
			<h1  style={{textTransform:'capitalize', marginBottom:'1.5rem'}}>{userData?.User?.data?.[0]?.fullName} {userData?.User?.data?.[0]?.designation && <span>({userData?.User?.data?.[0]?.designation})</span>}</h1>
			<Tabs type='card' defaultActiveKey={params.client ? "client-info" : "user-info"}>
				<Tabs.TabPane tab="User Info" key="user-info" style={{ fontSize: '2rem' }}>
					<EditEmployee />
				</Tabs.TabPane>
				{/* {
					isEmployee && */}
					<Tabs.TabPane tab="Client Info" key="client-info" disabled={!isEmployee}>
						<AddExistingClient />
					</Tabs.TabPane>
				 {/* } */}
			</Tabs>
		</Card>
	)
}

export default EditEmployeeTabs