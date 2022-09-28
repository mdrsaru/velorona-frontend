import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Card, Col, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import PageHeader from '../../../components/PageHeader';
import { status } from '../../../config/constants';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import {  UserClientPagingResult, QueryUserClientArgs } from '../../../interfaces/generated';

import filterImg from '../../../assets/images/filter.svg';
import { USERCLIENT } from '../../Employee/DetailEmployee';
import { notifyGraphqlError } from '../../../utils/error';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
	{ label: 'Employee Name', key: 'user',subKey:'fullName' },
	{ label: 'Client Name', key: 'client',subKey:'name' },
	{ label: 'Status', key: 'status' },
];

const { Option } = Select;

const EmployeeClientReport = () => {
	const loggedInUser = authVar();
	const [filterForm] = Form.useForm();
	const [filterProperty, setFilterProperty] = useState<any>({
		filter: false,
	});

	const { data: employeeClientData, refetch: refetchEmployeeClient  } = useQuery<
		GraphQLResponse<'UserClient', UserClientPagingResult>,
		QueryUserClientArgs
	>(USERCLIENT, {
		fetchPolicy: "network-only",
		variables: {
			input: {
				query: {
					company_id:loggedInUser?.company?.id as string,
				},
				paging: {
					order: ['updatedAt:DESC']
				}
			},
		},
	});
	const [fetchDownloadData] = useLazyQuery<
		GraphQLResponse<'UserClient', UserClientPagingResult>,
		QueryUserClientArgs
	>(USERCLIENT, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				query: {
					company_id:loggedInUser?.company?.id as string,
				},
				paging: {
					order: ['updatedAt:DESC'],
				},
			},
		},
		onError: notifyGraphqlError,
	})
	;

	const downloadReport = () => {
		let values = filterForm.getFieldsValue(['status']);

		let input: {
			paging?: any;
			query: any;
		} = {
			paging: {
				order: ['updatedAt:DESC'],
			},
			query: {
				company_id: loggedInUser?.company?.id,
			},
		};

		let query: {
			status?: string;
			company_id:string;
		} = {
			company_id: loggedInUser?.company?.id as string,
		};

		if (values.status === 'Active' || values.status === 'Inactive') {
			query['status'] = values.status;
		}

		input['query'] = query;
		fetchDownloadData({
			variables: {
				input: input
			},
		}).then((response)=>{
			if(response?.data){
			downloadCSV(response?.data?.UserClient?.data, csvHeader, 'UserClient.csv');
			}
		})
	};

	const refetchEmployeeClients = () => {
		let values = filterForm.getFieldsValue(['role', 'status', 'archived']);

		let input: {
			paging?: any;
			query: any;
		} = {
			paging: {
				order: ['updatedAt:DESC'],
			},
			query: {
				company_id:loggedInUser?.company?.id as string
			},
		};

		let query: {
			status?: string;
			company_id:string;
		} = {
			company_id:loggedInUser?.company?.id as string
		};

		if (values.status === 'Active' || values.status === 'Inactive') {
			query['status'] = values.status;
		}

		input['query'] = query;
		refetchEmployeeClient({ input: input });
	};

	const onChangeFilter = () => {
		refetchEmployeeClients();
	};

	const openFilterRow = () => {
		if (filterProperty?.filter) {
			refetchEmployeeClient({
				input: {
					paging: {
						order: ['updatedAt:DESC'],
					},
					query: {
						company_id:loggedInUser?.company?.id as string
					},
				},
			});
		}
		filterForm.resetFields();
		setFilterProperty({
			filter: !filterProperty?.filter,
		});
	};

	const debouncedResults = debounce(() => {
		onChangeFilter();
	}, 600);

	useEffect(() => {
		return () => {
			debouncedResults.cancel();
		};
	});

	return (
		<div>
			<Card bordered={false}>
				<PageHeader
					title='Employee Client Report'
					extra={[
						<Button key='btn-filter' type='text' onClick={openFilterRow} icon={<img src={filterImg} alt='filter' />}>
							&nbsp; &nbsp;
							{filterProperty?.filter ? 'Reset' : 'Filter'}
						</Button>,
					]}
				/>

				<Form form={filterForm} layout='vertical' onFinish={() => { }} autoComplete='off' name='filter-form'>
					{filterProperty?.filter && (
						<Row gutter={[20, 20]}>
							<Col xs={24} sm={12} md={10} lg={8} xl={5}>
								<Form.Item name='status' label=''>
									<Select placeholder='Select status' onChange={onChangeFilter}>
										{status?.map((status: any) => (
											<Option value={status?.value} key={status?.name}>
												{status?.name}
											</Option>
										))}
									</Select>
								</Form.Item>
							</Col>
						</Row>
					)}
				</Form>
				<Row>
					<Col span={24}>
						{!!employeeClientData?.UserClient?.data?.length ? (
							<Button type='link' onClick={downloadReport} icon={<DownloadOutlined />}>
								Download Report
							</Button>
						) : (
							<Typography.Text type='secondary'>No files to Download</Typography.Text>
						)}
					</Col>
				</Row>
			</Card>
		</div>
	);
};

export default EmployeeClientReport;
