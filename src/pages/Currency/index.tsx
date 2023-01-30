import { gql, useQuery } from "@apollo/client";
import { Card, Col, Dropdown, Menu, Row, Table } from "antd";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import { useState } from "react";
import { FormOutlined } from '@ant-design/icons';

import constants from "../../config/constants";
import { CurrencyPagingResult, QueryCurrencyArgs } from "../../interfaces/generated";
import { GraphQLResponse } from "../../interfaces/graphql.interface";

import styles from './style.module.scss'
import routes from "../../config/routes";
import PageHeader from "../../components/PageHeader";

export const CURRENCY = gql`
  query Currency($input:CurrencyQueryInput) {
    Currency(input:$input) {
      paging {
        total
      }
      data {
        id
        name
				symbol
				createdAt
       }
  }
}
`
const Currency = () => {
	const navigate = useNavigate()

	const { data: currencyData, loading: dataLoading } = useQuery<
		GraphQLResponse<'Currency', CurrencyPagingResult>,
		QueryCurrencyArgs
	>(CURRENCY, {
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-only'
	});

	const [pagingInput, setPagingInput] = useState<{
		skip: number,
		currentPage: number,
	}>({
		skip: 0,
		currentPage: 1,
	});

	const changePage = (page: number) => {
		const newSkip = (page - 1) * constants.paging.perPage;
		setPagingInput({
			...pagingInput,
			skip: newSkip,
			currentPage: page,
		});
	};

	const columns = [
		{
			title: 'Name',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Symbol',
			dataIndex: 'symbol',
			key: 'symbol'
		},
		{
			title: 'Created At',
			dataIndex: 'createdAt',
			key: 'createdAt',
			render: (createdAt: string) =>
				<span>
					{moment(createdAt).format('YYYY/MM/DD')}
				</span>
		},
		{
			title: 'Actions',
			key: 'actions',
			render: (data: any) =>
				<Row style={{ marginTop: '11px' }}>
					<Col>
					<div
					onClick={() => navigate(routes.editCurrency.path(data?.id ?? '1'))}>
					<FormOutlined/>
				</div>

					</Col>
					</Row>
		}
	];

	return (
		<div className={styles['currency-main-div']}>
			<Card bordered={false}>
				<PageHeader
					title="Currency"
					extra={[
						<div className={styles['add-new-currency']} key="new-currency">
							<Link to={routes.addCurrency.path}>
								Add Currency
							</Link>
						</div>
					]}
				/>
				<Row className='container-row' style={{ marginTop: '2rem' }}>
					<Col span={24}>
						<Table
							loading={dataLoading}
							dataSource={currencyData?.Currency?.data}
							columns={columns}
							rowKey={(record => record?.id)}
							pagination={{
								current: pagingInput.currentPage,
								onChange: changePage,
								total: currencyData?.Currency?.paging?.total,
								pageSize: constants.paging.perPage
							}} />
					</Col>
				</Row>
			</Card>
		</div>
	)
}

export default Currency