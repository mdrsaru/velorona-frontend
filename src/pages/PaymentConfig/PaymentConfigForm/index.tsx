import { Form, Row, Col, Input, Button, Space, message } from "antd"
import routes from "../../../config/routes"
import { useNavigate } from 'react-router-dom';
import { notifyGraphqlError } from "../../../utils/error";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { gql, useMutation } from "@apollo/client";
import { useParams } from 'react-router-dom';
import { InvoicePaymentConfig, InvoicePaymentConfigCreateInput, InvoicePaymentConfigUpdateInput, MutationInvoicePaymentConfigCreateArgs, MutationInvoicePaymentConfigUpdateArgs } from "../../../interfaces/generated";

const INVOICE_PAYMENT_CONFIG_CREATE = gql`
  mutation InvoicePaymentConfigCreate($input: InvoicePaymentConfigCreateInput!) {
    InvoicePaymentConfigCreate(input: $input) {
      id
      name
			days
    }
  }
`;

const INVOICE_PAYMENT_CONFIG_UPDATE = gql`
  mutation InvoicePaymentConfigUpdate($input: InvoicePaymentConfigUpdateInput!) {
    InvoicePaymentConfigUpdate(input: $input) {
      id
      name
			days
    }
  }
`;


interface IProps {
	invoicePaymentConfig?: any
}

const PaymentConfigForm = (props: IProps) => {
	const [form] = Form.useForm();
	const params = useParams();

	const navigate = useNavigate()


	const [createInvoicePaymentConfig, { loading: creatingInvoicePaymentConfig }] = useMutation<
		GraphQLResponse<'InvoicePaymentConfigCreate', InvoicePaymentConfig>,
		MutationInvoicePaymentConfigCreateArgs
	>(INVOICE_PAYMENT_CONFIG_CREATE, {
		onCompleted(response) {
			if (response?.InvoicePaymentConfigCreate) {
				message.success(`InvoicePaymentConfig ${response?.InvoicePaymentConfigCreate?.name} created successfully!`)
				navigate(routes.invoicePaymentConfig.path);
			}
		},
		onError: notifyGraphqlError,
	});

	const [updatePaymentConfig, { loading: updatingInvoicePaymentConfig }] = useMutation<
		GraphQLResponse<'InvoicePaymentConfigUpdate', InvoicePaymentConfig>,
		MutationInvoicePaymentConfigUpdateArgs
	>(INVOICE_PAYMENT_CONFIG_UPDATE, {
		onCompleted(response) {
			if (response?.InvoicePaymentConfigUpdate) {
				message.success(`InvoicePaymentConfig ${response?.InvoicePaymentConfigUpdate?.name} updated successfully!`)
				navigate(routes.invoicePaymentConfig.path);
			}
		},
		onError: notifyGraphqlError,
	});

	const onSubmitForm = (values: any) => {
		if (props.invoicePaymentConfig) {
			const input: InvoicePaymentConfigUpdateInput = {
				id:params.id as string,
				name: values.name,
				days: Number(values.days),
			}


			updatePaymentConfig({
				variables: {
					input,
				},
			})

		}
		else {
			const input: InvoicePaymentConfigCreateInput = {
				name: values.name,
				days: Number(values.days),
			}


			createInvoicePaymentConfig({
				variables: {
					input,
				},
			})
		}
	}

	let initialValues: any;
	if (props.invoicePaymentConfig) {
		const paymentConfig = props.invoicePaymentConfig;
		initialValues = {
			name: paymentConfig.name,
			days: paymentConfig.days,
		}
	}

	return (
		<>
			<Form initialValues={initialValues} form={form} layout="vertical" onFinish={onSubmitForm}>
				<Row gutter={[24, 24]} style={{ marginTop: '2rem' }}>
					<Col xs={24} sm={24} md={12}>
						<Form.Item
							label="Invoice Payment Name"
							name="name"
							rules={[
								{
									required: true,
									message: "Enter a invoice payment name.",
								},
							]}
						>
							<Input
								placeholder="Enter Name of the invoice payment"
								autoComplete="off"
							/>
						</Form.Item>
					</Col>

					<Col xs={24} sm={24} md={12}>
						<Form.Item
							label="Days"
							name="days"
							rules={[
								{
									required: true,
									message: "Enter days"
								},
							]}
						>
							<Input placeholder="Enter days" autoComplete="off" />
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
									loading={creatingInvoicePaymentConfig || updatingInvoicePaymentConfig}
								>
									{props.invoicePaymentConfig ? 'Save' : 'Add Invoice Payment Config'}
								</Button>
							</Space>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</>
	)
}

export default PaymentConfigForm