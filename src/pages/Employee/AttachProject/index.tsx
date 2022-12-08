import { Card, Row, Col, Form, Select, Button } from "antd"
import { ArrowLeftOutlined} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import styles from './styles.module.scss'
import { authVar } from "../../../App/link";
import { gql, useMutation, useQuery } from "@apollo/client";
import { PROJECT } from "../../Project";
import { GraphQLResponse } from "../../../interfaces/graphql.interface";
import {  MutationAttachProjectToUserArgs,  User } from "../../../interfaces/generated";
import routes from '../../../config/routes';

export const ATTACH_PROJECT = gql`
    mutation AttachProjectToUser($input: AttachProjectInput!) {
			AttachProjectToUser(input: $input) {
            id
        }
    }
`

const AttachProject = () => {
	let params = useParams();
	const navigate = useNavigate();
	const [form] = Form.useForm();
	const loggedInUser = authVar();

	const { Option } = Select;
	const selectProps = {
		placeholder: "Select Employees",
		mode: "multiple" as const,
		style: { width: "100%" }
	};

	const { data: projectData } = useQuery(PROJECT, {
		variables: {
			input: {
				query: {
					company_id: loggedInUser?.company?.id,
					client_id: params?.cid,
				},
			}
		}
	})

	const [attachProject] = useMutation<
		GraphQLResponse<'ClientCreate', User>,
		MutationAttachProjectToUserArgs
	>(ATTACH_PROJECT, {
		onCompleted(response) {
			navigate(routes.addUserPayRate.path(loggedInUser?.company?.code as string, params?.eid as string, params?.cid as string))
		}
	});

	const onSubmitForm = (values: any) => {
		attachProject({
			variables: {
				input: {
					user_id: [params?.eid as string],
					project_ids: values?.project_ids,
				}
			}
		})
	}

	return (
		<div className={styles["main-div"]}>
			<Card bordered={false} className={styles['card']}>
						<>
						<Row>
						<Col span={12} className={styles["employee-col"]}>
							<h1>
								<ArrowLeftOutlined
									onClick={() => navigate(-1)} />
								&nbsp;
								Attach Project
							</h1>
						</Col>
					</Row>
						<Form
							form={form}
							layout="vertical"
							scrollToFirstError
							onFinish={onSubmitForm}
							
						>
							<Row gutter={[24, 0]}>
								<Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>
									<Form.Item
										name="project_ids"
										label="Project"
										style={{ position: "relative" }}>
										<Select
											{...selectProps}
											allowClear
											placeholder="Please select projects">
											{	projectData?.Project?.data?.length &&
													projectData?.Project?.data?.map((project: any, index: number) => (
													<Option
														value={project?.id}
														key={index + 1}>
														{project?.name}
													</Option>
												))

											}
										</Select>
									</Form.Item>
								</Col>
								<Button type="primary" htmlType="submit">Attach Project</Button>
							</Row>
						</Form>
						</>
					
			</Card>
		</div>
	)
}

export default AttachProject