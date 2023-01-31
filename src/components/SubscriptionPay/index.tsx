import { CardNumberElement, Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { Button, Form, message, Modal } from "antd";
import { stripeSetting } from '../../config/constants';
import { loadStripe } from '@stripe/stripe-js';
import { gql, useMutation } from "@apollo/client";
import { notifyGraphqlError } from "../../utils/error";
import { useState } from 'react';

interface IProps{
	visibility:boolean;
	setModalVisibility:any;
}

export const CREATE_PAYMENT_INTENT = gql`
  mutation CreatePaymentIntent($input: CreatePaymentIntentInput!) {
    CreatePaymentIntent(input: $input){
			clientSecret
			}
		}
`;

const SubscriptionPay = (props:IProps) =>{
	const stripe = useStripe();
  const elements = useElements();
	const [form] = Form.useForm();
	const [clientSecret,setClientSecret] = useState('')

	const [subscriptionPayment, { loading: paymentLoading }] = useMutation(CREATE_PAYMENT_INTENT, {
    onCompleted: (response) => {
      console.log(response)
			setClientSecret(response?.CreatePaymentIntent?.clientSecret)
    },
    onError: notifyGraphqlError,
  })
	const onFinish = async () => {
			if (!stripe || !elements) {
				return;
			}
			try {
				// const cardElement = elements.getElement(CardNumberElement);
				// await subscriptionPayment({
				// 	variables:{
				// 		input:{
							
				// 		}
				// 	}
				// })

				// var cardNumberElement = elements.create("cardNumber");
				// var cardExpiryElement = elements.create("cardExpiry");
				// var cardCvcElement = elements.create("cardCvc");

        // console.log(cardNumber, cardCVC, cardExpiry);
				// const { error } = await stripe.confirmPayment({
				//   elements,
				//   // clientSecret:'pi_3MVs2cLea2Z7YpN43NyCvnjL_secret_GOxhw7a6ZYqM8lMteto4sivRx',
				//   // redirect: 'if_required',
				// });

				// console.log(error)
				// console.log(cardElement)
				// console.log(clientSecret)

				// const result = await stripe.confirmPayment({
				// 	//`Elements` instance that was used to create the Payment Element
				// 	clientSecret,
				// 	// confirmParams: {
				// 	// 	return_url: "https://example.com/order/123/complete",
				// 	// },
				// });

				// let { error, paymentIntent } = await stripe.co('pi_3MWEQZLea2Z7YpN42kRG09Fi_secret_cNX0SZZj3aKxLBkPwZlcpHj0a', {
				// 	payment_method: {
				// 		card: elements.getElement(CardNumberElement),
					
				// 	},
				// 	setup_future_usage: 'off_session'
				// })
				// console.log(paymentIntent,error)
				// const paymentMethod = await stripe.paymentMethods?.create({
				// 	type: 'card',
				// 	card:elements
				// });

				// console.log(paymentMethod)
				  // props.setModalVisibility(false);
				  // window.location.reload()
				  // message.info({ content: 'The change will take some time to appear on Stripe.', duration: 15 })
	
				  // message.success('Payment details updated.')
				}
			
			catch (err) {
				console.log(err);
			} 
	}

	return(
		<Modal
			centered
			footer={null}
			visible={props?.visibility}
			onCancel={() => props?.setModalVisibility(false)}
			okText='Add Project'
			cancelText='Close '
		>
			<p>Add</p>
			 <Form form={form} onFinish={onFinish} >
				<Elements stripe={loadStripe(stripeSetting.publishableKey)}
				options={{
                clientSecret: clientSecret
              }}>
			 <PaymentElement
          />
					</Elements>
			<Button
        // loading={loading}
        type="primary"
        htmlType="submit"
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>
			</Form>
			</Modal>
	)
}

export default SubscriptionPay