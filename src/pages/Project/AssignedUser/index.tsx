import { Button, Col, Empty, Form, Modal, Row, Select, Space } from 'antd'
import { CloseOutlined } from '@ant-design/icons';


import styles from './styles.module.scss'
import { useMutation, useQuery } from '@apollo/client';
import {  MutationProjectUpdateArgs, Project,UserClientPagingResult, QueryUserClientArgs } from '../../../interfaces/generated';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { authVar } from '../../../App/link';
import { USERCLIENT } from '../../Employee/DetailEmployee';
import { PROJECT_UPDATE } from '..';

interface IProps {
	visibility: boolean;
	setVisibility: any;
	project: any;
	refetch?: any;
}
const AssignedUser = (props: IProps) => {
	const [form] = Form.useForm();
	const { Option } = Select;
	const loggedInUser = authVar();

	const selectProps = {
		placeholder: "Select Employees",
		mode: "multiple" as const,
		style: { width: "100%" }
	};

	const { data: userClientData } = useQuery<GraphQLResponse<'UserClient', UserClientPagingResult>, QueryUserClientArgs>(USERCLIENT, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				query: {
					client_id: props?.project?.client?.id as string
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			},
		},
	});

	let userClientList = userClientData?.UserClient?.data?.filter(function (userClient) {
		return userClient?.user
	}
	);


	const [projectUpdate] = useMutation<GraphQLResponse<'ProjectUpdate', Project>, MutationProjectUpdateArgs>(PROJECT_UPDATE, {
		onCompleted() {
			props.refetch({
				query: {
					company_id: loggedInUser?.company?.id ?? '',
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			})
			props.setVisibility(false)
		}
	})

	const onSubmitForm = (values: any) => {
		projectUpdate({
			variables: {
				input: {
					id: props?.project?.id as string,
					company_id: loggedInUser?.company?.id as string,
					user_ids: values?.assignee,
				}
			}
		})
	}

	return (
		<Modal
			centered
			visible={props?.visibility}
			className={styles['attach-timesheet']}
			closeIcon={[
				<div onClick={() => props?.setVisibility(false)} key={1}>
					<span className={styles["close-icon-div"]}>
						<CloseOutlined />
					</span>
				</div>,
			]}
			width={869}
			footer={null}>
			<div className={styles["modal-body"]}>
				<div className={styles['title-div']}>
					<span className={styles["title"]}>
						Project : {props?.project?.name}
					</span>
				</div>
				<p className={styles['sub-title']}>Assigned User</p>
				{props.project?.users?.length ?
					<ul>
						{props.project?.users?.map((user: any, index: number) => (
							<li key={index}>{user.fullName}/{user.email}</li>
						))
						}
					</ul>
					:
					<Empty description='No Employee assigned yet' />
				}

				<Form
					form={form}
					layout="vertical"
					onFinish={onSubmitForm}
					initialValues={{
						assignee: props?.project?.users?.map((user: any) => {
							return user?.id
						}) ?? "",
					}}
				>
					<Row className={styles.formCol}>
						<Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>
							<Form.Item
								name="assignee"
								label="Tasks Assigned to"
								style={{ position: "relative" }}>
								<Select
									{...selectProps}
									allowClear
									placeholder="Please select">
									{userClientList &&
										userClientList?.map((userClient, index: number) => (
											<Option
												value={userClient?.user?.id}
												key={index}>
												{userClient?.user?.fullName} / {userClient?.user?.email}
											</Option>
										))}
								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Row justify="end">
						<Col>
							<Form.Item>
								<Space>
									<Button type="primary" htmlType="submit">Assign User</Button>
								</Space>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</div>
		</Modal>
	)
}

export default AssignedUser
