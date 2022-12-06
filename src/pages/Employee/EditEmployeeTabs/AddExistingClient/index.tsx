import { Input, message, Select, Button, Form } from "antd"
import { gql, useMutation, useQuery } from "@apollo/client";
import { ClientPagingResult, QueryClientArgs, UserClientDetail, QueryUserClientDetailArgs, MutationUserPayRateUpdateArgs, UserPayRate, MutationAttachProjectToUserArgs, User, MutationUserPayRateCreateArgs, MutationUserClientAssociateArgs, UserClient, UserClientStatus, MutationUserClientChangeStatusArgs } from "../../../../interfaces/generated";
import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { useParams } from 'react-router-dom';
import { CLIENT } from "../../../Client";
import { authVar } from "../../../../App/link";
import { useState, useEffect } from "react";
import { USER_PAYRATE_UPDATE } from "../../../../components/EditUserPayRate";
import { PROJECT } from "../../../Project";
import { ATTACH_PROJECT } from "../../AttachProject";
import { USER_PAYRATE_CREATE } from "../../../../components/UserPayRate";
import { notifyGraphqlError } from "../../../../utils/error";
import { ASSOCIATE_USER_WITH_CLIENT } from "../../EditEmployee/AttachClient";
import routes from "../../../../config/routes";
import { useNavigate } from 'react-router-dom';

import styles from '../../style.module.scss'


export const USER_CLIENT_DETAIL = gql`
  query UserClientDetail($input: UserClientQuery!) {
    UserClientDetail(input: $input) {
     user_id
		 projectName
		 clientName
		 clientId
		 invoiceRate
		 userRate
		 status
		 projectId 
		 userPayRateId
    }
  }
`;

export const USER_CLIENT_UPDATE_STATUS = gql`
    mutation UserClientChangeStatus($input: UserClientChangeStatusInput!) {
      UserClientChangeStatus(input: $input) {
       status
			 user_id 
			 client_id 
      }
    }
  `;


const AddExistingClient = () => {
	const params = useParams()
	const authData = authVar();
	const navigate = useNavigate();
	const [form] = Form.useForm()
	const [client, setClient] = useState('')
	const [projects, setProject] = useState([])
	const [showRow, setShowRow] = useState(false)


	const { data: userClientDetailData, refetch:refetchUserClientDetail } = useQuery<
		GraphQLResponse<'UserClientDetail', UserClientDetail>,
		QueryUserClientDetailArgs
	>(USER_CLIENT_DETAIL, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				company_id: authData?.company?.id as string,
				user_id: params?.eid,
			}
		}
	})
	const [dataSource, setDataSource] = useState<any>([]);

	useEffect(() => {
		setDataSource(userClientDetailData?.UserClientDetail)
	}, [userClientDetailData?.UserClientDetail])

	const { data: clientData } = useQuery<
		GraphQLResponse<'Client', ClientPagingResult>,
		QueryClientArgs
	>(CLIENT, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		variables: {
			input: {
				query: {
					company_id: authData?.company?.id as string,
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			},
		},
	});

	const { refetch: refetchProject } = useQuery(PROJECT, {
		fetchPolicy: "network-only",
		nextFetchPolicy: "cache-first",
		skip: !client,
		variables: {
			input: {
				query: {
					company_id: authData?.company?.id as string,
					client_id: client as string
				},
				paging: {
					order: ["updatedAt:DESC"],
				},
			},
		}
	})

	const [associateClient] = useMutation<
		GraphQLResponse<'UserClientAssociate', UserClient>,
		MutationUserClientAssociateArgs
	>(ASSOCIATE_USER_WITH_CLIENT, {
		onCompleted(response) {
			form.resetFields(['project'])
			refetchUserClientDetail({
				input: {
					company_id: authData?.company?.id as string,
					user_id: params?.eid,
				}

			})
			refetchProject({
				input: {
					query: {
						company_id: authData?.company?.id as string,
						client_id: response?.UserClientAssociate?.client?.id
					},
					paging: {
						order: ["updatedAt:DESC"],
					},
				}
			})
				.then((response) => {
					setProject(response.data.Project.data)
				})
		}
	});

	const [attachProject] = useMutation<
		GraphQLResponse<'ClientCreate', User>,
		MutationAttachProjectToUserArgs
	>(ATTACH_PROJECT, {
		onCompleted() {
			setShowRow(false)
			refetchUserClientDetail({
				input: {
					company_id: authData?.company?.id as string,
					user_id: params?.eid,
				}
   
		})
		}
	});

	const [userPayRateUpdate] = useMutation<
		GraphQLResponse<'UserPayRateUpdate', UserPayRate>, MutationUserPayRateUpdateArgs
	>(USER_PAYRATE_UPDATE, {

		onCompleted() {
			message.success({
				content: `User pay rate updated successfully!`,
				className: "custom-message",
			});
			refetchUserClientDetail({
				input: {
					company_id: authData?.company?.id as string,
					user_id: params?.eid,
				}

		})
		},
		onError(err) {
			return message.error('You can not add pay rate to already existing project')

		}
	})

	const [userPayRateCreate] = useMutation<
		GraphQLResponse<'UserPayRateCreate', UserPayRate>, MutationUserPayRateCreateArgs
	>(USER_PAYRATE_CREATE, {

		onCompleted() {
			message.success({
				content: `User pay rate added successfully!`,
				className: "custom-message",
			});
			refetchUserClientDetail({
				input: {
					company_id: authData?.company?.id as string,
					user_id: params?.eid,
				}

			})
		},
		onError(err) {
			return notifyGraphqlError(err);

		}
	})

	const [updateUserClientStatus] = useMutation<
	GraphQLResponse<'UpdateUserClientStatus', UserClient>, MutationUserClientChangeStatusArgs>(USER_CLIENT_UPDATE_STATUS,{
		onCompleted(){
			refetchUserClientDetail({
				input: {
					company_id: authData?.company?.id as string,
					user_id: params?.eid,
				}

			})
		}
	})

	const onInputChange = (key: any, index: any) => (
		e: any
	) => {
		if (index?.userPayRateId !== null) {
			userPayRateUpdate({
				variables: {
					input: {
						id: index?.userPayRateId,
						[key]: Number(e.target.value)
					}
				}
			})
		}
		else {
			userPayRateCreate({
				variables: {
					input: {
						user_id: params?.eid as string,
						project_id: index?.projectId,
						[key]: Number(e.target.value),
						company_id: authData?.company?.id as string,
					}
				}
			})
		}
		
	};

	const handleChangeProject = (id: string) => {

		attachProject({
			variables: {
				input: {
					user_id: [params?.eid as string],
					project_ids: [id],
				}
			}
		})
	}

	const handleAddClient = (id: string) => {
		associateClient({
			variables: {
				input: {
					user_id: params?.eid as string,
					client_id: id as string,
					company_id: authData?.company?.id as string
				}
			}
		})
	}

	const handleAdd = () => {
		form.resetFields()
		setShowRow(!showRow)
	};


	const handleChangeStatus = (clientId:any,status:any) => {
		console.log(status,clientId, 'e')
		updateUserClientStatus({
			variables:{
				input:{
					user_id: params?.eid as string,
					client_id: clientId as string,
					company_id: authData?.company?.id as string,
					status:status
				}
			}
		})
	}
	const tableData = dataSource?.map((data: any, index: number) => (
		<tr>
			<td>{data.clientName}</td>
			<td>{data.projectName}</td>
			<td><Input defaultValue={data.userRate} onKeyPress={onInputChange("amount", data)} /></td>
			<td><Input defaultValue={data.invoiceRate} onKeyPress={onInputChange("invoiceRate", data)} /></td>
			{/* <td>{data.status}</td> */}
			<td>
				<Select onSelect={(e:any)=>handleChangeStatus(data.clientId,e)} placeholder='Select status' defaultValue={data.status}>
					<Select.Option value={UserClientStatus.Active}>{UserClientStatus.Active}</Select.Option>
					<Select.Option value={UserClientStatus.Inactive}>{UserClientStatus.Inactive}</Select.Option>

				</Select>
			</td>
		</tr>
	))
	return (
		<div className={styles['modal-body']}>
			<div className={styles['header']}>
				<div>
					<span className={styles['add-title']}>Add Existing Client</span>
				</div>
				<div className={styles['add-new-client']}>
					<span onClick={() => navigate(routes.addClient.path(
						authData?.company?.code
							? authData?.company?.code
							: ""
					))}>
						Add New Client</span>
				</div>
			</div>


			<div className={styles['detail-table']}>

				<Form form={form}>
					<table className={styles['main-table']}>
						<thead>
							<tr className={styles['table-header']}>
								<th>Client Name</th>
								<th>Project Name</th>
								<th>User Rate</th>
								<th>Invoice Rate</th>
								<th>Status</th>
							</tr>
						</thead>

						<tbody>
							{tableData}

							{showRow &&
								<tr>

									<td>
										<Form.Item
											name="client"
											rules={[{
												required: true,
												message: 'Choose the client'
											}]}>
											<Select onChange={handleAddClient} placeholder='Select client'>
												{
													clientData?.Client?.data?.map((client: any, index: number) => (
														<Select.Option value={client.id} key={index}>{client?.name}</Select.Option>

													))
												}
											</Select>
										</Form.Item>
									</td>
									<td>
										<Form.Item
											name="project1"
											rules={[{
												required: true,
												message: 'Choose the client'
											}]}>

											<Select onChange={handleChangeProject} placeholder='Select project' >
												{
													projects &&
													projects?.map((project: any, index: number) => (
														<Select.Option value={project.id} key={index}>{project?.name}</Select.Option>

													))
												}
											</Select>
										</Form.Item>

									</td>
									<td>
										<Input onKeyPress={onInputChange("amount", 0)} disabled={true} title={'You need to add project'}/>
									</td>
									<td>
										<Input onKeyPress={onInputChange("invoiceRate", 0)} disabled={true} title='You need to add project'/>
									</td>
									<td>N/A</td>

								</tr>
							}
						</tbody>
					</table>
				</Form>
			</div>
			<Button
				onClick={handleAdd}
				type="primary"
				style={{
					marginBottom: 16,
				}}
			>
				Add a row
			</Button>
		</div>
	)
}

export default AddExistingClient
