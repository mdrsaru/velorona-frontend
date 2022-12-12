import { useMutation } from "@apollo/client";
import { Card, Form, message } from "antd";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { authVar } from "../../../../App/link";
import routes from "../../../../config/routes";
import { MutationClientCreateArgs, ClientCreateInput, InvoiceSchedule, Client } from "../../../../interfaces/generated";
import { GraphQLResponse } from "../../../../interfaces/graphql.interface";
import { notifyGraphqlError } from "../../../../utils/error";
import { CLIENT_CREATE } from "../../../Client/NewClient";
import ClientForm from "../../../Client/NewClient/ClientForm"

import styles from '../../style.module.scss'
const AddNewClient = () => {
	const authData = authVar();
	const params = useParams()
	const navigate = useNavigate();

	const [clientCreate, { loading: creatingClient }] = useMutation<
		GraphQLResponse<'CleintCreate', Client>,
		MutationClientCreateArgs
	>(CLIENT_CREATE);
	const [form] = Form.useForm();

	const cancelAddClient = () => {
		navigate(-1);
	}

	const onSubmitForm = (values: any) => {
		let key = 'message';
		const input: ClientCreateInput = {
			name: values.name,
			email: values.email,
			invoicingEmail: values.invoicingEmail,
			company_id: authData?.company?.id as string,
			phone: values?.phone,
			invoiceSchedule: values.invoiceSchedule,
			invoice_payment_config_id: values.invoice_payment_config_id,
			address: {
				country: values.country,
				streetAddress: values.streetAddress,
				state: values.state,
				city: values.city,
				zipcode: values.zipcode
			}
		}

		if (values.invoiceSchedule === InvoiceSchedule.Biweekly || values.invoiceSchedule === InvoiceSchedule.Custom) {
			input['scheduleStartDate'] = values.scheduleStartDate ? moment(values.scheduleStartDate).format('YYYY-MM-DD') : null;
		} else {
			input['scheduleStartDate'] = null;
		}

		clientCreate({
			variables: {
				input,
			}
		}).then((response) => {
			if (response.errors) {
				return notifyGraphqlError((response.errors))
			} else if (response?.data) {
				navigate(routes.redirectToClientInfoTab.path(
					authData?.company?.code ?? "1",
					params?.eid ?? "1", 'client'
				))
				message.success({ content: `New Client is created successfully!`, key, className: 'custom-message' });
			}
		}).catch(notifyGraphqlError)
	}


	return (
		<Card>
			<div style={{ margin: '1rem' }}>
				<span className={styles['add-title']}>Client Information</span>
			</div>
			<ClientForm
				loading={creatingClient}
				onSubmitForm={onSubmitForm}
				btnText={'Add Client'}
				form={form}
				cancelAddClient={cancelAddClient} />
		</Card>

	)
}


export default AddNewClient