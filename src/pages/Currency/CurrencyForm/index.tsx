import { Form, Row, Col, Input, Button, Space, message } from "antd"
import routes from "../../../config/routes"
import {  Currency, CurrencyCreateInput, CurrencyUpdateInput, MutationCurrencyCreateArgs, MutationCurrencyUpdateArgs } from "../../../interfaces/generated"
import { useNavigate } from 'react-router-dom';
import { notifyGraphqlError } from "../../../utils/error";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { gql, useMutation } from "@apollo/client";
import { useParams } from 'react-router-dom';

const CURRENCY_CREATE = gql`
  mutation CurrencyCreate($input: CurrencyCreateInput!) {
    CurrencyCreate(input: $input) {
      id
      name
			symbol
    }
  }
`;

const CURRENCY_UPDATE = gql`
  mutation CurrencyUpdate($input: CurrencyUpdateInput!) {
    CurrencyUpdate(input: $input) {
      id
      name
			symbol
    }
  }
`;


interface IProps {
	currency?: Currency
}

const CurrencyForm = (props: IProps) => {
	const [form] = Form.useForm();
	const params = useParams();

	const navigate = useNavigate()


	const [createCurrency, { loading: creatingCurrency }] = useMutation<
		GraphQLResponse<'CurrencyCreate', Currency>,
		MutationCurrencyCreateArgs
	>(CURRENCY_CREATE, {
		onCompleted(response) {
			if (response?.CurrencyCreate) {
				message.success(`Currency ${response?.CurrencyCreate?.name} created successfully!`)
				navigate(routes.currency.path);
			}
		},
		onError: notifyGraphqlError,
	});

	const [updateCurrency, { loading: updatingCurrency }] = useMutation<
		GraphQLResponse<'CurrencyUpdate', Currency>,
		MutationCurrencyUpdateArgs
	>(CURRENCY_UPDATE, {
		onCompleted(response) {
			if (response?.CurrencyUpdate) {
				message.success(`Currency ${response?.CurrencyUpdate?.name} updated successfully!`)
				navigate(routes.currency.path);
			}
		},
		onError: notifyGraphqlError,
	});

	const onSubmitForm = (values: any) => {
		if (props.currency) {
			const input: CurrencyUpdateInput = {
				id:params.id as string,
				name: values.name,
				symbol: values.symbol,
			}


			updateCurrency({
				variables: {
					input,
				},
			})

		}
		else {
			const input: CurrencyCreateInput = {
				name: values.name,
				symbol: values.symbol,
			}


			createCurrency({
				variables: {
					input,
				},
			})
		}
	}

	let initialValues: any;
	if (props.currency) {
		const currency = props.currency;
		initialValues = {
			name: currency.name,
			symbol: currency.symbol,
		}
	}

	return (
		<>
			<Form initialValues={initialValues} form={form} layout="vertical" onFinish={onSubmitForm}>
				<Row gutter={[24, 24]} style={{ marginTop: '2rem' }}>
					<Col xs={24} sm={24} md={12}>
						<Form.Item
							label="Currency Name"
							name="name"
							rules={[
								{
									required: true,
									message: "Enter a currency name.",
								},
								{
									max: 12,
									message: "Name should be less than 12 character",
								},
							]}
						>
							<Input
								placeholder="Enter Name of the currency"
								autoComplete="off"
							/>
						</Form.Item>
					</Col>

					<Col xs={24} sm={24} md={12}>
						<Form.Item
							label="Symbol"
							name="symbol"
							rules={[
								{
									required: true,
									message: "Enter a symbol"
								},
							]}
						>
							<Input placeholder="Enter symbol" autoComplete="off" />
						</Form.Item>
					</Col>

				</Row>
				<Row justify="end">
					<Col>
						<Form.Item>
							<Space size={"large"}>
								<Button type="default" htmlType="button" onClick={() => navigate(routes.currency.path)}>
									Cancel
								</Button>
								<Button type="primary" htmlType="submit"
									loading={creatingCurrency || updatingCurrency}
								>
									{props.currency ? 'Save' : 'Add Currency'}
								</Button>
							</Space>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</>
	)
}

export default CurrencyForm