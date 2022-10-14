import { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Form, Button, message } from 'antd';

interface IProps {
  clientSecret: string;
  hidePaymentUpdateModal: () => void;
}

const UpdatePaymentDetails = (props: IProps) => {
  const clientSecret = props.clientSecret;
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  console.log(props, 'props');

  const onFinish = async () => {
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await stripe.confirmSetup({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        console.log(error)
      } else {
        props.hidePaymentUpdateModal();
        message.success('Payment details updated.')
      }
    } catch(err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Form onFinish={onFinish}>
      <PaymentElement />

      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>

    </Form>
  )
}

export default UpdatePaymentDetails;
