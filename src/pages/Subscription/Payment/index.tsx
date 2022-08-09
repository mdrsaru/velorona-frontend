import { useState, FormEvent } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Form, Input, Button, message } from 'antd';

import { plansVar, currentPlanVar } from '../../../App/link'
import { IPlan } from '../../../interfaces/subscription.interface';

import './stripe.scss';

interface IProps {
  clientSecret: string;
  subscriptionId: string;
  hidePaymentModal: () => void;
}

const Payment = (props: IProps) => {
  const clientSecret = props.clientSecret;
  const subscriptionId = props.subscriptionId;
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  if (!stripe || !elements) {
    return <></>;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    const cardElement = elements.getElement(CardElement);

    try {
      let { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: values.name,
          }
        }
      });

      if(paymentIntent) {
        message.success('Payment successful')

        const plans = plansVar();
        let currentPlan: IPlan | undefined;
        const newPlans = plans.map((plan) => {
          const _plan = { ...plan };
          if(plan.name === 'Professional') {
            _plan.subscriptionStatus = 'active';

            currentPlan = _plan;
          } else if(plan.name === 'Starter') {
            _plan.subscriptionStatus = 'inactive';
            currentPlan =  _plan;
          }

          return _plan;
        })

        // Update the plansvar with active professional plan
        plansVar(newPlans)

        // Update the currentVar with active professional plan
        if(currentPlan) {
          currentPlanVar(currentPlan)
        }

        props.hidePaymentModal();
      } else if(error) {
        message.error(error.message);
      }
    } catch(err) {
      message.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: '#F2F2F2',
    padding: '16px',
    fontFamily: 'Montserrat',
  }

  return (
    <Form 
      layout="vertical"
      onFinish={onFinish}
    >
      <div>
        <h3>Plan Details </h3>
        <p><b>Price</b>: $10</p>
        <p><b>Description</b>: Professional</p>
      </div>

      <hr style={{ margin: '16px 0', borderTop: '1px solid var(--gray-secondary)' }} />

      <Form.Item
        name="name"
        label="Name"
      >
        <Input placeholder="Name" />
      </Form.Item>

      <Form.Item label="Card Details" >
        <div className="stripe">
          <CardElement 
            options={{
              style: {
                base: {
                  fontWeight: '600',
                  fontSize: '18px',
                  '::placeholder': {
                    color: '#bfbfbf',
                  },

                }
              } 
            }}
          />
        </div>
      </Form.Item>

      <Button loading={loading} type="primary" htmlType="submit">
        Pay
      </Button>
    </Form>
  )
}

export default Payment;

