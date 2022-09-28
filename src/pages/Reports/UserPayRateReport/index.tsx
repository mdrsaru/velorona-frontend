import { useEffect, useState } from 'react';
import { debounce } from 'lodash';
import { useLazyQuery, useQuery } from '@apollo/client';
import { Button, Card, Col, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { authVar } from '../../../App/link';
import { downloadCSV } from '../../../utils/common';
import PageHeader from '../../../components/PageHeader';
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { QueryUserPayRateArgs, UserPayRatePagingResult } from '../../../interfaces/generated';

import filterImg from '../../../assets/images/filter.svg';
import { notifyGraphqlError } from '../../../utils/error';
import { USER_PAY_RATE } from '../../../components/ViewUserPayRate';
import _ from 'lodash';

const csvHeader: Array<{ label: string; key: string; subKey?: string }> = [
	{ label: 'Employee Name', key: 'user', subKey: 'fullName' },
	{ label: 'Project Name', key: 'project', subKey: 'name' },
	{ label: 'Payrate(per hour)', key: 'amount' },
	{ label: 'Invoice rate(per hour)', key: 'invoiceRate' }
];

const { Option } = Select;

const UserPayRateReport = () => {
	const loggedInUser = authVar();
	const [filterForm] = Form.useForm();
	const [filterProperty, setFilterProperty] = useState<any>({
		filter: false,
	});


	const { data: userPayRateData} = useQuery<
		GraphQLResponse<'UserPayRate', UserPayRatePagingResult>,
		QueryUserPayRateArgs
	>(USER_PAY_RATE, {
		fetchPolicy: "network-only",
		variables: {
			input: {
				query: {
					company_id: loggedInUser?.company?.id as string,
				},
				paging: {
					order: ['updatedAt:DESC']
				}
			},
		},
	});

	const [fetchDownloadData,{refetch:refetchUserPayRate}] = useLazyQuery<
		GraphQLResponse<'UserPayRate', UserPayRatePagingResult>,
		QueryUserPayRateArgs
	>(USER_PAY_RATE, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				query: {
					company_id: loggedInUser?.company?.id as string,
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
		let values = filterForm.getFieldsValue(['user_id', 'project_id']);

		let input: {
			paging?: any;
			query: any;
		} = {
			paging: {
				order: ['updatedAt:DESC'],
			},
			query: {
				company_id: loggedInUser?.company?.id
			},
		};

		let query: {
			project_id?: string;
			user_id?: string;
			company_id:string;
		} = {
			company_id:loggedInUser?.company?.id as string
		};
		if (values.user_id) {
			query['user_id'] = values.user_id;
		}

		if (values.project_id) {
			query['project_id'] = values.project_id;
		}

		input['query'] = query;
		fetchDownloadData({
			variables: {
				input: input
			},
		}).then((response) => {
			if (response?.data) {
				downloadCSV(response?.data?.UserPayRate?.data, csvHeader, 'UserPayRate.csv');
			}
		})
	};

	const refetchUserPayRates = () => {
		let values = filterForm.getFieldsValue(['user_id', 'project_id']);

		let input: {
			paging?: any;
			query: any;
		} = {
			paging: {
				order: ['updatedAt:DESC'],
			},
			query: {
				company_id: loggedInUser?.company?.id
			},
		};

		let query: {
			project_id?: string;
			user_id?: string;
			company_id:string;
		} = {
			company_id: loggedInUser?.company?.id as string,
		};
		if (values.user_id) {
			query['user_id'] = values.user_id;
		}

		if (values.project_id) {
			query['project_id'] = values.project_id;
		}

		input['query'] = query;
		refetchUserPayRate({ input: input });
	};

	const onChangeFilter = () => {
		refetchUserPayRates();
	};

	const openFilterRow = () => {
		if (filterProperty?.filter) {
			refetchUserPayRate({
				input: {
					paging: {
						order: ['updatedAt:DESC'],
					},
					query: {
						company_id: loggedInUser?.company?.id as string
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

	const user_ids: any = [];
	const project_ids: any = []

	userPayRateData?.UserPayRate?.data?.forEach((userPayRate: any, index: number) => {
		project_ids.push({ id: userPayRate?.project?.id, name: userPayRate?.project?.name })
		user_ids.push({ id: userPayRate?.user?.id, name: userPayRate?.user?.fullName })
	})

	const unique_users = _.uniqWith(user_ids, _.isEqual);

	const unique_projects = _.uniqWith(project_ids, _.isEqual);


	return (
		<div>
			<Card bordered={false}>
				<PageHeader
					title='User Payrate Report'
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
								<Form.Item name='user_id' label=''>
									<Select placeholder='Select Users' onChange={onChangeFilter}>
										{unique_users?.map((user: any, index: number) => {
											return (
												<Option value={user?.id} key={index}>
													{user?.name}
												</Option>
											)
										})
										}

									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} sm={12} md={10} lg={8} xl={5}>
								<Form.Item name='project_id' label=''>
									<Select placeholder='Select Project' onChange={onChangeFilter}>
										{unique_projects?.map((project: any, index: number) => {
											return (
												<Option value={project?.id} key={index}>
													{project?.name}
												</Option>
											)
										})
										}

									</Select>
								</Form.Item>
							</Col>
						</Row>
					)}
				</Form>
				<Row>
					<Col span={24}>
						{!!userPayRateData?.UserPayRate?.data?.length ? (
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

export default UserPayRateReport;
