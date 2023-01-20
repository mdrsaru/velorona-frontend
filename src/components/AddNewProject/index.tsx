import { useMutation } from '@apollo/client';
import { Button, Col, Form, Input, message, Modal, Row, Space } from 'antd';
import { authVar } from '../../App/link';
import { Project, MutationProjectCreateArgs } from '../../interfaces/generated';
import { GraphQLResponse } from '../../interfaces/graphql.interface';
import { PROJECT_CREATE } from '../../pages/Project/NewProject';
import { notifyGraphqlError } from '../../utils/error';
import styles from './styles.module.scss'

interface IProps {
	visibility: boolean;
	setVisibility: any;
	clientId: string;
	handleChangeProject: any;
}


const AddNewProject = (props: IProps) => {
	const loggedInUser = authVar();
	const [form] = Form.useForm();

	const [projectCreate] = useMutation<
		GraphQLResponse<'ProjectCreate',
			Project>, MutationProjectCreateArgs
	>(PROJECT_CREATE);

	const onSubmitForm = (values: any) => {
		let key = 'project'
		projectCreate({
			variables: {
				input: {
					name: values.name,
					company_id: loggedInUser?.company?.id as string,
					client_id: props.clientId,
				}
			}
		}).then((response) => {
			if (response.errors) {
				return notifyGraphqlError((response.errors))
			} else if (response?.data?.ProjectCreate) {
				message.success({
					content: `New Project is created successfully!`,
					key,
					className: 'custom-message'
				});
				props.setVisibility(false)

				props.handleChangeProject(response?.data?.ProjectCreate?.id)
			}
		}).catch(notifyGraphqlError)
	}

	const onCancel = () => {
		props?.setVisibility(false)
	}
	return (
		<Modal
			centered
			width={1000}
			footer={null}
			visible={props?.visibility}
			onCancel={() => props?.setVisibility(false)}
			okText='Add Project'
			cancelText='Close '
		>
			<div className={styles['title-div']}>
				<span className={styles["title"]}>
					Add Project
				</span>
			</div>
			<Form
				form={form}
				layout="vertical"
				onFinish={onSubmitForm}>
				<Row>
					<Col xs={24} sm={24} md={24} lg={24} className={styles.formCol}>
						<Form.Item
							label="Project Name"
							name='name'
							rules={[{
								required: true,
								message: 'Please enter project name!'
							}]}>
							<Input
								placeholder="Enter the project name"
								autoComplete="off" />
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
									onClick={onCancel}>
									Close
								</Button>
								<Button
									type="primary"
									htmlType="submit">
									Add Project
								</Button>
							</Space>
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	)
}

export default AddNewProject