import { Input, message, Select, Button, Form, Spin, Popconfirm, InputNumber } from "antd"
import { gql, useMutation, useQuery } from "@apollo/client";
import { ClientPagingResult, QueryClientArgs, UserClientDetail, QueryUserClientDetailArgs, MutationUserPayRateUpdateArgs, UserPayRate, MutationAttachProjectToUserArgs, User, MutationUserPayRateCreateArgs, MutationUserClientAssociateArgs, UserClient, UserClientStatus, MutationUserClientChangeStatusArgs, MutationRemoveUserProjectAssignArgs, Project, MutationUserPayRateDeleteArgs, CurrencyPagingResult, QueryCurrencyArgs } from "../../../../interfaces/generated";
import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { useParams } from 'react-router-dom';
import { CLIENT } from "../../../Client";
import { CloseCircleOutlined } from "@ant-design/icons"
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
import { CURRENCY } from "../../../Currency";
import AddNewProject from '../../../../components/AddNewProject/index';


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
		 invoiceRateCurrency
		 userRateCurrency
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

export const REMOVE_USER_PROJECT_ASSIGN = gql`
    mutation RemoveUserProjectAssign($input: RemoveProjectUserAssignInput!) {
      RemoveUserProjectAssign(input: $input) {
       id 
      }
    }
  `;

export const REMOVE_USER_PAYRATE = gql`
    mutation UserPayRateDelete($input: DeleteInput!) {
      UserPayRateDelete(input: $input) {
       id 
      }
    }
  `;


const AddExistingClient = () => {
	const params = useParams()
	const authData = authVar();
	const navigate = useNavigate();
	const [form] = Form.useForm()
	const [projects, setProject] = useState([])
	const [showRow, setShowRow] = useState(true)
	const [currencyId, setCurrencyId] = useState<any>()
	const [clientId, setClientId] = useState('')
	const [addProjectShow, setAddProjectShow] = useState(false)


	const { data: userClientDetailData, refetch: refetchUserClientDetail, loading } = useQuery<
		GraphQLResponse<'UserClientDetail', UserClientDetail[]>,
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
		setDataSource(userClientDetailData?.UserClientDetail);
		if (userClientDetailData?.UserClientDetail?.length) {
			setShowRow(false);
		}
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
		skip: !clientId,
		variables: {
			input: {
				query: {
					company_id: authData?.company?.id as string,
					client_id: clientId as string
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
			setClientId(response?.UserClientAssociate?.client?.id)
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


	const { data: currencyData } = useQuery<
		GraphQLResponse<'Currency', CurrencyPagingResult>,
		QueryCurrencyArgs
	>(CURRENCY, {
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-only',
		onCompleted(response) {
			const result = response?.Currency?.data?.filter(currency => currency.symbol === '$')
			setCurrencyId(result?.[0]?.id)
		}
	});

	const [userPayRateUpdate] = useMutation<
		GraphQLResponse<'UserPayRateUpdate', UserPayRate>, MutationUserPayRateUpdateArgs
	>(USER_PAYRATE_UPDATE, {

		onCompleted() {
			// message.success({
			// 	content: `User pay rate updated successfully!`,
			// 	className: "custom-message",
			// });
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
			// message.success({
			// 	content: `User pay rate added successfully!`,
			// 	className: "custom-message",
			// });
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
		GraphQLResponse<'UpdateUserClientStatus', UserClient>, MutationUserClientChangeStatusArgs>(USER_CLIENT_UPDATE_STATUS, {
			onCompleted() {
				window.location.reload()

				// refetchUserClientDetail({
				// 	input: {
				// 		company_id: authData?.company?.id as string,
				// 		user_id: params?.eid,
				// 	}

				// })
			}
		})


	const [removeProjectUserAssign] = useMutation<
		GraphQLResponse<'RemoveProjectUserAssign', Project>,
		MutationRemoveUserProjectAssignArgs
	>(REMOVE_USER_PROJECT_ASSIGN, {
		onCompleted() {

		}
	});

	const [removeUserPayRate] = useMutation<
		GraphQLResponse<'RemoveUserPayRate', UserPayRate>,
		MutationUserPayRateDeleteArgs
	>(REMOVE_USER_PAYRATE, {
		onCompleted() {

		}
	});
	const onInputChange = (key: any, index: any, value: any) => {
		if (index?.userPayRateId !== null) {
			userPayRateUpdate({
				variables: {
					input: {
						id: index?.userPayRateId,
						[key]: Number(value)
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
						[key]: Number(value),
						company_id: authData?.company?.id as string,
					}
				}
			})
		}

	};

	const onSelectCurrency = (key: any, id: any, index: any) => {
		if (index?.userPayRateId !== null) {
			userPayRateUpdate({
				variables: {
					input: {
						id: index?.userPayRateId,
						[key]: id
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
						[key]: id,
						company_id: authData?.company?.id as string,
					}
				}
			})
		}

	}
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


	const handleChangeStatus = (clientId: any, status: any) => {
		updateUserClientStatus({
			variables: {
				input: {
					user_id: params?.eid as string,
					client_id: clientId as string,
					company_id: authData?.company?.id as string,
					status: status
				}
			}
		})
	}

	const handleRemoveData = (projectId: string, userPayRateId: string) => {
		if (userPayRateId) {
			removeUserPayRate({
				variables: {
					input: {
						id: userPayRateId
					}
				}
			})
		}

		removeProjectUserAssign({
			variables: {
				input: {
					user_id: params?.eid as string,
					project_id: projectId,
					company_id: authData?.company?.id as string,
				}
			}
		})

		form.resetFields()

		refetchUserClientDetail({
			input: {
				company_id: authData?.company?.id as string,
				user_id: params?.eid,
			}
		})
	}

	const handleProjectAdd = () => {
		setAddProjectShow(!addProjectShow)
	}
	const tableData = dataSource?.map((data: any, index: number) => {
		return (
			<tr key={index} style={{ marginBottom: '2rem' }}>
				<td>{data.clientName}</td>
				<td>{data.projectName}</td>
				{/* <td>{data.status}</td> */}

				<td>
					<InputNumber
						addonBefore={
							<Select
								style={{ width: '5rem' }}
								defaultValue={data?.invoiceRateCurrency !== null ? data?.invoiceRateCurrency : currencyId ?? '$'}
								onSelect={(e: any) => onSelectCurrency('invoice_rate_currency_id', e, data)}

							>
								{currencyData?.Currency?.data?.map((currency, index) => (
									<Select.Option
										value={currency.id}
										key={index}
									>
										{currency.symbol}
									</Select.Option>
								))}
							</Select>}
						addonAfter="Hr"
						placeholder="Enter invoice rate"
						autoComplete="off"
						min={0}
						defaultValue={data.invoiceRate}
						onChange={(value) => onInputChange("invoiceRate", data, value)}
						style={{ width: '100%' }} />
				</td>
				<td width='auto'>
					<InputNumber
						addonBefore={
							<Select
								style={{ width: '5rem' }}
								defaultValue={data?.userRateCurrency !== null ? data?.userRateCurrency : currencyId ?? '$'}
								onSelect={(e: any) => onSelectCurrency('user_rate_currency_id', e, data)}
							>
								{currencyData?.Currency?.data?.map((currency, index) => (
									<Select.Option
										value={currency.id}
										key={index}
									>
										{currency.symbol}
									</Select.Option>
								))}
							</Select>
						}
						addonAfter="Hr"
						placeholder="Enter payrate"
						autoComplete="off"
						min={0}
						defaultValue={data.userRate}
						onChange={(value) => onInputChange("amount", data, value)}
						style={{ width: '100%' }} />
				</td>
				<td width='150px'>
					<Select onSelect={(e: any) => handleChangeStatus(data.clientId, e)} placeholder='Select status' defaultValue={data.status}>
						<Select.Option value={UserClientStatus.Active}>{UserClientStatus.Active}</Select.Option>
						<Select.Option value={UserClientStatus.Inactive}>{UserClientStatus.Inactive}</Select.Option>

					</Select>
				</td>
				<td>
					<Popconfirm
						placement="topLeft"
						title='Are you sure you want to delete? Once deleted, it cannot be retrieved'
						onConfirm={() => handleRemoveData(data.projectId, data.userPayRateId)}
						okText="Yes"
						cancelText="No"
					>
						<CloseCircleOutlined />
					</Popconfirm>
				</td>
			</tr>
		)
	})
	return (
		<div className={styles['modal-body']}>
			<div className={styles['header']}>
				<div>
					<span className={styles['add-title']}>Client Information</span>
					{!dataSource?.length &&
						<h3>To generate the invoice for this user, it is necessary to include the rates for the client and project.</h3>
					}
				</div>
				<div className={styles['add-new-client']}>
					<span style={{ cursor: 'pointer' }}
						onClick={() => navigate(routes.addNewClient.path(
							authData?.company?.code
								? authData?.company?.code
								: "",
							params.eid as string
						))}>
						Add New Client</span>
				</div>
			</div>
			{loading && <Spin />}
			<div className={styles['detail-table']}>

				<Form form={form}>
					<table className={styles['main-table']}>
						<thead>
							<tr className={styles['table-header']}>
								<th>Client Name</th>
								<th>Project Name</th>
								<th>Invoice Rate</th>
								<th>User Rate</th>
								<th>Status</th>
								<th>Action</th>
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
									{clientId ?
										<td>
											<Form.Item
												name="project1"
												rules={[{
													required: true,
													message: 'Choose the Project'
												}]}>
												{
													projects?.length ?

														(<Select onChange={handleChangeProject} placeholder='Select project' >
															<>
																{projects?.map((project: any, index: number) => (

																	<Select.Option value={project.id} key={index}>{project?.name}</Select.Option>

																))
																}

																<Select.Option>
																	<p onClick={() => handleProjectAdd()} >Add New Project</p>
																</Select.Option>
															</>

														</Select>)

														:
														(
															<Button onClick={() => handleProjectAdd()} disabled={!clientId}>Add New Project</Button>
														)

												}

											</Form.Item>

										</td>
										:
										<td>
											<Form.Item>
												<Select onChange={handleChangeProject} placeholder='Select project' disabled >
												</Select>
											</Form.Item>
										</td>

									}
									<td>
										<Form.Item>
											<Input onKeyPress={(e) => onInputChange("amount", 0, e)} disabled={true} title={'You need to add project'} />
										</Form.Item>
									</td>
									<td>
										<Form.Item>
											<Input onKeyPress={(e) => onInputChange("invoiceRate", 0, e)} disabled={true} title='You need to add project' />
										</Form.Item>
									</td>
									<td>-</td>

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
					marginTop: 4,
				}}
			>
				Add a row
			</Button>

			<AddNewProject
				visibility={addProjectShow}
				setVisibility={setAddProjectShow}
				clientId={clientId}
				handleChangeProject={handleChangeProject}
			/>
		</div>
	)
}

export default AddExistingClient
