import { useEffect } from "react";
import { useQuery,  useMutation } from "@apollo/client";
import { Row, Col, Form, Select, InputNumber, Space, Button, message, Card } from "antd"
import { ArrowLeftOutlined} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import { authVar } from "../../../App/link";
import { USER_PAYRATE_CREATE } from "../../../components/UserPayRate";
import { USER_PAY_RATE } from "../../../components/ViewUserPayRate";
import routes from "../../../config/routes";
import { CurrencyPagingResult, MutationUserPayRateCreateArgs, QueryCurrencyArgs, UserPayRate } from "../../../interfaces/generated";
import { GraphQLResponse, UserPayRatePagingData } from "../../../interfaces/graphql.interface";
import { CURRENCY } from "../../Currency";
import { PROJECT } from "../../Project";

import styles from '../AttachProject/styles.module.scss'
import { notifyGraphqlError } from "../../../utils/error";

const AddUserPayRate =() =>{
	let params = useParams();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const loggedInUser = authVar();

	const { data: userProjectData } = useQuery(PROJECT, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "cache-first",
    variables: {
      input: {
        query: {
          company_id: loggedInUser?.company?.id,
          user_id: params?.eid,
        },
        paging: {
          order: ["updatedAt:DESC"],
        },
      },
    },
  });

	const { data: currencyData } = useQuery<
	GraphQLResponse<'Currency', CurrencyPagingResult>,
	QueryCurrencyArgs
>(CURRENCY, {
	fetchPolicy: 'network-only',
	nextFetchPolicy: 'cache-only'
});

const { data: userPayRate } = useQuery<UserPayRatePagingData>(USER_PAY_RATE,
	{
		fetchPolicy: "network-only",
		nextFetchPolicy: 'cache-first',
		variables: {
			input: {
				query: {
					user_id: params?.eid,
				}
			}
		}
	})


	
	const [userPayRateCreate] = useMutation<
	GraphQLResponse<'UserPayRateCreate', UserPayRate>, MutationUserPayRateCreateArgs
>(USER_PAYRATE_CREATE, {
	refetchQueries: [
		{
			query: USER_PAY_RATE,
			variables: {
				input: {
					query: {
						user_id: params?.eid,
					},
					paging: {
						order: ["updatedAt:DESC"],
					},
				},
			},
		},

		'UserPayRate'
	],
	onCompleted() {
		message.success({
			content: `User pay rate added successfully!`,
			className: "custom-message",
		});
		navigate(routes.user.path(loggedInUser?.company?.code ?? ''));
	},
	onError(err) {
		return notifyGraphqlError(err);

	}
})

	const project_ids: any = [];

  userProjectData?.Project?.data?.forEach((project: any, index: number) => {
    project_ids.push({ id: project?.id, name: project?.name })
  })

  const ids: any = []

  userPayRate?.UserPayRate?.data?.forEach((userPayRate: any, index: number) => {
    ids.push({ id: userPayRate?.project?.id, name: userPayRate?.project?.name })
  })

  let projectList = project_ids.filter(function (objOne: any) {
    return !ids.some(function (objTwo: any) {
      return objOne.id === objTwo.id;
    });
  });

  let defaultValues: any;
  if (currencyData) {
    defaultValues = {
      user_rate_currency_id: currencyData?.Currency?.data?.[0]?.id,
      invoice_rate_currency_id: currencyData?.Currency?.data?.[0]?.id,
    }
  }

	useEffect(() => {
		form.setFieldsValue(defaultValues)
}, [form, defaultValues])

	const selectUserRateCurrency = (
		<Form.Item name='user_rate_currency_id' className={styles['form-select-item']}>
			<Select style={{ width: '5rem' }} placeholder='Symbol'>
				{currencyData?.Currency?.data?.map((currency, index) => (
					<Select.Option
						value={currency.id}
						key={index}
					>
						{currency.symbol}
					</Select.Option>
				))}
			</Select>
		</Form.Item>
	);


	const selectInvoiceRateCurrency = (
		<Form.Item name='invoice_rate_currency_id' className={styles['form-select-item']}>
			<Select style={{ width: '5rem' }} placeholder='Symbol'>
				{currencyData?.Currency?.data?.map((currency, index) => (
					<Select.Option
						value={currency.id}
						key={index}

					>
						{currency.symbol}
					</Select.Option>
				))}

			</Select>
		</Form.Item>
	);

	const onCancel = () => {
		navigate(routes.user.path(loggedInUser?.company?.code ?? ''));
	}

	const onSubmitUserPaymentForm = (values: any) => {
    form.resetFields()

    const input: any = {
      user_id:params?.eid,
      project_id: values.project_id,
      amount: values.payRate,
      invoiceRate: values.invoiceRate,
      company_id: loggedInUser.company?.id as string,
      user_rate_currency_id : values.user_rate_currency_id,
      invoice_rate_currency_id : values.invoice_rate_currency_id,


    }

    userPayRateCreate({
      variables: {
        input: input
      }
    })
  };

	return(
		<div className={styles["main-div"]}>
		<Card bordered={false} className={styles['card']}>
		<div className={styles["user-pay-rate"]}>
							<Row>
						<Col span={12} className={styles["employee-col"]}>
							<h1>
								<ArrowLeftOutlined
									onClick={() => navigate(-1)} />
								&nbsp;
								Add Payment
							</h1>
						</Col>
					</Row>
						
						<Form
							form={form}
							layout="vertical"
							name="payrate-form"
							initialValues={defaultValues}
							onFinish={onSubmitUserPaymentForm}>
							<Row gutter={[24, 0]}>
								<Col
									xs={24}
									sm={24}
									md={24}
									lg={24}>
									<Form.Item
										label="Project Name"
										name="project_id"
										rules={[{
											required: true,
											message: 'Please select project'
										}]}>
										<Select placeholder="Select Project">
											{projectList?.map((project: any, index: number) => (
												<Select.Option value={project?.id} key={index}>
													{project?.name}
												</Select.Option>
											))}
										</Select>
									</Form.Item>
								</Col>
								<Col
									xs={24}
									sm={24}
									md={12}
									lg={12}>
									<Form.Item
										label="Invoice rate"
										name="invoiceRate">
										<InputNumber
											addonBefore={selectInvoiceRateCurrency}
											addonAfter="Hr"
											placeholder="Enter invoice rate"
											autoComplete="off"
											style={{ width: '100%' }} />
									</Form.Item>
								</Col>
								<Col
									xs={24}
									sm={24}
									md={12}
									lg={12}>
									<Form.Item
										label="Payrate"
										name="payRate">
										<InputNumber
											addonBefore={selectUserRateCurrency}
											addonAfter="Hr"
											placeholder="Enter payrate"
											autoComplete="off"
											style={{ width: '100%' }} />
									</Form.Item>
								</Col>



							</Row>
							<Row justify="end">
								<Col style={{ padding: '0 1rem 1rem 0' }}>
									<Form.Item name="action-button">
										<Space>
											<Button
												type="default"
												htmlType="button"
												onClick={onCancel}>
												Cancel
											</Button>
											<Button
												type="primary"
												htmlType="submit">
												Continue
											</Button>
										</Space>
									</Form.Item>
								</Col>
							</Row>
						</Form>
						</div>
						</Card>
						</div>
	)
}

export default AddUserPayRate