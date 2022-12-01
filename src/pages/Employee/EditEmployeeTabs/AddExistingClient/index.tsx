import { Input, Table, message, Select, Button } from "antd"
import { gql, useMutation, useQuery } from "@apollo/client";
import { ClientPagingResult, QueryClientArgs, UserClientDetail, QueryUserClientDetailArgs, MutationUserPayRateUpdateArgs, UserPayRate, MutationAttachProjectToUserArgs, User, MutationUserPayRateCreateArgs, MutationUserClientAssociateArgs, UserClient } from "../../../../interfaces/generated";
import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { useParams } from 'react-router-dom';
import { CLIENT } from "../../../Client";
import { authVar } from "../../../../App/link";
import { useState, useEffect } from "react";
import { USER_PAYRATE_UPDATE } from "../../../../components/EditUserPayRate";
import { PROJECT } from "../../../Project";
import Status from "../../../../components/Status";
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
		 invoiceRate
		 userRate
		 status
		 projectId 
		 userPayRateId
    }
  }
`;

const AddExistingClient = () => {
	const params = useParams()
	const authData = authVar();
	const navigate = useNavigate();
	
	const { data: userClientDetailData } = useQuery<
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

	const [associateClient] = useMutation<
		GraphQLResponse<'UserClientAssociate', UserClient>,
		MutationUserClientAssociateArgs
	>(ASSOCIATE_USER_WITH_CLIENT);

	const { data: projectData } = useQuery(PROJECT, {
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
		}
		})

	const [attachProject] = useMutation<
		GraphQLResponse<'ClientCreate', User>,
		MutationAttachProjectToUserArgs
	>(ATTACH_PROJECT, {
		onCompleted(response) {
			message.success('suceess')
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
		},
		onError(err) {
			return notifyGraphqlError(err);

		}
	})

	const onInputChange = (key: any, index: any) => (
		e: any
	) => {
		if (e.key === 'Enter') {
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
		const newData = {
			clientName: <Select onChange={handleAddClient} placeholder='Select client'>
				{
					clientData?.Client?.data?.map((client: any, index: number) => (
						<Select.Option value={client.id} key={index}>{client?.name}</Select.Option>

					))
				}
			</Select>,
			projectName: <Select onChange={handleChangeProject} placeholder='Select project' >
				{
					projectData &&
					projectData?.Project?.data?.map((project: any, index: number) => (
						<Select.Option value={project.id} key={index}>{project?.name}</Select.Option>

					))
				}
			</Select>
		};
		setDataSource([...dataSource, newData]);
	};
	const columns: any = [
		{
			title: 'Client Name',
			dataIndex: 'clientName',
		},
		{
			title: 'Project Name',
			dataIndex: 'projectName'
			// render: (data: any) => {
			// 	return (
			// 		<Select defaultValue={data?.projectName} onChange={handleChangeProject} >
			// 			{
			// 				projectData?.Project?.data?.map((project: any, index: number) => (
			// 					<Select.Option value={project.id} key={index}>{project?.name}</Select.Option>

			// 				))
			// 			}
			// 		</Select>
			// 	)
			// }
		},
		{
			title: 'User Rate',
			dataIndex: 'userRate',
			render: (rate: number, index: any) => {
				return <Input defaultValue={rate} onKeyPress={onInputChange("amount", index)} disabled={index?.projectId === null} title={index?.projectId === null ? 'You need to add project' : ''} />
			}
		},
		{
			title: 'Invoice Rate',
			dataIndex: 'invoiceRate',
			render: (rate: number, index: any) => {
				return <Input defaultValue={rate} onChange={onInputChange("invoiceRate", index)} disabled={index?.projectId === null} title={index?.projectId === null ? 'You need to add project' : ''} />
			}
		},
		{
			title: 'Status',
			dataIndex: 'status',
			render: (status: string) => <Status status={status} />,
		},

	];

	return (
		<div className={styles['modal-body']}>
			<div className={styles['header']}>
				<div>
					<span className={styles['add-title']}>Add Existing Client</span>
					</div>
				<div className={styles['add-new-client']}>
					<span onClick={()=>navigate(routes.addClient.path(
                  authData?.company?.code
                    ? authData?.company?.code
                    : ""
                ))}>
						Add New Client</span>
						</div>
			</div>
			{/* <br /><br /> */}
			<div className={styles['add-body']}>
				<Table
					dataSource={dataSource as any}
					columns={columns}
					pagination={false}
				/>
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

		</div>
	)
}

export default AddExistingClient
