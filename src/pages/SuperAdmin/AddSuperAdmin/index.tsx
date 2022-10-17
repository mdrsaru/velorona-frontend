import { Button, Card, Col, Form, Input, message, Row, Select, Space } from "antd"
import { ArrowLeftOutlined } from "@ant-design/icons"

import styles from './styles.module.scss'
import { useNavigate } from 'react-router-dom';
import { gql, useMutation, useQuery } from "@apollo/client";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import { AdminRole, MutationUserAdminCreateArgs, MutationUserUpdateArgs, User, UserPagingResult } from "../../../interfaces/generated";
import { USER, USER_UPDATE } from "../../Employee";
import constants from "../../../config/constants";
import { useParams } from 'react-router-dom';
import routes from "../../../config/routes";
import { useEffect } from "react";

export const ADMIN_CREATE = gql`
  mutation UserAdminCreate($input: UserAdminCreateInput!) {
      UserAdminCreate(input: $input) {
        id
        email
        phone
        firstName
        middleName
        lastName
        fullName
        status
        archived
        avatar_id
        avatar {
          id
          url
          name
        }
        activeClient {
          id
          name
        }
        address {
          city
          streetAddress
          zipcode
          state
          aptOrSuite
        }
        company {
          id
          name
        }
        roles {
          id
          name
        }
      }
  }
`

const { Option } = Select

interface UserResponseArray {
	User: UserPagingResult
}
const AddSuperAdmin = () => {
	const params = useParams();
	const [form] = Form.useForm();
	const navigate = useNavigate();

	const { data: userData } = useQuery(USER, {
		variables: {
			input: {
				query: {
					id: params?.id,
				},
			},
		},
	});

	const [adminCreate, { loading: creatingAdmin }] = useMutation<GraphQLResponse<'UserAdminCreate', User>,
		MutationUserAdminCreateArgs
	>(ADMIN_CREATE, {
		onCompleted: (response) => {
			navigate(-1);
		},
		update(cache, { data }) {
			const userResponse = data?.UserAdminCreate;
			const existingUser = cache.readQuery<UserResponseArray>({
				query: USER,
				variables: {
					input: {
						query: {
							role: constants.roles.SuperAdmin
						},
						paging: {
							order: ['updatedAt:DESC']
						}
					}
				}
			});
			if (existingUser && userResponse) {
				cache.writeQuery({
					query: USER,
					data: {
						User: {
							data: [...existingUser?.User?.data, userResponse]
						}
					}
				})
			}
		}
	})

	const [userUpdate] = useMutation<
		GraphQLResponse<'UserUpdate', User>,
		MutationUserUpdateArgs
	>(USER_UPDATE, {
		onCompleted: () => {
			message.success({
				content: "Super admin update successful",
				className: 'custom-message'
			})
			navigate(routes.superAdmin.path)
		}
	});

	const onSubmitForm = (values: any) => {

		if (params.id) {
			const values = form.getFieldsValue(true, (meta) => meta.touched);
			if (Object.keys(values).length !== 0) {
				let formData: any = { id: params?.eid };
				let address: any = {};
				for (let data in values) {
					if (
						data === "country" ||
						data === "streetAddress" ||
						data === "state" ||
						data === "city" ||
						data === "zipcode" ||
						data === "aptOrSuite"
					) {
						address[data] = values[data];
						formData["address"] = address;
					} else if (data !== "upload") {
						formData[data] = values[data];
					}
					else if (values?.roles) {
						formData["roles"] = [values?.roles]
					}
				}
				formData.id = params.id;
				userUpdate({
					variables: {
						input: formData,
					},
				});
			}
		}
			else {
				adminCreate({
					variables: {
						input: {
							email: values.email,
							phone: values.phone,
							firstName: values.firstName,
							middleName: values.middleName,
							lastName: values.lastName,
							status: values.status,
							roles: [AdminRole.SuperAdmin],
							address: {
								country: values.country,
								streetAddress: values.streetAddress,
								state: values.state,
								city: values.city,
								zipcode: values.zipcode
							}
						}
					}
				})
			}

		}

	const cancelAddSuperAdmin = () => {
		navigate(-1);
	}

	const user = userData?.User?.data?.[0];

	let defaultValues: any;
	if (userData && params?.id) {
		const user = userData?.User?.data?.[0];
		defaultValues = {
			email: user?.email ?? "",
			firstName: user?.firstName ?? "",
			middleName: user?.middleName ?? "",
			lastName: user?.lastName ?? "",
			phone: user?.phone ?? "",
			roles: user?.roles[0]?.name ?? "",
			status: user?.status ?? "",
			manager_id: user?.manager_id ?? "",
			country:
				user?.address?.country ?? "",
			streetAddress:
				user?.address?.streetAddress ?? "",
			entryType: user?.entryType,
			timesheet_attachment: user?.timesheet_attachment ? 'Mandatory' : 'Optional',
			state: user?.address?.state ?? "",
			city: user?.address?.city ?? "",
			file: user?.avatar?.url,
			zipcode: user?.address?.zipcode ?? "",
			aptOrSuite: user?.address?.aptOrSuite ?? "",
			payRate: user?.record?.payRate ?? ""
		}
	}
	useEffect(() => {
		form.setFieldsValue(defaultValues)
	}, [form, defaultValues])
	return (
		<div className={styles['main-div']}>
			<Card bordered={false}>
				<Row>
					<Col
						span={12}
						className={styles['employee-col']}>
						<h1>
							<ArrowLeftOutlined onClick={() => navigate(-1)} />
							&nbsp; {params?.id ? 'Edit' : 'Add New'} Super Admin
						</h1>
					</Col>
				</Row>
				<Form
					form={form}
					layout="vertical"
					scrollToFirstError
					initialValues={{defaultValues}}
					onFinish={onSubmitForm}>
					<Row gutter={[32, 0]}>
						<Col className={styles['form-header']}>
							<p>User Information</p>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}>
							<Form.Item
								label="First Name"
								name='firstName'
								rules={[{
									required: true,
									message: 'Please enter the firstname'
								}]}>
								<Input placeholder="Enter firstname" autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}>
							<Form.Item
								label="Middle Name"
								name='middleName'>
								<Input placeholder="Enter middle name" autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}
							className={styles.formCol}>
							<Form.Item
								label="Last Name"
								name='lastName'
								rules={[{
									required: true,
									message: 'Please select the lastname'
								}]}>
								<Input placeholder="Enter lastname" autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={12}
							lg={12}>
							<Form.Item
								label="Email"
								name='email'

								rules={[{
									type: 'email',
									message: 'The input is not valid E-mail!'
								}, {
									required: true,
									message: 'Please input your E-mail!'
								}]}>
								<Input placeholder="Enter your email" autoComplete="off" disabled={params?.id ? true : false} />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={12}
							lg={12}>
							<Form.Item
								label="Phone Number"
								name='phone'
								rules={[{
									required:true,
									message: 'Please enter phone number!'
								},
								{
									max: 11,
									message: "Phone number should be less than 11 digits"
								  }]}
							>
								<Input placeholder="Enter your phone number" autoComplete="off" />
							</Form.Item>
						</Col>
						<Col className={styles['form-header']}>
							<p>Address</p>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}
							className={styles.formCol}>
							<Form.Item
								name="country"
								label="Country"
								rules={[{
									required: true,
									message: 'Please enter country!'
								}]}>
								<Input
									placeholder="Enter the country"
									autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}>
							<Form.Item
								label="State"
								name='state'
								rules={[{
									required: true,
									message: 'Please enter your state!'
								}]}>
								<Input
									placeholder="Enter the state"
									name='state'
									autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}>
							<Form.Item
								label="City"
								name='city'
								rules={[{
									required: true,
									message: 'Please enter your city!'
								}]}>
								<Input
									placeholder="Enter the city "
									name='city'
									autoComplete="off" />
							</Form.Item>
						</Col>
						<Col
							xs={24}
							sm={24}
							md={8}
							lg={8}>
							<Form.Item
								label="Street Address"
								name='streetAddress'
								rules={[{
									required: true,
									message: 'Please enter your street address!'
								}]}>
								<Input
									placeholder="Enter street address"
									name='street'
									autoComplete="off" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={8} lg={8}>
							<Form.Item
								label="Apartment/Suite"
								name='aptOrSuite'>
								<Input
									placeholder="Enter your apartment no"
									name=''
									autoComplete="off" />
							</Form.Item>
						</Col>
						<Col xs={24} sm={24} md={8} lg={8}>
							<Form.Item
								label="Zip Code"
								name='zipcode'
								rules={[{
									required: true,
									message: 'Please select the zipcode'
								}]}>
								<Input placeholder="Enter the zipcode" autoComplete="off" />
							</Form.Item>
						</Col>


						<Col
							xs={24}
							sm={24}
							md={12}
							lg={12}>
							<Form.Item
								name="status"
								label="User Status"
								rules={[{
									required: true,
									message: 'Please select the status'
								}]}>
								<Select placeholder="Select status">
									<Option value="Active">Active</Option>
									<Option value="Inactive">In Active</Option>

								</Select>
							</Form.Item>
						</Col>
					</Row>
					<Row justify="end">
						<Col style={{ padding: '0 1rem 1rem 0' }}>
							<Form.Item>
								<Space>
									<Button
										type="default"
										htmlType="button"
										onClick={cancelAddSuperAdmin}
									>
										Cancel
									</Button>
									<Button
										loading={creatingAdmin}
										type="primary"
										htmlType="submit">
										Add Super Admin
									</Button>
								</Space>
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Card>
		</div >
	)
}

export default AddSuperAdmin
