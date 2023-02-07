import { useState } from 'react';
import {
  useStripe,
  useElements,
  CardExpiryElement,
} from '@stripe/react-stripe-js';
import { Form, Button, message, Spin } from 'antd';

import styles from '../style.module.scss'
import { GraphQLResponse } from '../../../interfaces/graphql.interface';
import { gql, useMutation, useQuery } from '@apollo/client';
import { CompanyPagingResult, MutationCompanyUpdateArgs, QueryCompanyArgs, QuerySubscriptionPaymentArgs, SubscriptionPaymentPagingResult, SubscriptionPaymentStatus } from '../../../interfaces/generated';
import { ICompany } from '../../../interfaces/ICompany';
import { notifyGraphqlError } from '../../../utils/error';
import { COMPANY, COMPANY_UPDATE } from '../../Company';
import  { collection_method } from '../../../config/constants';
import CardDetail from '../../../components/CardDetail';
import { CardElement } from '@stripe/react-stripe-js';
import { SUBSCRIPTION_PAYMENT } from '../../Payment';

interface IProps {
  clientSecret: string;
  hidePaymentUpdateModal: () => void;
  companyId: string;
}

export const RETRIEVE_CUSTOMER = gql`
  query RetrieveCustomer($input:CompanyByIdInput) {
    RetrieveCustomer(input:$input) {
       id
       customer 
       type
       card {
          last4
          exp_month
          exp_year
          brand
           }
        }
       }
`

export const SUBSCRIPTION_PAYMENTS = gql`
  mutation SubscriptionPayment($input: SubscriptionPaymentInput!) {
    SubscriptionPayment(input: $input)

		}
`;


const UpdatePaymentDetails = (props: IProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState<any>()
  const [autoPay, setAutoPay] = useState(false)
  // const [show, setShow] = useState(false)

  const {
    data: companyData,
  } = useQuery<GraphQLResponse<'Company', CompanyPagingResult>, QueryCompanyArgs>(COMPANY, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-only',
    variables: {
      input: {
        query: {
          id: props?.companyId,
        }
      },
    },
  });

  const { data: subscriptionPaymentDetail, loading: SubscriptionPaymentLoading } = useQuery<
    GraphQLResponse<'SubscriptionPayment', SubscriptionPaymentPagingResult>,
    QuerySubscriptionPaymentArgs
  >(SUBSCRIPTION_PAYMENT, {
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'cache-first',
    variables: {
      input: {
        query: {
          company_id: props?.companyId,
          status: 'draft',
          paymentDate: null,
        },

      }
    }
  });

  const subscriptionPaymentData = subscriptionPaymentDetail?.SubscriptionPayment?.data?.[0];
  const { data: cardDetail, loading: fetchCardLoading } = useQuery(RETRIEVE_CUSTOMER, {
    variables: {
      input: {
        id: props?.companyId,
      },
    },
  }
  )
  const [updateCompany] = useMutation<
    GraphQLResponse<'CompanyUpdate', ICompany>,
    MutationCompanyUpdateArgs
  >(COMPANY_UPDATE, {
    onCompleted: (response) => {
      if (response?.CompanyUpdate) {
        message.success("The subscription has been successfully charged through automatic payments.")
      }
    },
    onError: notifyGraphqlError,
  })

  const [subscriptionPayment, { loading: paymentLoading }] = useMutation(SUBSCRIPTION_PAYMENTS, {
    onCompleted: (response) => {
      if (response?.SubscriptionPayment) {
        message.success("Subscription Payment successful")
        props?.hidePaymentUpdateModal()
      }
    },
    onError: notifyGraphqlError,
  })

  const onFinish = async () => {
    if (!stripe || !elements) {
      return;
    }
    setLoading(true);

    const cardElement = elements.getElement(CardElement);
    console.log(cardElement)
    const cardNumber = elements.getElement(CardExpiryElement)
    console.log(cardNumber)
    try {
      // const { error } = await stripe.confirmSetup({
      //   // elements,
      //   // clientSecret:'pi_3MVs2cLea2Z7YpN43NyCvnjL_secret_GOxhw7a6ZYqM8lMteto4sivRx',
      //   redirect: 'if_required',
      // });

      // if (error) {
      //   console.log(error)
      // } else {
      //   props.hidePaymentUpdateModal();
      //   window.location.reload()
      //   message.info({ content: 'The change will take some time to appear on Stripe.', duration: 15 })

      //   // message.success('Payment details updated.')
      // }

      subscriptionPayment({
        variables: {
          input: {
            customerId: card?.customer,
            cardId: card?.id,
            company_id: props?.companyId,
            subscriptionPaymentId : subscriptionPaymentData?.id,
          }
        }
      })
      {
        autoPay &&
          updateCompany({
            variables: {
              input: {
                collectionMethod: collection_method?.[0]?.value,
                id: props.companyId
              }
            }
          })
      }
    }
    catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardSelect = (card: any) => {
    setCard(card)
  }
  const handleAutoPay = (e: any) => {
    setAutoPay(e.target.checked)
  }

  // const handlePay = () => {
  //   setShow(!show)
  // }
  return (
    <Form onFinish={onFinish} >
      {/* <CardElement /> */}
      <p><b>Invoice Id :</b> {subscriptionPaymentData?.invoiceId}</p>
      <p><b>Subscription Date :</b> {subscriptionPaymentData?.periodStartDate} - {subscriptionPaymentData?.periodEndDate}</p>
      {subscriptionPaymentData?.invoiceLink &&
        <p>Invoice Link : {subscriptionPaymentData?.invoiceLink ?? ''}</p>
      }
      {paymentLoading || fetchCardLoading ?
        <Spin />
        :
        cardDetail?.RetrieveCustomer?.map((cardDetail: any) => (
          <CardDetail cardDetail={cardDetail}
            hideModal={props.hidePaymentUpdateModal}
            handleCardSelect={handleCardSelect} />
        ))

      }
      {/* <p onClick={handlePay}>Pay with Different Card</p> */}
      <div className={styles['autopay-checkbox']}>
        {
          companyData?.Company?.data?.[0]?.collectionMethod !== collection_method?.[0]?.value &&
          <>
            <input type='checkbox' onClick={handleAutoPay} name='autopay' />  <span className={styles['autopay-title']}>You authorize regularly scheduled charges to your card.</span>
            <p className={styles['autopay-description']}>You will be charged the amount indicated in your invoice for each billing period until it is cancel.
              A receipt for each payment will be provided to you and the charge will appear on your card statement.
            </p>
          </>
        }
      </div>
      <Button
        loading={loading}
        type="primary"
        htmlType="submit"
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>
      {/* <Elements
              stripe={loadStripe(stripeSetting.publishableKey)}
              // options={{
              //   clientSecret: setupIntentSecretData?.SetupIntentSecret?.clientSecret
              // }}
            >
      <SubscriptionPay
        visibility={show}
        setModalVisibility={setShow}
      />
      </Elements> */}
    </Form>
  )
}

export default UpdatePaymentDetails;
